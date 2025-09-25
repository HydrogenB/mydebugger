/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { ChangeEvent, DragEvent, useCallback, useMemo } from "react";
import { Button } from "../../../design-system/components/inputs";
import { TOOL_PANEL_CLASS } from "../../../design-system/foundations/layout";
import type { ConversionPhase, InputFormat } from "../types";

interface UploadZoneProps {
  fileMeta: { name: string; size: number; format: InputFormat | "unknown" } | null;
  status: ConversionPhase;
  isWorkerReady: boolean;
  onInputChange: (files: FileList | null) => void;
  onClearFile: () => void;
  onWarmup: () => void;
  error: string | null;
}

const prettyBytes = (size: number): string => {
  if (size === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : value >= 10 ? 1 : 2)} ${units[exponent]}`;
};

const UploadZone: React.FC<UploadZoneProps> = ({
  fileMeta,
  status,
  isWorkerReady,
  onInputChange,
  onClearFile,
  onWarmup,
  error,
}) => {
  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onInputChange(event.target.files);
    },
    [onInputChange],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onInputChange(event.dataTransfer.files);
    },
    [onInputChange],
  );

  const statusLabel = useMemo(() => {
    switch (status) {
      case "discovery":
        return "Running discovery pass";
      case "awaiting-schema":
        return "Awaiting schema confirmation";
      case "conversion":
        return "Writing CSV output";
      case "paused":
        return "Paused";
      case "cancelled":
        return "Cancelled";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return isWorkerReady ? "Ready" : "Initializing";
    }
  }, [status, isWorkerReady]);

  return (
    <div className={`${TOOL_PANEL_CLASS} space-y-4`}>
      <div
        className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center transition-colors hover:border-primary-500 dark:hover:border-primary-400 bg-white dark:bg-gray-800"
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Drag & drop your `.bson`, `.json`, `.ndjson`, or `.txt` file here
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Files are processed locally. Maximum recommended size: ~2 GB NDJSON / 1 GB BSON.
        </p>
        <label
          htmlFor="bson-csv-file-input"
          className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-primary-700"
        >
          Choose File
          <input
            id="bson-csv-file-input"
            type="file"
            accept=".bson,.json,.ndjson,.txt,application/json,text/plain,application/octet-stream"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="space-y-1">
          <div className="font-medium text-gray-800 dark:text-gray-100">Worker status: {statusLabel}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {isWorkerReady
              ? "Worker warmed up. Ready for heavy processing."
              : "Tip: warm up the worker before loading huge files."}
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={onWarmup} disabled={isWorkerReady}>
          {isWorkerReady ? "Worker Ready" : "Warm Up Worker"}
        </Button>
      </div>

      {fileMeta ? (
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Selected file</span>
            <Button size="xs" variant="ghost" onClick={onClearFile}>
              Remove
            </Button>
          </div>
          <div className="text-gray-700 dark:text-gray-300 truncate">{fileMeta.name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Size: {prettyBytes(fileMeta.size)} · Detected format: {fileMeta.format}
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          No file selected yet.
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
