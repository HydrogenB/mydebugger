# BSON/JSON → CSV Tool Architecture

## Overview

This document summarizes the concrete implementation plan derived from `requirements.md`. The tool runs entirely in the browser and is split between a React UI shell (`BsonCsvTool`) and a dedicated Web Worker (`parseWorker.ts`) that performs CPU-intensive parsing, schema discovery, flattening, and CSV/ZIP emission.

## Module Layout

```
src/tools/bson-csv/
  index.ts          // route entry point
  page.tsx          // ToolLayout wrapper
  components/
    BsonCsvTool.tsx
    UploadZone.tsx
    OptionsForm.tsx
    RunControls.tsx
    ProgressPanel.tsx
    ResultPanel.tsx
  hooks/
    useBsonCsvTool.ts
  utils/
    detect.ts
    flatten.ts
    csv.ts
    schema.ts
    arrayStrategies.ts
    bson.ts
    stream.ts
    zip.ts
    workers.ts
  worker/
    parseWorker.ts
    environment.ts
    passes/
      discoveryPass.ts
      convertPass.ts
    parsers/
      ndjsonParser.ts
      jsonArrayParser.ts
      bsonParser.ts
  assets/
    examples/
      sample.ndjson
      sample.bson (placeholder notice)
  requirements.md
  architecture.md
```

## Execution Flow

1. `BsonCsvTool` owns UI state, options, file references, and worker lifecycle.
2. When the user hits **Start**, the UI posts a `START` message to `parseWorker.ts` with the selected file and options.
3. Worker performs **Pass 1 (Discovery)** using streaming parsers to enumerate column keys and type hints while tracking stats.
4. Worker posts `SCHEMA` back to UI. If auto-confirmation is enabled, worker proceeds with **Pass 2 (Conversion)** immediately; otherwise UI waits for user confirmation.
5. **Pass 2** streams the file again, flattening objects per strategy and encoding CSV rows. The streaming writer dispatches chunk buffers to the main thread.
6. UI writes chunks into `Blob` parts. When a part completes, UI exposes download links (CSV or ZIP) without blocking the worker.
7. Progress, logs, and error events flow back through structured messages defined in `types.ts`.

## Key Decisions

- **Worker-only heavy lifting:** All parsing, flattening, and CSV writing run off the main thread to keep React responsive.
- **Two-pass default:** Ensures deterministic column ordering. Single-pass mode (optional) still records schema drift into `__extra.*` columns.
- **Streaming NDJSON/JSON:** Implemented with browser `ReadableStream` utilities plus lightweight parsers (`clarinet` for arrays).
- **BSON decode:** Uses `bson` package. The worker maintains a rolling buffer to respect document boundaries.
- **RFC4180 compliance:** `csv.ts` handles quoting, delimiter customization, and optional BOM insertion.
- **Chunked export:** `zip.ts` wraps `fflate` streams whenever the user selects ZIP output or multiple CSV parts.
- **Resilience:** Exceptions in parsing push `LOG` events back to UI. Depending on `stopOnError`, the worker either continues or aborts gracefully.

## UI Composition

- **UploadZone:** Drag & drop + file picker, showing detected format and size.
- **OptionsForm:** Accordion UI mirroring requirement toggles (flatten strategy, schema mode, CSV dialect, numeric handling, output splitting, performance knobs).
- **RunControls:** Start/Pause/Resume/Cancel + worker warm-up (instantiates worker early to minimize latency).
- **ProgressPanel:** Displays phase, counters, throughput, ETA, and the live log feed (with download button).
- **ResultPanel:** Download buttons per generated part, schema summary, and sample preview rows.

## State Management

The main hook `useBsonCsvTool` manages:

- Current options object (initialized to sensible defaults adhering to `requirements.md`)
- File selection and detected format metadata
- Worker instance + lifecycle
- Progress stats and logs
- Generated outputs (blob URLs, file names)
- Error states and completion flag

## Testing Strategy

- Unit tests for `flatten.ts`, `csv.ts`, `schema.ts`, and parser wrappers under `__tests__/bson-csv/` (to be added).
- Integration tests simulating small NDJSON and BSON inputs to ensure deterministic CSV headers and correct logging.
- Performance smoke tests executed manually via fixtures in `assets/examples/`.

## TODO Follow-up

- Populate `assets/examples/sample.bson` with an actual test fixture once binary asset handling is finalized.
- Add Jest tests per the outlined strategy after initial implementation stabilizes.
