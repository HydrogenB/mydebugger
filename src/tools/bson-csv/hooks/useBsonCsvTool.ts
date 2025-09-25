/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type ConverterOptions,
  type ConversionPhase,
  type InputFormat,
  type LogEntry,
  type OutputPart,
  type ProgressPayload,
  type SchemaPayload,
  type WorkerRequestMessage,
  type WorkerResponseMessage,
} from "../types";
import { detectFileFormat } from "../utils/detect";
import { createParseWorker } from "../utils/workers";
import DEFAULT_OPTIONS from "../config/defaultOptions";

const LOG_LIMIT = 500;

interface FileMeta {
  name: string;
  size: number;
  format: InputFormat | "unknown";
}

interface InternalPartBuffer {
  buffers: Uint8Array[];
  size: number;
  rows: number;
  mimeType: string;
  filename: string;
}

export interface UseBsonCsvToolResult {
  options: ConverterOptions;
  updateOptions: (updater: (prev: ConverterOptions) => ConverterOptions) => void;
  fileMeta: FileMeta | null;
  status: ConversionPhase;
  progress: ProgressPayload | null;
  schema: SchemaPayload | null;
  logs: LogEntry[];
  outputs: OutputPart[];
  error: string | null;
  hasFile: boolean;
  isRunning: boolean;
  onFileSelected: (file: File) => Promise<void>;
  onClearFile: () => void;
  onStart: () => void;
  onCancel: () => void;
  onConfirmSchema: () => void;
  clearOutputs: () => void;
  downloadLog: () => void;
}

export const useBsonCsvTool = (): UseBsonCsvToolResult => {
  const [options, setOptions] = useState<ConverterOptions>(() =>
    structuredClone(DEFAULT_OPTIONS),
  );
  const [file, setFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [status, setStatus] = useState<ConversionPhase>("idle");
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [schema, setSchema] = useState<SchemaPayload | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [outputs, setOutputs] = useState<OutputPart[]>([]);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const partBuffersRef = useRef<Map<number, InternalPartBuffer>>(new Map());
  const latestOptionsRef = useRef<ConverterOptions>(options);
  const awaitingSchemaConfirmationRef = useRef<boolean>(false);

  useEffect(() => {
    latestOptionsRef.current = options;
  }, [options]);

  const resetForNewRun = useCallback(() => {
    setProgress(null);
    setLogs([]);
    setOutputs((prev) => {
      prev.forEach((part) => URL.revokeObjectURL(part.href));
      return [];
    });
    partBuffersRef.current.clear();
    setSchema(null);
    awaitingSchemaConfirmationRef.current = false;
  }, []);

  const ensureWorker = useCallback(() => {
    if (workerRef.current) {
      return workerRef.current;
    }
    const worker = createParseWorker();
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerResponseMessage>) => {
      const message = event.data;
      switch (message.type) {
        case "PHASE": {
          setStatus(message.value);
          break;
        }
        case "PROGRESS": {
          setProgress(message.payload);
          break;
        }
        case "SCHEMA": {
          setSchema(message.payload);
          awaitingSchemaConfirmationRef.current =
            !latestOptionsRef.current.general.autoStartAfterDiscovery;
          if (awaitingSchemaConfirmationRef.current) {
            setStatus("awaiting-schema");
          }
          break;
        }
        case "LOG": {
          setLogs((prev) => {
            const next = [...prev, message.payload];
            if (next.length > LOG_LIMIT) {
              return next.slice(next.length - LOG_LIMIT);
            }
            return next;
          });
          break;
        }
        case "PART_READY": {
          const buffer = new Uint8Array(message.payload.buffer);
          const part = partBuffersRef.current.get(message.payload.partIndex);
          if (!part) {
            partBuffersRef.current.set(message.payload.partIndex, {
              buffers: [buffer],
              size: buffer.length,
              rows: 0,
              mimeType: message.payload.mimeType,
              filename: `part-${message.payload.partIndex}`,
            });
          } else {
            part.buffers.push(buffer);
            part.size += buffer.length;
          }
          break;
        }
        case "PART_DONE": {
          const existing =
            partBuffersRef.current.get(message.payload.partIndex) ?? null;
          if (existing) {
            existing.rows = message.payload.rows;
            existing.filename = message.payload.filename;
            existing.mimeType = message.payload.mimeType;
            const totalBytes = existing.size;
            const merged = mergeUint8Arrays(existing.buffers, totalBytes);
            const blob = new Blob([merged], { type: existing.mimeType });
            const href = URL.createObjectURL(blob);
            const outputPart: OutputPart = {
              filename: existing.mimeType === "application/zip"
                ? message.payload.filename
                : message.payload.filename,
              sizeBytes: blob.size,
              href,
              rows: message.payload.rows,
              mimeType: existing.mimeType,
            };
            setOutputs((prev) => {
              const next = [...prev, outputPart];
              return next.sort((a, b) => a.filename.localeCompare(b.filename));
            });
            partBuffersRef.current.delete(message.payload.partIndex);
          }
          break;
        }
        case "DONE": {
          setStatus("completed");
          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  phase: "completed",
                  etaSeconds: null,
                  rateRowsPerSec: 0,
                  rateMBPerSec: 0,
                }
              : null,
          );
          setSchema(message.payload.schema);
          message.payload.log.forEach((entry) => {
            setLogs((prev) => {
              const next = [...prev, entry];
              if (next.length > LOG_LIMIT) {
                return next.slice(next.length - LOG_LIMIT);
              }
              return next;
            });
          });
          break;
        }
        case "FAILED": {
          setStatus("failed");
          setError(message.error);
          setProgress((prev) =>
            prev
              ? {
                  ...prev,
                  phase: "failed",
                  etaSeconds: null,
                  rateRowsPerSec: 0,
                  rateMBPerSec: 0,
                }
              : null,
          );
          break;
        }
        default:
          break;
      }
    };

    worker.onerror = (event) => {
      console.error("BSON CSV worker error", event);
      setError(event.message ?? "Worker error");
      setStatus("failed");
    };

    return worker;
  }, []);

  const cleanupWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => () => {
    outputs.forEach((part) => URL.revokeObjectURL(part.href));
    cleanupWorker();
  }, [cleanupWorker, outputs]);

  const onFileSelected = useCallback(
    async (selected: File) => {
      setError(null);
      setFile(selected);
      const detectedFormat = await detectFileFormat(selected, options.format);
      setFileMeta({
        name: selected.name,
        size: selected.size,
        format: detectedFormat ?? "unknown",
      });
      resetForNewRun();
    },
    [options.format, resetForNewRun],
  );

  const onClearFile = useCallback(() => {
    setFile(null);
    setFileMeta(null);
    resetForNewRun();
  }, [resetForNewRun]);

  const postRequest = useCallback(
    (data: WorkerRequestMessage, transfer?: Transferable[]) => {
      const worker = ensureWorker();
      worker.postMessage(data, transfer ?? []);
    },
    [ensureWorker],
  );

  const onStart = useCallback(() => {
    if (!file) {
      setError("Please select a file to convert.");
      return;
    }
    resetForNewRun();
    setStatus("discovery");
    const message: WorkerRequestMessage = {
      type: "START",
      file,
      options: latestOptionsRef.current,
    };
    postRequest(message);
  }, [file, postRequest, resetForNewRun]);

  const onCancel = useCallback(() => {
    postRequest({ type: "CANCEL" });
    setStatus("cancelled");
  }, [postRequest]);

  const onConfirmSchema = useCallback(() => {
    if (!awaitingSchemaConfirmationRef.current) {
      return;
    }
    awaitingSchemaConfirmationRef.current = false;
    postRequest({ type: "CONTINUE" });
  }, [postRequest]);

  const updateOptions = useCallback((updater: (prev: ConverterOptions) => ConverterOptions) => {
    setOptions((prev) => {
      const next = updater(prev);
      latestOptionsRef.current = next;
      return next;
    });
  }, []);

  const clearOutputs = useCallback(() => {
    setOutputs((prev) => {
      prev.forEach((part) => URL.revokeObjectURL(part.href));
      return [];
    });
    partBuffersRef.current.clear();
  }, []);

  const downloadLog = useCallback(() => {
    if (!logs.length) {
      return;
    }
    const lines = logs
      .map((entry) => {
        const ts = new Date(entry.timestamp).toISOString();
        return `${ts}\t${entry.level.toUpperCase()}\t${entry.message}`;
      })
      .join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "conversion.log";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }, [logs]);

  const isRunning = useMemo(
    () => status === "discovery" || status === "conversion",
    [status],
  );

  const hasFile = useMemo(() => !!file, [file]);

  return {
    options,
    updateOptions,
    fileMeta,
    status,
    progress,
    schema,
    logs,
    outputs,
    error,
    hasFile,
    isRunning,
    onFileSelected,
    onClearFile,
    onStart,
    onCancel,
    onConfirmSchema,
    clearOutputs,
    downloadLog,
  };
};

function mergeUint8Arrays(buffers: Uint8Array[], totalBytes: number): Uint8Array {
  if (buffers.length === 1) {
    return buffers[0];
  }
  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  buffers.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });
  return merged;
}

export default useBsonCsvTool;
