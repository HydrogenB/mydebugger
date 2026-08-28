# PDF Tools: Batch Password Remover — Design

## Problem

MyDebugger has a `pdf-to-img` tool that opens password-protected PDFs (via `pdfjs-dist`) but only to rasterize pages to images — it never gives the user back a real, unlocked PDF file. There's no way to remove a password from a PDF, and no way to do it for multiple files at once.

## Goal

A new `/pdf-tools` hub that:
- Removes passwords from one or many PDFs at once (batch), entirely client-side.
- Also does PDF → image conversion, so all PDF-related tools live in one place.
- Uses a compact, dense UI — this is a utility for processing many files quickly, not a wizard.

## Non-goals

- Re-encrypting / adding a password (not requested).
- Editing PDF content (merge, split, redact, etc.) — out of scope for this spec.
- Server-side processing — must stay stateless per the project's Vercel-free-tier constraint.

## Key technical finding

The obvious library choice, `pdf-lib`, **cannot** decrypt real password-protected PDF content. Its `ignoreEncryption: true` load option skips the encryption check but does not decrypt streams — output is corrupted for genuinely encrypted PDFs, and it has no `removePassword`/decrypt API (confirmed against pdf-lib's own GitHub issue tracker).

The correct tool for this job is **QPDF** (the CLI purpose-built for exactly this operation) compiled to WebAssembly, via the npm package `@neslinesli93/qpdf-wasm` (ISC license, ~1.4MB wasm). It runs QPDF's decrypt operation fully client-side and handles both:
- Owner-password-only PDFs (permission restrictions) — removable without any password.
- User-password-encrypted PDFs — decryptable given the correct password.

This is the one new dependency this feature needs. Everything else (zipping via `fflate`, image conversion via the existing `pdfConverter.ts`) already exists in the codebase.

## Architecture

### Tool placement

- New folder `src/tools/pdf-tools/`, replacing `pdf-to-img` as the registry entry point.
- Registry (`src/tools/index.ts`): rename/replace the `pdf-to-image` entry → id `pdf-tools`, route `/pdf-tools`, title "PDF Tools", `longDescription` covering both unlock and image conversion.
- `src/app/routes.tsx`: add `<Route path="/pdf-to-img/*" element={<Navigate to="/pdf-tools" replace />} />` so existing links/bookmarks/SEO keep working.
- The existing `pdf-to-img` internals (`lib/pdfConverter.ts`, `lib/pdfConversionQueue.ts`, `hooks/usePdfToImage.ts`, image-related components) move under `src/tools/pdf-tools/` and are reused as-is for the "Convert to Image" operation — no rewrite of that logic.

### Per-file model

Each dropped file gets its own row with an independent **operation**: `Unlock Password` (default) or `Convert to Image`. A toolbar control ("Apply to all") lets the user set the operation for every row at once; individual rows can still be overridden.

### Compact UI (dense table — confirmed via mockup)

**Toolbar** (top, single row): dropzone trigger, shared "default password" field (applied to all Unlock rows unless overridden), bulk operation selector + "Apply to all" button, "Download All as ZIP" button (enabled once ≥1 row has completed).

**File rows** (one thin row each): filename · size · operation dropdown · status badge (`pending` / `processing` / `done` / `needs password` / `error`) · inline password override input (rendered only when that row's status is `needs password`, keeps rows compact otherwise) · per-row download button · remove (×).

### Processing

- New Web Worker `src/tools/pdf-tools/workers/qpdfWorker.ts` wraps `@neslinesli93/qpdf-wasm`'s `callMain`, exposing a simple message contract: `{ id, bytes, password }` in → `{ id, ok: true, bytes }` or `{ id, ok: false, reason: 'wrong-password' | 'not-a-pdf' | 'error' }` out.
- One worker instance, one wasm module load, files processed **sequentially** through it (a queue) — spinning up multiple wasm instances for parallelism isn't worth the memory cost for a free-tier client-side tool.
- "Convert to Image" rows continue to use the existing `pdfConverter.ts` functions directly (main thread, matching current `pdf-to-img` behavior) — not moved into the worker, since that logic isn't part of this feature's blocker and reworking it is out of scope.
- Orchestration hook `src/tools/pdf-tools/hooks/useBatchPdfTools.ts` owns the row list and state machine: `pending → processing → done | needs-password | error`. Drives both the qpdf worker queue and the to-image calls depending on each row's operation.

### Output

- Per-row "Download" button for a completed row (unlocked PDF, or the row's own image ZIP if it produced multiple images — reusing the existing single-file image zip logic).
- "Download All as ZIP" bundles every completed row's output (unlocked `.pdf` files and image outputs) using `fflate`'s `zipSync`, the same approach `pdf-to-img` already uses for its own "download all images" button.

### Error handling

- Wrong password on an Unlock row → row status becomes `needs-password`, its inline password field appears with a "Retry" action that re-queues just that row. Other rows are unaffected.
- A file that isn't a valid PDF (bad header) → marked `error` immediately, before it's ever queued to the worker.
- An Unlock row whose PDF turns out not to be encrypted at all → treated as success (pass-through), so it still counts toward "Download All as ZIP".

## Testing

Following this project's existing pattern (`__tests__/tools.<name>.test.ts`, Jest + RTL, no wasm execution in jsdom):
- `useBatchPdfTools` row-state machine: adding files, bulk "apply to all", per-row operation override, status transitions (pending → processing → done/needs-password/error), retry re-queuing.
- Any pure helpers introduced (PDF header validation, output bundling for "Download All as ZIP").
- The actual QPDF decrypt path is not unit-testable in jsdom (real wasm + real encrypted PDF fixtures) — covered by manual QA instead.
