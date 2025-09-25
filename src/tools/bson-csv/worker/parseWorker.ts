/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import type {
  ConverterOptions,
  WorkerRequestMessage,
  WorkerResponseMessage,
  ProgressPayload,
  ConversionPhase,
} from "../types";
import { detectFileFormat } from "../utils/detect";
import { createSchemaAccumulator, addFlatKeys, finalizeColumns } from "../utils/schema";
import { flattenObject } from "../utils/flatten";
import { encodeHeader, encodeRow } from "../utils/csv";
import { deserialize } from "bson";

// Global state
let currentOptions: ConverterOptions | null = null;
let currentFile: File | null = null;
let currentFormat: "bson" | "ndjson" | "json-array" = "ndjson";
let cancelled = false;
let paused = false;
let awaitingContinue = false;
let discoveredColumns: string[] | null = null;

function post(message: WorkerResponseMessage) {
  // eslint-disable-next-line no-restricted-globals
  (self as unknown as Worker).postMessage(message);
}

// Utilities
function nowMs() {
  return Date.now();
}

function shouldPulse(last: number, intervalMs = 250): boolean {
  return nowMs() - last >= intervalMs;
}

function isoDateFix(line: string): string {
  // Replace ISODate("...") with "..." for Mongo shell dumps
  return line.replace(/ISODate\(\"([^\"]+)\"\)/g, '"$1"');
}

// Parsers (async generators)
async function* iterNdjson(file: File): AsyncGenerator<Record<string, unknown>, void, void> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    // Split on CR/LF/CRLF
    let idx: number;
    while ((idx = buf.search(/\r\n|\n|\r/)) !== -1) {
      const line = buf.slice(0, idx);
      buf = buf.slice(idx + (buf.startsWith("\r\n", idx) ? 2 : 1));
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const fixed = isoDateFix(trimmed);
        const obj = JSON.parse(fixed);
        if (obj && typeof obj === "object") {
          yield obj as Record<string, unknown>;
        }
      } catch (e) {
        post({ type: "LOG", payload: { level: "warn", message: `Malformed JSON line skipped`, timestamp: nowMs() } });
      }
    }
  }
  if (buf.trim()) {
    try {
      const fixed = isoDateFix(buf.trim());
      const obj = JSON.parse(fixed);
      if (obj && typeof obj === "object") yield obj as Record<string, unknown>;
    } catch {
      post({ type: "LOG", payload: { level: "warn", message: `Trailing JSON line skipped`, timestamp: nowMs() } });
    }
  }
}

async function* iterJsonArray(file: File): AsyncGenerator<Record<string, unknown>, void, void> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buf = "";
  let inString = false;
  let escape = false;
  let depth = 0; // object depth within top-level array
  let started = false; // have we seen the opening '['
  let curr = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    for (let i = 0; i < buf.length; i += 1) {
      const ch = buf[i];
      if (!started) {
        if (ch === "[") { started = true; }
        continue;
      }
      if (ch === "]" && depth === 0 && !inString) {
        // end of array; flush remaining
        if (curr.trim()) {
          try { yield JSON.parse(isoDateFix(curr.trim())) as Record<string, unknown>; } catch {
            post({ type: "LOG", payload: { level: "warn", message: "Malformed JSON item skipped", timestamp: nowMs() } });
          }
        }
        curr = "";
        // ignore rest
        continue;
      }
      curr += ch;
      if (inString) {
        if (escape) { escape = false; }
        else if (ch === "\\") { escape = true; }
        else if (ch === '"') { inString = false; }
        continue;
      }
      if (ch === '"') { inString = true; continue; }
      if (ch === "{") { depth += 1; continue; }
      if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          // end of an object (may be followed by comma)
          try {
            const text = curr;
            // trim potential trailing comma
            let end = text.length - 1;
            while (end >= 0 && /\s|,/.test(text[end])) end -= 1;
            const objText = text.slice(0, end + 1);
            const parsed = JSON.parse(isoDateFix(objText));
            if (parsed && typeof parsed === "object") {
              yield parsed as Record<string, unknown>;
            }
          } catch {
            post({ type: "LOG", payload: { level: "warn", message: "Malformed JSON item skipped", timestamp: nowMs() } });
          }
          curr = "";
        }
        continue;
      }
    }
    // keep only the current buffer (curr), drop processed chars
    buf = "";
  }
}

async function* iterBson(file: File): AsyncGenerator<Record<string, unknown>, void, void> {
  const reader = file.stream().getReader();
  let buf = new Uint8Array(0);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value && value.length) {
      const combined = new Uint8Array(buf.length + value.length);
      combined.set(buf, 0);
      combined.set(value, buf.length);
      buf = combined;
      let off = 0;
      while (off + 4 <= buf.length) {
        const view = new DataView(buf.buffer, buf.byteOffset + off, 4);
        const len = view.getInt32(0, true);
        if (len <= 0) break;
        if (off + len > buf.length) break; // need more bytes
        const slice = buf.subarray(off, off + len);
        try {
          const obj = deserialize(slice);
          yield obj as Record<string, unknown>;
        } catch (e) {
          post({ type: "LOG", payload: { level: "warn", message: "BSON doc decode failed", timestamp: nowMs() } });
        }
        off += len;
      }
      buf = buf.subarray(off);
    }
  }
}

// Mongo shell multi-document text, e.g.
// /* 1 */\n{...}\n\n/* 2 */\n{...}
// Supports ISODate("...") token replacement.
async function* iterMongoShellText(file: File): AsyncGenerator<Record<string, unknown>, void, void> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buf = "";
  let inBlockComment = false;
  let inString = false;
  let escape = false;
  let started = false;
  let depth = 0;
  let curr = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    for (let i = 0; i < buf.length; i += 1) {
      const ch = buf[i];
      const next = i + 1 < buf.length ? buf[i + 1] : "";

      if (inBlockComment) {
        if (ch === "*" && next === "/") { inBlockComment = false; i += 1; }
        continue;
      }

      if (!inString && ch === "/" && next === "*") {
        inBlockComment = true; i += 1; continue;
      }

      if (started) {
        curr += ch;
        if (inString) {
          if (escape) { escape = false; }
          else if (ch === "\\") { escape = true; }
          else if (ch === '"') { inString = false; }
          continue;
        }
        if (ch === '"') { inString = true; continue; }
        if (ch === "{") { depth += 1; continue; }
        if (ch === "}") {
          depth -= 1;
          if (depth === 0) {
            // Complete object captured in curr
            try {
              const text = curr;
              const fixed = isoDateFix(text);
              const obj = JSON.parse(fixed);
              if (obj && typeof obj === "object") yield obj as Record<string, unknown>;
            } catch {
              post({ type: "LOG", payload: { level: "warn", message: "Malformed document skipped", timestamp: nowMs() } });
            }
            curr = "";
            started = false;
          }
          continue;
        }
        continue;
      }

      // Not started yet; seek first '{'
      if (!inString && ch === "{") {
        started = true;
        depth = 1;
        curr = "{";
        continue;
      }
    }
    // Drain processed portion; keep only the unfinished object buffer
    buf = "";
  }

  // Flush remaining (in case file ended right after closing brace handled above)
  if (started && curr.trim()) {
    try {
      const fixed = isoDateFix(curr.trim());
      const obj = JSON.parse(fixed);
      if (obj && typeof obj === "object") yield obj as Record<string, unknown>;
    } catch {
      // ignore
    }
  }
}

async function pickIterator(
  file: File,
  fmt: "bson" | "ndjson" | "json-array",
): Promise<AsyncGenerator<Record<string, unknown>, void, void>> {
  if (fmt === "bson") return iterBson(file);
  // Sniff text to decide JSON array, NDJSON, or shell multi-doc
  try {
    const text = await file.slice(0, 8192).text();
    const trimmed = text.trimStart();
    if (trimmed.startsWith("[")) return iterJsonArray(file);
    const hasShellMarkers = /\/\*\s*\d+\s*\*\//.test(text) || /ISODate\(/.test(text);
    if (hasShellMarkers) return iterMongoShellText(file);
  } catch {
    // fall through
  }
  return iterNdjson(file);
}

async function discoveryPass(file: File, fmt: "bson" | "ndjson" | "json-array", options: ConverterOptions) {
  post({ type: "PHASE", value: "discovery" });
  const acc = createSchemaAccumulator();
  const start = nowMs();
  let lastPulse = start;
  let rows = 0;
  let bytesRead = 0; // approximate via chunk sizes in iterators
  const iter = await pickIterator(file, fmt);
  for await (const obj of iter) {
    rows += 1;
    const flat = flattenObject(obj, {
      options: options.flatten,
      numerics: options.numerics,
      nullPolicy: options.nullPolicy,
    });
    addFlatKeys(acc, flat);
    if (shouldPulse(lastPulse)) {
      lastPulse = nowMs();
      const elapsed = lastPulse - start;
      const payload: ProgressPayload = {
        phase: "discovery",
        bytesRead, // we can't accurately track here without plumbing; keep 0 for now
        rowsParsed: rows,
        rowsWritten: 0,
        colsDiscovered: acc.keysSet.size,
        elapsedMs: elapsed,
        errors: 0,
        rateRowsPerSec: elapsed > 0 ? rows / (elapsed / 1000) : 0,
        rateMBPerSec: 0,
        etaSeconds: null,
      };
      post({ type: "PROGRESS", payload });
    }
    if (cancelled) break;
  }
  const columns = finalizeColumns(acc, options.schemaKeyOrder);
  discoveredColumns = columns;
  const sample = {} as Record<string, unknown>;
  post({ type: "SCHEMA", payload: { columns, sample } });
}

async function convertPass(
  file: File,
  fmt: "bson" | "ndjson" | "json-array",
  options: ConverterOptions,
  columns: string[],
) {
  post({ type: "PHASE", value: "conversion" });
  const start = nowMs();
  let lastPulse = start;
  let rowsParsed = 0;
  let rowsWritten = 0;
  let errors = 0;
  let colsDiscovered = columns.length;
  let partIndex = 0;
  let chunkIndex = 0;
  let rowsInPart = 0;
  const splitEvery = options.output.splitEvery ?? 0;
  const flushThresholdBytes = 1 * 1024 * 1024; // 1MB per chunk
  const enc = new TextEncoder();

  let chunkStr = "";
  let chunkBytes = 0;
  function flushChunk(final = false) {
    if (!chunkStr) return;
    const bytes = enc.encode(chunkStr);
    post({ type: "PART_READY", payload: { partIndex, chunkIndex, buffer: bytes.buffer, mimeType: "text/csv" } });
    chunkIndex += 1;
    chunkStr = "";
    chunkBytes = 0;
  }
  function beginPart() {
    chunkStr = "";
    chunkBytes = 0;
    chunkIndex = 0;
    rowsInPart = 0;
    if (options.csv.includeHeader) {
      const headerBytes = encodeHeader(columns, options.csv, options.csv.includeBom);
      post({ type: "PART_READY", payload: { partIndex, chunkIndex, buffer: headerBytes.buffer, mimeType: "text/csv" } });
      chunkIndex += 1;
    }
  }
  async function endPart() {
    flushChunk(true);
    const filename = splitEvery ? `output_part_${String(partIndex + 1).padStart(3, "0")}.csv` : `output.csv`;
    post({ type: "PART_DONE", payload: { partIndex, filename, rows: rowsInPart, sizeBytes: 0, mimeType: "text/csv" } });
    partIndex += 1;
  }

  beginPart();
  const iter = await pickIterator(file, fmt);
  for await (const obj of iter) {
    rowsParsed += 1;
    try {
      const flat = flattenObject(obj, {
        options: options.flatten,
        numerics: options.numerics,
        nullPolicy: options.nullPolicy,
      });
      const row = columns.map((c) => (c in flat ? flat[c] : ""));
      const line = encodeRow(row, options.csv);
      chunkStr += line;
      chunkBytes += line.length; // approximate; we flush by encoded bytes anyway
      rowsInPart += 1;
      rowsWritten += 1;
      if (chunkBytes >= flushThresholdBytes) flushChunk();
      if (splitEvery && rowsInPart >= splitEvery) {
        await endPart();
        beginPart();
      }
    } catch (e) {
      errors += 1;
      if (options.general.stopOnError) {
        post({ type: "FAILED", error: (e as Error).message ?? "Conversion error" });
        return;
      }
      post({ type: "LOG", payload: { level: "warn", message: "Row conversion failed; continuing", timestamp: nowMs() } });
    }

    if (shouldPulse(lastPulse)) {
      lastPulse = nowMs();
      const elapsed = lastPulse - start;
      const payload: ProgressPayload = {
        phase: "conversion",
        bytesRead: 0,
        rowsParsed,
        rowsWritten,
        colsDiscovered,
        elapsedMs: elapsed,
        errors,
        rateRowsPerSec: elapsed > 0 ? rowsParsed / (elapsed / 1000) : 0,
        rateMBPerSec: 0,
        etaSeconds: null,
      };
      post({ type: "PROGRESS", payload });
    }
    if (cancelled) break;
    while (paused) await new Promise((r) => setTimeout(r, 100));
  }
  await endPart();

  // Emit schema.json alongside outputs for reproducibility if enabled
  if (options.general.persistSchema) {
    const schemaObj = {
      columns,
      keyOrder: options.schemaKeyOrder,
      generatedAt: new Date().toISOString(),
    };
    const schemaText = JSON.stringify(schemaObj, null, 2);
    const schemaBytes = enc.encode(schemaText);
    // Use current partIndex for schema.json
    post({
      type: "PART_READY",
      payload: {
        partIndex,
        chunkIndex: 0,
        buffer: schemaBytes.buffer,
        mimeType: "application/json",
      },
    });
    post({
      type: "PART_DONE",
      payload: {
        partIndex,
        filename: "schema.json",
        rows: 0,
        sizeBytes: schemaBytes.byteLength,
        mimeType: "application/json",
      },
    });
    partIndex += 1;
  }

  post({ type: "DONE", payload: { outputs: [], stats: { bytesRead: 0, rowsParsed, rowsWritten, colsDiscovered, elapsedMs: nowMs() - start, errors }, schema: { columns, sample: {} }, log: [] } });
}

async function startPipeline(file: File, options: ConverterOptions) {
  const fmt = (await detectFileFormat(file, options.format)) ?? "ndjson";
  currentFormat = fmt as typeof currentFormat;
  await discoveryPass(file, currentFormat, options);
  if (options.general.autoStartAfterDiscovery) {
    const cols = discoveredColumns ?? [];
    await convertPass(file, currentFormat, options, cols);
  } else {
    awaitingContinue = true;
  }
}

// Message handler
// eslint-disable-next-line no-restricted-globals
self.onmessage = async (ev: MessageEvent<WorkerRequestMessage>) => {
  const data = ev.data;
  switch (data.type) {
    case "WARMUP":
      post({ type: "READY" });
      break;
    case "START":
      cancelled = false;
      paused = false;
      awaitingContinue = false;
      currentOptions = data.options;
      currentFile = data.file;
      await startPipeline(currentFile, currentOptions);
      break;
    case "CONTINUE":
      if (awaitingContinue && currentFile && currentOptions && discoveredColumns) {
        awaitingContinue = false;
        await convertPass(currentFile, currentFormat, currentOptions, discoveredColumns);
      }
      break;
    case "PAUSE":
      paused = true;
      post({ type: "PHASE", value: "paused" });
      break;
    case "RESUME":
      if (paused) {
        paused = false;
        post({ type: "PHASE", value: "conversion" as ConversionPhase });
      }
      break;
    case "CANCEL":
      cancelled = true;
      post({ type: "PHASE", value: "cancelled" });
      break;
    default:
      break;
  }
};
