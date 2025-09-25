# MyDebugger Tool – BSON/JSON → CSV Converter (Frontend-Only)

## 0) TL;DR

A browser-only React (Vite) tool that ingests **MongoDB BSON** (binary) and **JSON** (array or NDJSON) exported by the user, **flattens** records deterministically, and emits **RFC4180-safe CSV** via a **two‑pass streaming** pipeline. Designed to handle **up to 1,000,000 records** on modern desktop browsers, with fallbacks and chunked ZIP export to stay within memory constraints. No backend.

---

## 1) Product Requirements (PRD)

### 1.1 Problem & Goal

Users export MongoDB data (BSON or JSON) and need a reliable way to convert it to CSV for BI, Excel, or analytics—**in the browser** without uploading sensitive data to servers. The tool must be **deterministic**, **performant**, and **forgiving** for messy, evolving schemas.

**Primary Goal:** Convert user-uploaded **BSON/JSON → CSV** safely and predictably with **1M-record capacity**.

### 1.2 Success Metrics

* **Functional:**

  * 100% valid CSV output (RFC4180 quoting/escaping) for supported inputs
  * Deterministic column order for same input/schema options
* **Performance:**

  * **1M records** within practical desktop constraints (≈15–40 min on commodity laptops; single-pass memory < 300 MB)
  * UI remains responsive (worker-based; progress updates ≤ 250 ms cadence)
* **Reliability:**

  * Recovers from malformed lines; log shows skipped/triaged records
  * Produces **partial CSV + error report** rather than failing the whole job
* **UX:**

  * Clear progress (discovery pass, conversion pass, rows/sec, ETA)
  * Obvious options, sensible defaults, and copyable logs

### 1.3 Personas

* **PO/Analyst:** needs clean CSV for Excel/Sheets/BI
* **Data/QA Engineer:** validates dumps, compares runs, needs deterministic flatter
* **Security-conscious Dev:** wants local-only processing

### 1.4 In Scope

* File upload: **.bson, .json, .ndjson, .txt**
* **Automatic format detection** (BSON magic + heuristics)
* **Two-pass** conversion (schema discovery → CSV write)
* **Flattening** with dot paths and array strategies (configurable)
* **Type-safe BSON mapping** (ObjectId, Date, Decimal128, Int64, Binary, Regex, etc.)
* **CSV dialect options** (delimiter, quote, newline, BOM)
* **Performance controls** (sample size, chunk size, split files)
* **Chunked export** (single CSV, or multi-file parts, or streaming ZIP)
* **Web Worker** offloading with progress + cancel
* **Error handling** (malformed records, type drift) + downloadable log

### 1.5 Out of Scope (v1)

* Schema inference across **multiple** uploads at once (batch merge)
* Remote/cloud processing; server-side APIs
* Data visualization; aggregation; dedup logic beyond flattening

### 1.6 Constraints

* **Browser-only** (Vite, React 18, Tailwind). Static hosting (Vercel static export OK)
* No external backend; optional small client libraries allowed
* Must run offline after load; no telemetry leaving device by default

---

## 2) UX Spec

### 2.1 Page Structure (inside `ToolLayout`)

* **Header:** Title, short description, link to docs
* **Uploader Card:**

  * Drag & drop zone (accepts .bson/.json/.ndjson/.txt)
  * File details preview (name, size, detected format)
* **Options Card:** (Advanced collapsed by default)

  * **Input Format:** Auto / BSON / NDJSON / JSON Array
  * **Flattening:**

    * Strategy: `Index arrays (a[0].b)`, `Join values`, `Explode rows`
    * Join delimiter (default `|`)
    * Max array length to index (default 32; 0 = unlimited)
  * **Schema Discovery:**

    * Mode: `Two-pass (exact)` (default) / `Single-pass (sample N then lock)`
    * Sample rows (default 50,000) or sample bytes (e.g., 64 MB)
    * Key order: `A→Z` / `First-seen` / `Custom`
    * Null/undefined policy: empty vs literal `null`
  * **CSV Dialect:** delimiter (`,` default), quote (`"`), newline (`\n`), include BOM (off by default), header on/off
  * **Numerics:** emit as strings to preserve precision (on by default)
  * **Output:**

    * Single CSV vs **Split by rows** (e.g., 100k/part)
    * **ZIP output** (on when split; optional for single)
  * **Performance:** chunk size (e.g., 4–16 MB), worker threads (1), backpressure toggles
* **Run Controls:** Start, Pause/Resume, Cancel
* **Progress Panel:**

  * Phase: Discovery Pass → Conversion Pass
  * Counters: bytes read, records parsed/written, columns, errors
  * Throughput: rows/sec, MB/sec, ETA
  * Logs: warnings/errors with row anchors; download `conversion.log`
* **Result Card:**

  * Download buttons (CSV / ZIP), total size, row count
  * Schema summary (column list with example types)

### 2.2 Empty/Loading/Edge States

* Empty: helper tiles for example inputs (small NDJSON, BSON sample)
* Large file: show **estimated memory** and suggest **Split/ZIP**
* Malformed input: continue best-effort; expose toggles to stop-on-error
* BSON with unsupported types: stringify with type tags (see mapping)

### 2.3 Accessibility & i18n

* Keyboard navigable; ARIA live regions for progress
* Copy-to-clipboard for schema, sample row, and logs
* i18n strings via `TranslationProvider` (TH/EN ready)

---

## 3) Data & Conversion Rules

### 3.1 Input Detection

1. **BSON:** first 4 bytes = int32 total length; valid per spec; binary content
2. **Text:** attempt UTF-8 decode (with BOM handling)

   * If starts with `[` → JSON array stream
   * If first non-space is `{` and newlines present → likely NDJSON
   * Else: sniff first few KB for `}{` patterns/newlines to decide

### 3.2 BSON → JSON Mapping (string-safe)

| BSON Type     | Output Representation                                       |
| ------------- | ----------------------------------------------------------- |
| ObjectId      | 24-hex string                                               |
| Date          | ISO8601 UTC (e.g., `2025-09-25T06:30:00.000Z`)              |
| Int32/Int64   | String by default (to preserve precision); option to number |
| Double        | String if `NaN/±Infinity`, else number                      |
| Decimal128    | String via exact decimal repr                               |
| Boolean       | `true`/`false`                                              |
| String        | as-is                                                       |
| Binary        | Base64 (prefixed `base64:`)                                 |
| Regex         | `/pattern/flags`                                            |
| Timestamp     | `{t:<sec>, i:<inc>}` → ISO if user opts                     |
| MinKey/MaxKey | `"<MinKey>"` / `"<MaxKey>"`                                 |
| Undefined     | empty by default or literal `undefined` (option)            |
| Null          | empty or `null` (option)                                    |

### 3.3 Flattening

* **Dot paths** for objects: `a.b.c`
* **Arrays:**

  * **Index:** `a[0].b`, `a[1]...` up to **Max array length**
  * **Join:** join scalar elements into a single field `a` with delimiter (escape delimiter inside values)
  * **Explode:** duplicate parent row for each element; suffix columns from child context (cardinality blow-up warning)
* **Collision Handling:** if both `a` (scalar) and `a.b` (object) appear, coerce scalar to string and keep both columns; log a warning
* **Key Normalization:** preserve case; replace newline/tab in keys; disallow separators in keys via escaping (`.` → `\.` in key if needed)

### 3.4 CSV Rules (RFC4180)

* Quote fields containing delimiter, quote, CR/LF; escape quotes by doubling
* Emit `\r\n` only if user selects Windows newlines; default `\n`
* Option: prepend **UTF-8 BOM** for Excel compatibility
* **Header:** deterministic order (A→Z or first-seen), stable across runs

---

## 4) Performance & Limits

### 4.1 Target Scale

* **Records:** up to **1,000,000** (assuming avg 0.5–1.5 KB/record JSON)
* **File Size Guidance:**

  * Text JSON/NDJSON: up to ~**1–2 GB** feasible with streaming + ZIP split
  * BSON: up to ~**1 GB** practical in-browser (decode cost) — advise split

### 4.2 Memory Budget (Typical)

* Read buffers: 4–16 MB
* Work queues & row buffers: bounded (≤ 5–20 MB)
* Schema map (Set of keys): e.g., 5k keys ≈ 500 KB–5 MB
* UI state/log tail: ≤ 5 MB
* **Total target:** < **300 MB** peak

### 4.3 Throughput Targets (Desktop, Chromium)

* NDJSON parse: **50k–150k rows/min** (content-dependent)
* BSON decode: **20k–80k rows/min**
* CSV write w/ ZIP: **30–120 MB/min**

### 4.4 Strategies

* **Two-pass** ensures complete header deterministically
* **Web Worker** for parsing + flattening; main thread only for UI
* **Backpressure** via postMessage batching (e.g., 5k rows/message)
* **Split output** every N rows to keep memory low; stream into ZIP
* **Pause/Resume/Cancel** using worker signals

---

## 5) Failure, Edge Cases, and Recovery

* **Malformed JSON line:** skip line; record to error log with offset
* **Truncated BSON doc:** stop at last valid doc; warn
* **Type drift (field sometimes object, sometimes string):** coerce to string; log
* **Huge arrays:** cap indexing at Max; if Join selected, safely join
* **New columns after discovery:**

  * Two-pass: not applicable (schema fixed)
  * Single-pass mode: write values into `__extra.<key>` or emit `columns_added.json`
* **CSV cell >32KB:** still allowed; warn about Excel limitations
* **Embedded newlines/tabs:** quoted & escaped
* **Precision loss risk:** default to strings for numerics; user can opt-in to number
* **File too large for single CSV:** auto-enable Split/ZIP; inform user

---

## 6) Security & Privacy

* No network calls; all processing local
* Large file handles never leave browser memory/disk
* Option to **revoke ObjectURLs** and clear buffers after finish
* CSP: block remote connections except local fonts/assets

---

## 7) Architecture & Components

### 7.1 High-Level

```
React UI (ToolLayout)
  ├─ UploadZone
  ├─ OptionsForm
  ├─ RunControls
  ├─ ProgressPanel
  └─ ResultPanel

Web Worker (parseWorker.ts)
  ├─ Input detection (BSON/Text)
  ├─ Pass 1: schema discovery (keys union, type hints)
  ├─ Pass 2: parse → flatten → CSV encode
  ├─ Chunked writer (CSV or ZIP parts)
  └─ Progress + error reporting

Utils
  ├─ flatten.ts (dot paths & array strategies)
  ├─ csv.ts (RFC4180 encoder)
  ├─ ndjsonStream.ts (TextDecoderStream + line splitter)
  ├─ jsonArrayStream.ts (SAX via clarinet; array items only)
  ├─ bsonStream.ts (binary cursor → doc decoder)
  ├─ schema.ts (key set, order, sample policies)
  └─ zip.ts (fflate streaming ZIP; or File System Access writer)
```

### 7.2 State Flow

1. User selects file + options → `START`
2. Worker **Pass 1** streams input → builds `Set<string> columns`
3. UI confirms columns; user can start **Pass 2** (auto if default)
4. Worker **Pass 2** streams again → emits CSV chunks → writer
5. On completion, UI shows **Download** links + logs

### 7.3 Worker Protocol (postMessage)

```ts
// main → worker
{ type: 'START', fileHandleOrBlob, options }
{ type: 'PAUSE' | 'RESUME' | 'CANCEL' }

// worker → main
{ type: 'PHASE', value: 'DISCOVERY' | 'CONVERSION' }
{ type: 'PROGRESS', bytes, rows, cols, rateRps, rateMBps, etaSec }
{ type: 'SCHEMA', columns: string[], sample: Record<string,unknown> }
{ type: 'LOG', level: 'warn'|'error', message, context }
{ type: 'PART_READY', href, filename, sizeBytes } // chunk produced
{ type: 'DONE', outputs: Array<{href, filename, sizeBytes}>, stats }
{ type: 'FAILED', error }
```

---

## 8) Developer Instructions (Implementation Guide)

### 8.1 Tech Stack

* **React 18 + Vite + TypeScript + Tailwind**
* **Web Worker** (TypeScript) via Vite worker plugin
* **Optional libs:**

  * BSON decoder: `bson` (works in browser) or equivalent minimal decoder
  * SAX JSON parser: `clarinet`
  * Streaming ZIP: `fflate`
  * Message bridge (optional): `comlink` (or raw `postMessage`)

### 8.2 Project Structure (drop-in to MyDebugger)

```
src/tools/json-bson-to-csv/
  index.tsx                // route entry (lazy)
  Tool.tsx                 // main page (ToolLayout)
  components/
    UploadZone.tsx
    OptionsForm.tsx
    RunControls.tsx
    ProgressPanel.tsx
    ResultPanel.tsx
  worker/
    parseWorker.ts         // main worker
    detect.ts              // format detection
    passes/
      discovery.ts         // union keys
      convert.ts           // write CSV
    parsers/
      ndjson.ts
      jsonArray.ts
      bson.ts
    piping/
      lineSplitter.ts
      chunkReader.ts
    writers/
      csvWriter.ts
      zipWriter.ts
  utils/
    flatten.ts
    csv.ts
    schema.ts
    types.ts
    time.ts
```

### 8.3 Key Algorithms

**A) NDJSON Streaming**

* Use `file.stream()` → `TextDecoderStream` → `TransformStream` line splitter (handle CR, LF, CRLF)
* For **Discovery**: for each line → `JSON.parse` → `flatten(record)` → union keys
* For **Convert**: repeat stream → for each line → produce CSV row with known columns

**B) JSON Array Streaming**

* Use `clarinet` in array-only mode; skip events until first `[`; for each object emit
* Avoid storing entire array; push objects through flattening as they arrive

**C) BSON Streaming**

* Read binary via `ReadableStreamDefaultReader<Uint8Array>`
* Maintain sliding buffer; BSON docs are **self-length-prefixed** (int32)
* While buffer≥4 bytes: peek length L; if buffer≥L: slice doc; decode; advance; else refill

**D) Flattening** (`flatten(obj, path="")`)

* Recursively walk objects
* Arrays per **strategy**:

  * **Index:** for (i=0..min(len-1, maxIndex)) → flatten(el, `${path}[${i}]`)
  * **Join:** if scalar-ish → join; else fallback to index or JSON-stringify
  * **Explode:** collect rows per element; cartesian-merge with parent (guard against blow-up)
* Scalar coercion: ensure **string-safe** output for numerics and BSON specials

**E) CSV Encode**

* Maintain column order array
* For each value: serialize per rules; quote if needed; `"`→`""`
* Append newline; write to sink (File System Access or in-memory chunks → Blob)

**F) Output Writing**

* **Mode 1: Single CSV** → accumulate chunks ≤ 16 MB, flush to a `WritableStream` if available; else to an array of Blobs and `new Blob([...])` at the end
* **Mode 2: Split CSV** every N rows → emit `PART_READY` object URLs; present multiple downloads
* **Mode 3: ZIP** → streaming ZIP (fflate) appends entries per part without holding all data in memory

### 8.4 Performance Knobs (Defaults)

* `readChunkBytes`: 8 MB
* `lineBufferLimit`: 4 MB (for very long JSON lines)
* `maxArrayIndex`: 32
* `splitEveryNRows`: 100,000 (if Split on)
* `zipWhenSplit`: true
* `discoverySampleRows`: 50,000 **or** first 64 MB (if single-pass mode)

### 8.5 Error Handling Strategy

* Wrap `JSON.parse`/BSON decode; on failure:

  * Increment `errorCount`; push compact context (byteOffset, reason) to ring buffer
  * If `stopOnError` enabled → abort and surface
* Type drift: on encountering object where scalar seen, stringify to JSON; log with field path
* Oversized cell: allow; log Excel compatibility hint

### 8.6 Determinism & Column Order

* **Two-pass mode**: columns gathered over full file; sorted A→Z (default)
* **Single-pass mode**: columns from sample; subsequent unseen columns go to `__extra.<path>` or `columns_added.json`
* Persist chosen order in `schema.json` alongside output for reproducibility

### 8.7 UI/UX Implementation Notes

* Use `ToolLayout` + design tokens; support dark mode
* Progress via ARIA live regions; ensure `requestAnimationFrame` batching in UI render
* Debounce progress updates to ≤ 4 per second
* Provide **Preview** of first N rows (e.g., 20) using the final schema

### 8.8 Testing Plan

* **Unit:** flattening (objects, arrays, collisions), CSV quoting, BSON type mapping
* **Property tests:** random nested structures output re-parseable
* **Fixtures:**

  * Small NDJSON (100 rows) with mixed types
  * Large NDJSON (1M synthetic)
  * BSON dump with ObjectId, Date, Decimal128, Binary, Regex
  * JSON array with nested/array combos
* **Load tests:** measure rows/sec, memory via Performance API
* **UX tests:** pause/resume/cancel; error log download

### 8.9 Example Pseudocode Snippets

**Worker: BSON doc framing**

```ts
let buf = new Uint8Array(0);
for await (const chunk of file.stream()) {
  buf = concat(buf, chunk);
  let off = 0;
  while (off + 4 <= buf.length) {
    const view = new DataView(buf.buffer, buf.byteOffset + off, 4);
    const len = view.getInt32(0, true);
    if (off + len > buf.length) break; // need more
    const docBytes = buf.subarray(off, off + len);
    const json = bsonDeserialize(docBytes, options);
    yield json;
    off += len;
  }
  buf = buf.subarray(off); // keep remainder
}
```

**Flatten (index strategy)**

```ts
function flatten(obj: any, out: Record<string,string>, p = ""){
  if (obj === null || typeof obj !== 'object') { out[p] = scalar(obj); return; }
  if (Array.isArray(obj)) {
    const n = Math.min(obj.length, maxIdx);
    for (let i=0;i<n;i++) flatten(obj[i], out, `${p}[${i}]`);
    if (obj.length>n) out[`${p}.__truncated`] = String(obj.length);
    return;
  }
  for (const [k,v] of Object.entries(obj)) {
    const key = p ? `${p}.${k}` : k;
    flatten(v, out, key);
  }
}
```

**CSV cell**

```ts
function csvCell(s: string, delim = ','){ 
  if (s == null) return '';
  const needs = s.includes('"') || s.includes('\n') || s.includes('\r') || s.includes(delim);
  if (!needs) return s;
  return '"' + s.replaceAll('"','""') + '"';
}
```

---

## 9) Delivery Checklist

* [ ] Route registered in `toolRegistry` with icon + description
* [ ] Works offline; no network calls
* [ ] Handles 1M records path with Two-pass + Split/ZIP
* [ ] Deterministic headers; schema.json included
* [ ] Error report downloadable; partial output still available
* [ ] A11y and i18n checked
* [ ] Performance measured and documented (rows/sec, memory)

---

## 10) Appendix – User-Facing Help Copy (Draft)

**What files can I upload?** `.bson`, `.json`, `.ndjson`, or `.txt` exported from MongoDB tools.
**Large files?** Use *Two-pass*, enable *Split/ZIP*, and keep the tab active.
**Arrays?** Choose *Index* (default), *Join*, or *Explode*. *Explode* can multiply rows.
**Numbers look odd?** We quote large numbers to preserve precision. Turn off in Options if you prefer numeric types (risk of precision loss).
**Privacy?** Everything runs locally in your browser.









Recommended Actions
Complete UI Components: Flesh out 
src/tools/bson-csv/components/OptionsForm.tsx
, RunControls.tsx, ProgressPanel.tsx, and ResultPanel.tsx to expose every option and UX element specified in 
requirements.md
.
Implement Core Utilities: Add detection, flattening, CSV encoding, schema management, streaming helpers, and ZIP logic under src/tools/bson-csv/utils/, matching Section 7 architecture.


Build Worker Pipeline: Create src/tools/bson-csv/worker/ with discovery and conversion passes, parsers for BSON/NDJSON/JSON array, and message handling compliant with 
types.ts
.
Wire Progress & Outputs: Ensure worker emits progress, logs, schema, and part events; main thread should handle blob creation, URL management, and schema previews.
Add Tests & Examples: Introduce Jest tests (__tests__/bson-csv/) and sample NDJSON/BSON fixtures per the testing plan.
Resolve Lints: Once utilities exist, fix TypeScript errors and add proper typing to worker 
onerror
 handlers