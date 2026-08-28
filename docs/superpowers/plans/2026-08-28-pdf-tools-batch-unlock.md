# PDF Tools: Batch Password Remover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `/pdf-tools` hub that lets a user drop in one or many PDFs, pick per-file (or bulk) whether to unlock a password or convert to images, run everything client-side, and download results individually or as one ZIP.

**Architecture:** A compact dense-table React UI drives a row-state-machine hook (`useBatchPdfTools`). "Unlock" rows go through a dedicated Web Worker wrapping `@neslinesli93/qpdf-wasm` (QPDF compiled to WASM — the only library that can actually decrypt real password-protected PDF content; `pdf-lib` cannot). "Convert to Image" rows reuse the existing `pdfjs-dist`-based conversion functions from the current `pdf-to-img` tool, called per-row instead of for one focused file. The old `/pdf-to-img` route redirects to `/pdf-tools`.

**Tech Stack:** React 18 + TypeScript (strict), Vite 4 (module Web Worker via `new Worker(new URL(...), { type: 'module' })`), `pdfjs-dist` (existing), `fflate` (existing, for ZIP), `@neslinesli93/qpdf-wasm` (new dependency), Jest + React Testing Library.

## Global Constraints

- Stateless, edge-safe, client-side only — no server calls, no persistence (project is a Vercel free-tier static SPA).
- New TypeScript files include the MIT header comment: `/**\n * © 2026 MyDebugger Contributors – MIT License\n */`.
- Airbnb TypeScript ESLint profile + Prettier formatting; `pnpm lint` must pass with `--max-warnings 0`.
- `pnpm typecheck` (`tsc --noEmit`) must pass — strict mode is on.
- Tests live in `__tests__/*.test.ts[x]`, Jest + React Testing Library, jsdom environment, run via `pnpm jest <file>`.
- No new dependency besides `@neslinesli93/qpdf-wasm` — everything else (zipping, PDF rendering) reuses what's already installed.
- Design doc: `docs/superpowers/specs/2026-08-28-pdf-tools-batch-unlock-design.md` — refer back to it for the "why" behind these tasks.

---

## Important implementation note: `import.meta.url` and Jest

Vite's recommended way to instantiate a module worker is:
```ts
new Worker(new URL('./qpdfWorker.ts', import.meta.url), { type: 'module' })
```
`import.meta` is invalid syntax when Babel transforms a file to CommonJS for Jest — merely `require()`-ing a file containing that line crashes Jest, even if the line is never executed. To keep this feature testable, the `new Worker(new URL(...))` call is isolated in its own one-line file (`workers/createQpdfWorker.ts`) that nothing but `lib/qpdfClient.ts` imports, and every test that touches `qpdfClient.ts` uses `jest.mock('../../workers/createQpdfWorker', ...)` with an explicit factory — Jest substitutes the module without ever reading/transforming the real file, so the risky syntax never reaches Babel during tests.

---

### Task 1: Row types and the batch-ZIP helper

**Files:**
- Create: `src/tools/pdf-tools/types.ts`
- Create: `src/tools/pdf-tools/lib/pdfConverter.ts` (copy of `src/tools/pdf-to-img/lib/pdfConverter.ts`, unchanged — see Task 3 for removing the old copy)
- Create: `src/tools/pdf-tools/lib/batchZip.ts`
- Test: `__tests__/tools.pdf-tools.batchZip.test.ts`

**Interfaces:**
- Produces: `PdfOperation = 'unlock' | 'to-image'`, `RowStatus = 'pending' | 'processing' | 'done' | 'needs-password' | 'error'`, `PdfToolRow` interface, `buildBatchZip(rows: PdfToolRow[]): Promise<Blob>` — all consumed by Task 4's hook.

- [x] **Step 1: Copy the existing PDF converter library unchanged**

Copy `src/tools/pdf-to-img/lib/pdfConverter.ts` to `src/tools/pdf-tools/lib/pdfConverter.ts` verbatim (same content — this is the file with `validatePdfFile`, `loadPdfDocument`, `renderPageToImage`, `parsePageRange`, `createZipFromImages`, `downloadFile`, `formatFileSize`, and the `ConvertedImage`/`PdfInfo`/`ImageFormat`/`ConversionConfig` types). Do not modify it.

```bash
mkdir -p src/tools/pdf-tools/lib
cp src/tools/pdf-to-img/lib/pdfConverter.ts src/tools/pdf-tools/lib/pdfConverter.ts
```

- [x] **Step 2: Write `types.ts`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import type { ConvertedImage } from './lib/pdfConverter';

export type PdfOperation = 'unlock' | 'to-image';

export type RowStatus = 'pending' | 'processing' | 'done' | 'needs-password' | 'error';

export interface PdfToolRow {
  id: string;
  file: File;
  operation: PdfOperation;
  status: RowStatus;
  /** Per-row password override. Empty string means "use the shared default password". */
  password: string;
  errorMessage?: string;
  /** Set when operation === 'unlock' and status === 'done'. */
  unlockedBytes?: Uint8Array;
  /** Set when operation === 'to-image' and status === 'done'. */
  convertedImages?: ConvertedImage[];
}
```

- [x] **Step 3: Write the failing test for `buildBatchZip`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { unzipSync } from 'fflate';
import { buildBatchZip } from '../src/tools/pdf-tools/lib/batchZip';
import type { PdfToolRow } from '../src/tools/pdf-tools/types';

const makeFile = (name: string): File => new File([new Uint8Array([1, 2, 3])], name, { type: 'application/pdf' });

describe('buildBatchZip', () => {
  test('includes unlocked PDF bytes under the original base name', async () => {
    const rows: PdfToolRow[] = [
      {
        id: '1',
        file: makeFile('secret.pdf'),
        operation: 'unlock',
        status: 'done',
        password: '',
        unlockedBytes: new Uint8Array([80, 68, 70]),
      },
    ];

    const zipBlob = await buildBatchZip(rows);
    const zipBytes = new Uint8Array(await zipBlob.arrayBuffer());
    const entries = unzipSync(zipBytes);

    expect(Object.keys(entries)).toEqual(['secret.pdf']);
    expect(Array.from(entries['secret.pdf'])).toEqual([80, 68, 70]);
  });

  test('nests to-image outputs under a folder named after the file', async () => {
    const imageBlob = new Blob([new Uint8Array([9, 9])], { type: 'image/png' });
    const rows: PdfToolRow[] = [
      {
        id: '2',
        file: makeFile('report.pdf'),
        operation: 'to-image',
        status: 'done',
        password: '',
        convertedImages: [
          { pageNumber: 1, blob: imageBlob, width: 10, height: 10, fileName: 'report_page_001.png' },
        ],
      },
    ];

    const zipBlob = await buildBatchZip(rows);
    const entries = unzipSync(new Uint8Array(await zipBlob.arrayBuffer()));

    expect(Object.keys(entries)).toEqual(['report/report_page_001.png']);
  });

  test('skips rows that are not done', async () => {
    const rows: PdfToolRow[] = [
      { id: '3', file: makeFile('pending.pdf'), operation: 'unlock', status: 'pending', password: '' },
    ];

    const zipBlob = await buildBatchZip(rows);
    const entries = unzipSync(new Uint8Array(await zipBlob.arrayBuffer()));

    expect(Object.keys(entries)).toEqual([]);
  });
});
```

- [x] **Step 4: Run the test to verify it fails**

Run: `pnpm jest __tests__/tools.pdf-tools.batchZip.test.ts -v`
Expected: FAIL — `Cannot find module '../src/tools/pdf-tools/lib/batchZip'`

- [x] **Step 5: Implement `batchZip.ts`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { zipSync } from 'fflate';
import type { PdfToolRow } from '../types';

const blobToUint8Array = async (blob: Blob): Promise<Uint8Array> => new Uint8Array(await blob.arrayBuffer());

/**
 * Bundle every completed row's output into a single ZIP. Unlocked PDFs go in
 * as `<name>.pdf`; to-image outputs are flattened under a `<name>/` folder
 * (no zip-in-zip — a single ZIP is easier to open than nested archives).
 */
export const buildBatchZip = async (rows: PdfToolRow[]): Promise<Blob> => {
  const files: Record<string, Uint8Array> = {};

  for (const row of rows) {
    if (row.status !== 'done') continue;
    const baseName = row.file.name.replace(/\.pdf$/i, '');

    if (row.operation === 'unlock' && row.unlockedBytes) {
      files[`${baseName}.pdf`] = row.unlockedBytes;
    } else if (row.operation === 'to-image' && row.convertedImages) {
      // eslint-disable-next-line no-await-in-loop
      for (const image of row.convertedImages) {
        // eslint-disable-next-line no-await-in-loop
        files[`${baseName}/${image.fileName}`] = await blobToUint8Array(image.blob);
      }
    }
  }

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped], { type: 'application/zip' });
};
```

- [x] **Step 6: Run the test to verify it passes**

Run: `pnpm jest __tests__/tools.pdf-tools.batchZip.test.ts -v`
Expected: PASS (3 tests)

- [x] **Step 7: Commit**

```bash
git add src/tools/pdf-tools/types.ts src/tools/pdf-tools/lib/pdfConverter.ts src/tools/pdf-tools/lib/batchZip.ts __tests__/tools.pdf-tools.batchZip.test.ts
git commit -m "feat(pdf-tools): add row types and batch ZIP bundler"
```

**STATUS: COMPLETE** — commits `bc818a11` (feature) + `21e6c765` (lint fix for a jest.setup.ts Blob.arrayBuffer polyfill the implementer added along the way). Reviewed clean.

---

### Task 2: QPDF Web Worker and its client wrapper

**Files:**
- Create: `src/tools/pdf-tools/workers/createQpdfWorker.ts`
- Create: `src/tools/pdf-tools/workers/qpdfWorker.ts`
- Create: `src/tools/pdf-tools/lib/qpdfClient.ts`
- Create: `src/tools/pdf-tools/qpdf-wasm.d.ts` (ambient module declaration)
- Modify: `package.json` (add dependency)
- Test: `__tests__/tools.pdf-tools.qpdfClient.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `unlockPdf(bytes: Uint8Array, password: string): Promise<UnlockResult>` where `UnlockResult = { ok: true; bytes: Uint8Array } | { ok: false; reason: 'wrong-password' | 'error'; message: string }` — consumed by Task 4's hook. Also `terminateQpdfWorker(): void`.

- [ ] **Step 1: Add the dependency**

```bash
pnpm add @neslinesli93/qpdf-wasm
```

Run: `node -e "console.log(require.resolve('@neslinesli93/qpdf-wasm/package.json'))"`
Expected: prints a path inside `node_modules/@neslinesli93/qpdf-wasm/package.json` (confirms install succeeded).

- [ ] **Step 2: Confirm the package's file layout**

Run: `ls node_modules/@neslinesli93/qpdf-wasm node_modules/@neslinesli93/qpdf-wasm/dist`
Expected: an entry file (e.g. `index.js`) at the package root and `qpdf.wasm` inside `dist/`. If the wasm file lives at a different path than `dist/qpdf.wasm`, use the actual path in Step 5 below instead.

- [ ] **Step 3: Add the ambient type declaration**

The package ships without usable TypeScript types for this project's `strict` mode, so declare the shape we actually use (mirrors the existing pattern in `src/gif.js.d.ts`):

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
declare module '@neslinesli93/qpdf-wasm' {
  interface QpdfFS {
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string): Uint8Array;
  }

  interface QpdfModule {
    FS: QpdfFS;
    callMain(args: string[]): number | undefined;
  }

  interface QpdfModuleOptions {
    locateFile?: (path: string) => string;
  }

  export default function createModule(options?: QpdfModuleOptions): Promise<QpdfModule>;
}

declare module '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url' {
  const url: string;
  export default url;
}
```

Save this as `src/tools/pdf-tools/qpdf-wasm.d.ts`.

- [ ] **Step 4: Write `createQpdfWorker.ts`**

This is the only file allowed to contain `import.meta.url` — see the "Important implementation note" above.

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
export const createQpdfWorker = (): Worker =>
  new Worker(new URL('./qpdfWorker.ts', import.meta.url), { type: 'module' });
```

- [ ] **Step 5: Write the real worker, `qpdfWorker.ts`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Runs inside a dedicated Web Worker. Not unit-tested (real WASM + a real
 * encrypted PDF fixture aren't practical in jsdom) — verified manually,
 * see Task 6.
 */
import createQpdfModule from '@neslinesli93/qpdf-wasm';
import qpdfWasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';

export interface QpdfWorkerRequest {
  id: string;
  bytes: Uint8Array;
  password: string;
}

export type QpdfWorkerResponse =
  | { id: string; ok: true; bytes: Uint8Array }
  | { id: string; ok: false; reason: 'wrong-password' | 'error'; message: string };

let modulePromise: ReturnType<typeof createQpdfModule> | null = null;
const getQpdfModule = () => {
  if (!modulePromise) {
    modulePromise = createQpdfModule({ locateFile: () => qpdfWasmUrl });
  }
  return modulePromise;
};

self.onmessage = async (event: MessageEvent<QpdfWorkerRequest>) => {
  const { id, bytes, password } = event.data;

  try {
    const qpdf = await getQpdfModule();
    qpdf.FS.writeFile('/input.pdf', bytes);

    const args = password
      ? [`--password=${password}`, '--decrypt', '/input.pdf', '/output.pdf']
      : ['--decrypt', '/input.pdf', '/output.pdf'];

    // ponytail: exit code is treated as a generic "wrong password" signal —
    // it doesn't distinguish a bad password from a corrupt/unsupported file.
    // Upgrade path: capture qpdf's stderr via Module.printErr and inspect it.
    let exitCode = 0;
    try {
      exitCode = (qpdf.callMain(args) ?? 0) as number;
    } catch (exitErr) {
      exitCode = (exitErr as { status?: number })?.status ?? 1;
    }

    if (exitCode !== 0) {
      const message = password ? 'Incorrect password' : 'This PDF requires a password';
      const response: QpdfWorkerResponse = { id, ok: false, reason: 'wrong-password', message };
      (self as unknown as Worker).postMessage(response);
      return;
    }

    const output = qpdf.FS.readFile('/output.pdf');
    const response: QpdfWorkerResponse = { id, ok: true, bytes: output };
    (self as unknown as Worker).postMessage(response, [output.buffer]);
  } catch (err) {
    const response: QpdfWorkerResponse = {
      id,
      ok: false,
      reason: 'error',
      message: (err as Error).message || 'Failed to process PDF',
    };
    (self as unknown as Worker).postMessage(response);
  }
};
```

- [ ] **Step 6: Write the failing test for `qpdfClient.ts`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */

jest.mock('../src/tools/pdf-tools/workers/createQpdfWorker', () => ({
  createQpdfWorker: jest.fn(),
}));

import { createQpdfWorker } from '../src/tools/pdf-tools/workers/createQpdfWorker';
import { unlockPdf, terminateQpdfWorker } from '../src/tools/pdf-tools/lib/qpdfClient';

interface FakeWorker {
  postMessage: jest.Mock;
  terminate: jest.Mock;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: unknown) => void) | null;
}

const makeFakeWorker = (): FakeWorker => ({
  postMessage: jest.fn(),
  terminate: jest.fn(),
  onmessage: null,
  onerror: null,
});

describe('qpdfClient', () => {
  afterEach(() => {
    terminateQpdfWorker();
    jest.clearAllMocks();
  });

  test('resolves ok:true when the worker responds with unlocked bytes', async () => {
    const fakeWorker = makeFakeWorker();
    (createQpdfWorker as jest.Mock).mockReturnValue(fakeWorker);

    const resultPromise = unlockPdf(new Uint8Array([1, 2, 3]), 'secret');

    expect(fakeWorker.postMessage).toHaveBeenCalledTimes(1);
    const [request] = fakeWorker.postMessage.mock.calls[0];
    fakeWorker.onmessage?.({ data: { id: request.id, ok: true, bytes: new Uint8Array([9, 9]) } } as MessageEvent);

    const result = await resultPromise;
    expect(result).toEqual({ ok: true, bytes: new Uint8Array([9, 9]) });
  });

  test('resolves ok:false with reason wrong-password', async () => {
    const fakeWorker = makeFakeWorker();
    (createQpdfWorker as jest.Mock).mockReturnValue(fakeWorker);

    const resultPromise = unlockPdf(new Uint8Array([1]), 'bad-password');
    const [request] = fakeWorker.postMessage.mock.calls[0];
    fakeWorker.onmessage?.({
      data: { id: request.id, ok: false, reason: 'wrong-password', message: 'Incorrect password' },
    } as MessageEvent);

    const result = await resultPromise;
    expect(result).toEqual({ ok: false, reason: 'wrong-password', message: 'Incorrect password' });
  });

  test('reuses the same worker instance across calls', async () => {
    const fakeWorker = makeFakeWorker();
    (createQpdfWorker as jest.Mock).mockReturnValue(fakeWorker);

    const first = unlockPdf(new Uint8Array([1]), '');
    fakeWorker.onmessage?.({
      data: { id: fakeWorker.postMessage.mock.calls[0][0].id, ok: true, bytes: new Uint8Array([1]) },
    } as MessageEvent);
    await first;

    const second = unlockPdf(new Uint8Array([2]), '');
    fakeWorker.onmessage?.({
      data: { id: fakeWorker.postMessage.mock.calls[1][0].id, ok: true, bytes: new Uint8Array([2]) },
    } as MessageEvent);
    await second;

    expect(createQpdfWorker).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `pnpm jest __tests__/tools.pdf-tools.qpdfClient.test.ts -v`
Expected: FAIL — `Cannot find module '../src/tools/pdf-tools/lib/qpdfClient'`

- [ ] **Step 8: Implement `qpdfClient.ts`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Client wrapper around the QPDF worker. Follows the same singleton +
 * postMessage/id pattern as src/tools/aes-cbc/lib/crypto-worker.ts.
 */
import { createQpdfWorker } from '../workers/createQpdfWorker';

export interface UnlockSuccess {
  ok: true;
  bytes: Uint8Array;
}

export interface UnlockFailure {
  ok: false;
  reason: 'wrong-password' | 'error';
  message: string;
}

export type UnlockResult = UnlockSuccess | UnlockFailure;

interface WorkerRequest {
  id: string;
  bytes: Uint8Array;
  password: string;
}

type WorkerResponse =
  | { id: string; ok: true; bytes: Uint8Array }
  | { id: string; ok: false; reason: 'wrong-password' | 'error'; message: string };

let worker: Worker | null = null;
const pending = new Map<string, (result: UnlockResult) => void>();

const generateRequestId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getWorker = (): Worker => {
  if (worker) return worker;

  worker = createQpdfWorker();

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const response = event.data;
    const resolve = pending.get(response.id);
    if (!resolve) return;
    pending.delete(response.id);
    resolve(
      response.ok
        ? { ok: true, bytes: response.bytes }
        : { ok: false, reason: response.reason, message: response.message },
    );
  };

  worker.onerror = () => {
    pending.forEach((resolve) => resolve({ ok: false, reason: 'error', message: 'Worker crashed' }));
    pending.clear();
  };

  return worker;
};

export const unlockPdf = (bytes: Uint8Array, password: string): Promise<UnlockResult> => {
  const id = generateRequestId();
  const activeWorker = getWorker();

  return new Promise((resolve) => {
    pending.set(id, resolve);
    const request: WorkerRequest = { id, bytes, password };
    activeWorker.postMessage(request, [bytes.buffer]);
  });
};

export const terminateQpdfWorker = (): void => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
  pending.clear();
};
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `pnpm jest __tests__/tools.pdf-tools.qpdfClient.test.ts -v`
Expected: PASS (3 tests)

- [ ] **Step 10: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: no errors. (If `?url` imports in `qpdfWorker.ts` upset the linter/typechecker because Vite's `vite/client` types don't cover the exact query-suffixed path, the ambient declaration from Step 3 already covers it — if TS still complains, double check the declared module path in `qpdf-wasm.d.ts` matches the import string exactly.)

- [ ] **Step 11: Commit**

```bash
git add package.json pnpm-lock.yaml src/tools/pdf-tools/workers src/tools/pdf-tools/lib/qpdfClient.ts src/tools/pdf-tools/qpdf-wasm.d.ts __tests__/tools.pdf-tools.qpdfClient.test.ts
git commit -m "feat(pdf-tools): add QPDF web worker and client wrapper for real PDF decryption"
```

---

### Task 3: Retire the old `pdf-to-img` single-file UI

**Files:**
- Delete: `src/tools/pdf-to-img/` (entire folder — `index.ts`, `page.tsx`, `hooks/usePdfToImage.ts`, `lib/pdfConverter.ts`, `lib/pdfConversionQueue.ts`, `components/PdfToImagePanel.tsx`, `components/PDFPreviewCarousel.tsx`, `components/ImageLightbox.tsx`, `components/ImageGridToolbar.tsx`)

**Interfaces:**
- Consumes: nothing (this task only removes files; Task 1 already copied the one file worth keeping, `pdfConverter.ts`, into `pdf-tools/lib/`).
- Produces: nothing new — confirms nothing else in the repo still points at the deleted files.

**Why now:** per the approved design, the batch tool's "Convert to Image" rows use simple fixed defaults (all pages, PNG, 2x scale) — the old tool's page-range/quality/scale controls, preview carousel, and lightbox are explicitly out of scope, confirmed with the user during brainstorming. `pdfConversionQueue.ts` was dead code (nothing imported it) and is not carried forward.

- [ ] **Step 1: Confirm nothing else references the folder before deleting**

Run: `grep -rn "pdf-to-img\|pdfConversionQueue\|usePdfToImage\|PdfToImagePanel\|PDFPreviewCarousel\|ImageLightbox\|ImageGridToolbar" src __tests__ --include="*.ts*" | grep -v "src/tools/pdf-to-img/"`
Expected: no output (only Task 6 will introduce the new `/pdf-tools` references, and those don't exist yet).

- [ ] **Step 2: Delete the folder**

```bash
git rm -r src/tools/pdf-to-img
```

- [ ] **Step 3: Verify the build still resolves (registry still points at the old path until Task 6 — expect this to fail here)**

Run: `pnpm typecheck`
Expected: FAILS — `src/tools/index.ts` still imports `./pdf-to-img/index` for the `pdf-to-image` entry. That's expected; Task 6 fixes the registry. Do not fix it in this task — keep this task scoped to "delete the old folder."

- [ ] **Step 4: Commit**

```bash
git commit -m "chore(pdf-tools): remove single-file pdf-to-img UI (superseded by pdf-tools batch flow)"
```

(This commit intentionally leaves `pnpm typecheck` red until Task 6 updates the registry — the two changes are reviewed as one logical unit but kept as separate, easy-to-read commits.)

---

### Task 4: The batch orchestration hook

**Files:**
- Create: `src/tools/pdf-tools/hooks/useBatchPdfTools.ts`
- Test: `__tests__/tools.pdf-tools.useBatchPdfTools.test.ts`

**Interfaces:**
- Consumes: `PdfOperation`, `RowStatus`, `PdfToolRow` (Task 1's `types.ts`); `validatePdfFile`, `loadPdfDocument`, `renderPageToImage`, `parsePageRange`, `createZipFromImages`, `downloadFile` (Task 1's `lib/pdfConverter.ts`); `unlockPdf` (Task 2's `lib/qpdfClient.ts`); `buildBatchZip` (Task 1's `lib/batchZip.ts`).
- Produces: `useBatchPdfTools(): UseBatchPdfToolsReturn` — the exact shape below, consumed by Task 5's UI components.

```typescript
export interface UseBatchPdfToolsReturn {
  rows: PdfToolRow[];
  defaultPassword: string;
  bulkOperation: PdfOperation;
  setDefaultPassword: (password: string) => void;
  setBulkOperation: (operation: PdfOperation) => void;
  addFiles: (files: FileList | File[]) => void;
  applyOperationToAll: () => void;
  setRowOperation: (rowId: string, operation: PdfOperation) => void;
  setRowPassword: (rowId: string, password: string) => void;
  removeRow: (rowId: string) => void;
  startAll: () => Promise<void>;
  retryRow: (rowId: string) => Promise<void>;
  downloadRow: (rowId: string) => Promise<void>;
  downloadAllAsZip: () => Promise<void>;
  clearAll: () => void;
}
```

- [ ] **Step 1: Write the failing tests**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('../src/tools/pdf-tools/lib/qpdfClient', () => ({
  unlockPdf: jest.fn(),
}));
jest.mock('../src/tools/pdf-tools/lib/pdfConverter', () => ({
  validatePdfFile: jest.fn(() => ({ valid: true })),
  loadPdfDocument: jest.fn(),
  renderPageToImage: jest.fn(),
  parsePageRange: jest.fn(() => ({ pages: [1] })),
  createZipFromImages: jest.fn(async () => new Blob(['zip'])),
  downloadFile: jest.fn(),
}));

import { unlockPdf } from '../src/tools/pdf-tools/lib/qpdfClient';
import { downloadFile } from '../src/tools/pdf-tools/lib/pdfConverter';
import useBatchPdfTools from '../src/tools/pdf-tools/hooks/useBatchPdfTools';

const makeFile = (name: string): File => new File([new Uint8Array([1])], name, { type: 'application/pdf' });

describe('useBatchPdfTools', () => {
  beforeEach(() => jest.clearAllMocks());

  test('addFiles only accepts PDFs and defaults to the current bulk operation', () => {
    const { result } = renderHook(() => useBatchPdfTools());

    act(() => {
      result.current.addFiles([makeFile('a.pdf'), new File(['x'], 'b.txt', { type: 'text/plain' })]);
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].file.name).toBe('a.pdf');
    expect(result.current.rows[0].operation).toBe('unlock');
    expect(result.current.rows[0].status).toBe('pending');
  });

  test('startAll unlocks a row and marks it done', async () => {
    (unlockPdf as jest.Mock).mockResolvedValue({ ok: true, bytes: new Uint8Array([9]) });
    const { result } = renderHook(() => useBatchPdfTools());

    act(() => {
      result.current.addFiles([makeFile('secret.pdf')]);
    });

    await act(async () => {
      await result.current.startAll();
    });

    expect(result.current.rows[0].status).toBe('done');
    expect(result.current.rows[0].unlockedBytes).toEqual(new Uint8Array([9]));
  });

  test('startAll flips a row to needs-password on a wrong password', async () => {
    (unlockPdf as jest.Mock).mockResolvedValue({ ok: false, reason: 'wrong-password', message: 'Incorrect password' });
    const { result } = renderHook(() => useBatchPdfTools());

    act(() => {
      result.current.addFiles([makeFile('locked.pdf')]);
    });

    await act(async () => {
      await result.current.startAll();
    });

    expect(result.current.rows[0].status).toBe('needs-password');
    expect(result.current.rows[0].errorMessage).toBe('Incorrect password');
  });

  test('retryRow re-runs with the row-level password after it is set', async () => {
    (unlockPdf as jest.Mock)
      .mockResolvedValueOnce({ ok: false, reason: 'wrong-password', message: 'Incorrect password' })
      .mockResolvedValueOnce({ ok: true, bytes: new Uint8Array([1]) });

    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('locked.pdf')]));
    await act(async () => {
      await result.current.startAll();
    });

    const rowId = result.current.rows[0].id;
    act(() => result.current.setRowPassword(rowId, 'correct-password'));
    await act(async () => {
      await result.current.retryRow(rowId);
    });

    expect(result.current.rows[0].status).toBe('done');
    expect(unlockPdf).toHaveBeenLastCalledWith(expect.any(Uint8Array), 'correct-password');
  });

  test('applyOperationToAll switches every row and resets status to pending', () => {
    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('a.pdf'), makeFile('b.pdf')]));

    act(() => result.current.setBulkOperation('to-image'));
    act(() => result.current.applyOperationToAll());

    expect(result.current.rows.every((row) => row.operation === 'to-image')).toBe(true);
    expect(result.current.rows.every((row) => row.status === 'pending')).toBe(true);
  });

  test('downloadRow downloads the unlocked PDF under its original name', async () => {
    (unlockPdf as jest.Mock).mockResolvedValue({ ok: true, bytes: new Uint8Array([1, 2]) });
    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('secret.pdf')]));
    await act(async () => {
      await result.current.startAll();
    });

    await act(async () => {
      await result.current.downloadRow(result.current.rows[0].id);
    });

    expect(downloadFile).toHaveBeenCalledWith(expect.any(Blob), 'secret.pdf');
  });

  test('removeRow drops the row from state', () => {
    const { result } = renderHook(() => useBatchPdfTools());
    act(() => result.current.addFiles([makeFile('a.pdf')]));
    const rowId = result.current.rows[0].id;

    act(() => result.current.removeRow(rowId));

    expect(result.current.rows).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm jest __tests__/tools.pdf-tools.useBatchPdfTools.test.ts -v`
Expected: FAIL — `Cannot find module '../src/tools/pdf-tools/hooks/useBatchPdfTools'`

- [ ] **Step 3: Implement the hook**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * Orchestrates the batch file list: adding files, per-row or bulk operation
 * assignment, running each row through the right pipeline (QPDF unlock or
 * pdf.js image conversion), and downloads.
 */
import { useCallback, useState } from 'react';
import {
  validatePdfFile,
  loadPdfDocument,
  renderPageToImage,
  parsePageRange,
  createZipFromImages,
  downloadFile,
} from '../lib/pdfConverter';
import { unlockPdf } from '../lib/qpdfClient';
import { buildBatchZip } from '../lib/batchZip';
import type { PdfOperation, PdfToolRow } from '../types';

export interface UseBatchPdfToolsReturn {
  rows: PdfToolRow[];
  defaultPassword: string;
  bulkOperation: PdfOperation;
  setDefaultPassword: (password: string) => void;
  setBulkOperation: (operation: PdfOperation) => void;
  addFiles: (files: FileList | File[]) => void;
  applyOperationToAll: () => void;
  setRowOperation: (rowId: string, operation: PdfOperation) => void;
  setRowPassword: (rowId: string, password: string) => void;
  removeRow: (rowId: string) => void;
  startAll: () => Promise<void>;
  retryRow: (rowId: string) => Promise<void>;
  downloadRow: (rowId: string) => Promise<void>;
  downloadAllAsZip: () => Promise<void>;
  clearAll: () => void;
}

const generateRowId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const runRow = async (row: PdfToolRow, password: string): Promise<PdfToolRow> => {
  if (row.operation === 'unlock') {
    const bytes = new Uint8Array(await row.file.arrayBuffer());
    const result = await unlockPdf(bytes, password);

    if (result.ok) {
      return { ...row, status: 'done', errorMessage: undefined, unlockedBytes: result.bytes };
    }
    if (result.reason === 'wrong-password') {
      return { ...row, status: 'needs-password', errorMessage: result.message };
    }
    return { ...row, status: 'error', errorMessage: result.message };
  }

  try {
    const validation = validatePdfFile(row.file);
    if (!validation.valid) {
      return { ...row, status: 'error', errorMessage: validation.error };
    }

    const { pdf, info } = await loadPdfDocument(row.file, password || undefined);
    const { pages } = parsePageRange('', info.pageCount);
    const images = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const pageNumber of pages) {
      // eslint-disable-next-line no-await-in-loop
      images.push(await renderPageToImage(pdf, pageNumber, { scale: 2, format: 'png', quality: 0.9 }, row.file.name));
    }
    pdf.destroy();

    return { ...row, status: 'done', errorMessage: undefined, convertedImages: images };
  } catch (err) {
    const error = err as Error;
    if (error.name === 'PasswordException' || error.message?.includes('password')) {
      return { ...row, status: 'needs-password', errorMessage: 'Incorrect password' };
    }
    return { ...row, status: 'error', errorMessage: error.message || 'Failed to convert PDF' };
  }
};

const useBatchPdfTools = (): UseBatchPdfToolsReturn => {
  const [rows, setRows] = useState<PdfToolRow[]>([]);
  const [defaultPassword, setDefaultPassword] = useState('');
  const [bulkOperation, setBulkOperation] = useState<PdfOperation>('unlock');

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files).filter((file) => file.type === 'application/pdf');
      setRows((prev) => [
        ...prev,
        ...incoming.map(
          (file): PdfToolRow => ({
            id: generateRowId(),
            file,
            operation: bulkOperation,
            status: 'pending',
            password: '',
          }),
        ),
      ]);
    },
    [bulkOperation],
  );

  const applyOperationToAll = useCallback(() => {
    setRows((prev) =>
      prev.map((row) => ({ ...row, operation: bulkOperation, status: 'pending', errorMessage: undefined })),
    );
  }, [bulkOperation]);

  const setRowOperation = useCallback((rowId: string, operation: PdfOperation) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, operation, status: 'pending', errorMessage: undefined } : row)),
    );
  }, []);

  const setRowPassword = useCallback((rowId: string, password: string) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, password } : row)));
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  }, []);

  const runAndStore = useCallback(
    async (row: PdfToolRow) => {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'processing' } : r)));
      const password = row.password || defaultPassword;
      const result = await runRow(row, password);
      setRows((prev) => prev.map((r) => (r.id === row.id ? result : r)));
    },
    [defaultPassword],
  );

  const startAll = useCallback(async () => {
    const pendingRows = rows.filter((row) => row.status === 'pending');
    // eslint-disable-next-line no-restricted-syntax
    for (const row of pendingRows) {
      // eslint-disable-next-line no-await-in-loop
      await runAndStore(row);
    }
  }, [rows, runAndStore]);

  const retryRow = useCallback(
    async (rowId: string) => {
      const row = rows.find((r) => r.id === rowId);
      if (row) await runAndStore(row);
    },
    [rows, runAndStore],
  );

  const downloadRow = useCallback(
    async (rowId: string) => {
      const row = rows.find((r) => r.id === rowId);
      if (!row || row.status !== 'done') return;

      const baseName = row.file.name.replace(/\.pdf$/i, '');
      if (row.operation === 'unlock' && row.unlockedBytes) {
        downloadFile(new Blob([row.unlockedBytes], { type: 'application/pdf' }), `${baseName}.pdf`);
      } else if (row.operation === 'to-image' && row.convertedImages) {
        const zipBlob = await createZipFromImages(row.convertedImages, baseName);
        downloadFile(zipBlob, `${baseName}_images.zip`);
      }
    },
    [rows],
  );

  const downloadAllAsZip = useCallback(async () => {
    const zipBlob = await buildBatchZip(rows);
    downloadFile(zipBlob, 'pdf-tools-batch.zip');
  }, [rows]);

  const clearAll = useCallback(() => setRows([]), []);

  return {
    rows,
    defaultPassword,
    bulkOperation,
    setDefaultPassword,
    setBulkOperation,
    addFiles,
    applyOperationToAll,
    setRowOperation,
    setRowPassword,
    removeRow,
    startAll,
    retryRow,
    downloadRow,
    downloadAllAsZip,
    clearAll,
  };
};

export default useBatchPdfTools;
```

Note: `downloadRow`'s unlock branch downloads under `${baseName}.pdf`, i.e. the original filename without any suffix (matches the test in Step 1) — the file is byte-identical to the original except decrypted, so keeping the original name is correct.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm jest __tests__/tools.pdf-tools.useBatchPdfTools.test.ts -v`
Expected: PASS (7 tests)

- [ ] **Step 5: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: `pnpm typecheck` still fails only on the pre-existing `src/tools/index.ts` → `pdf-to-img` reference from Task 3 (fixed in Task 6). No new errors from files touched in this task. `pnpm lint` passes for the new files.

- [ ] **Step 6: Commit**

```bash
git add src/tools/pdf-tools/hooks/useBatchPdfTools.ts __tests__/tools.pdf-tools.useBatchPdfTools.test.ts
git commit -m "feat(pdf-tools): add batch orchestration hook"
```

---

### Task 5: Compact table UI

**Files:**
- Create: `src/tools/pdf-tools/components/PdfToolsToolbar.tsx`
- Create: `src/tools/pdf-tools/components/PdfToolsRow.tsx`
- Create: `src/tools/pdf-tools/page.tsx`
- Create: `src/tools/pdf-tools/index.ts`
- Test: `__tests__/tools.pdf-tools.ui.test.tsx`

**Interfaces:**
- Consumes: `useBatchPdfTools()` and its return shape (Task 4); `PdfToolRow`, `PdfOperation`, `RowStatus` (Task 1); design-system `ToolLayout`, `Button`, `SelectInput`, `TextInput`, `Badge` (`@design-system`); `formatFileSize` (Task 1's `lib/pdfConverter.ts`).
- Produces: default export `PdfToolsPage` (via `index.ts`), mounted by the registry in Task 6.

- [ ] **Step 1: Write `PdfToolsRow.tsx`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Badge, Button, SelectInput, TextInput } from '@design-system';
import { formatFileSize } from '../lib/pdfConverter';
import type { PdfOperation, PdfToolRow, RowStatus } from '../types';

const OPERATION_OPTIONS = [
  { value: 'unlock', label: 'Unlock Password' },
  { value: 'to-image', label: 'Convert to Image' },
];

const STATUS_BADGE: Record<RowStatus, { label: string; variant: 'light' | 'info' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'Pending', variant: 'light' },
  processing: { label: 'Processing…', variant: 'info' },
  done: { label: 'Done', variant: 'success' },
  'needs-password': { label: 'Needs password', variant: 'warning' },
  error: { label: 'Error', variant: 'danger' },
};

export interface PdfToolsRowProps {
  row: PdfToolRow;
  onOperationChange: (operation: PdfOperation) => void;
  onPasswordChange: (password: string) => void;
  onRetry: () => void;
  onDownload: () => void;
  onRemove: () => void;
}

const PdfToolsRow: React.FC<PdfToolsRowProps> = ({
  row,
  onOperationChange,
  onPasswordChange,
  onRetry,
  onDownload,
  onRemove,
}) => {
  const badge = STATUS_BADGE[row.status];

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 text-sm border-b border-gray-100 dark:border-gray-800">
      <span className="flex-[2] truncate" title={row.file.name}>{row.file.name}</span>
      <span className="flex-1 text-gray-500 dark:text-gray-400 text-xs">{formatFileSize(row.file.size)}</span>
      <span className="flex-1">
        <SelectInput
          value={row.operation}
          onChange={(value) => onOperationChange(value as PdfOperation)}
          options={OPERATION_OPTIONS}
          className="mb-0"
        />
      </span>
      <span className="flex-1">
        <Badge variant={badge.variant} inline pill>{badge.label}</Badge>
      </span>
      <span className="flex-[2]">
        {row.status === 'needs-password' && (
          <div className="flex items-center gap-1">
            <TextInput
              type="password"
              placeholder="Password for this file"
              value={row.password}
              onChange={(e) => onPasswordChange(e.target.value)}
              containerClassName="flex-1"
            />
            <Button size="xs" variant="outline-primary" onClick={onRetry}>Retry</Button>
          </div>
        )}
        {row.errorMessage && row.status === 'error' && (
          <span className="text-xs text-red-600 dark:text-red-400">{row.errorMessage}</span>
        )}
      </span>
      <Button
        size="xs"
        variant="text-primary"
        onClick={onDownload}
        disabled={row.status !== 'done'}
      >
        Download
      </Button>
      <button
        type="button"
        aria-label={`Remove ${row.file.name}`}
        onClick={onRemove}
        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-1"
      >
        ×
      </button>
    </div>
  );
};

export default PdfToolsRow;
```

- [ ] **Step 2: Write `PdfToolsToolbar.tsx`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React, { useRef } from 'react';
import { Button, SelectInput, TextInput } from '@design-system';
import type { PdfOperation } from '../types';

const OPERATION_OPTIONS = [
  { value: 'unlock', label: 'Unlock Password' },
  { value: 'to-image', label: 'Convert to Image' },
];

export interface PdfToolsToolbarProps {
  defaultPassword: string;
  onDefaultPasswordChange: (password: string) => void;
  bulkOperation: PdfOperation;
  onBulkOperationChange: (operation: PdfOperation) => void;
  onApplyToAll: () => void;
  onFilesSelected: (files: FileList) => void;
  onStartAll: () => void;
  onDownloadAllAsZip: () => void;
  hasCompletedRows: boolean;
  hasPendingRows: boolean;
}

const PdfToolsToolbar: React.FC<PdfToolsToolbarProps> = ({
  defaultPassword,
  onDefaultPasswordChange,
  bulkOperation,
  onBulkOperationChange,
  onApplyToAll,
  onFilesSelected,
  onStartAll,
  onDownloadAllAsZip,
  hasCompletedRows,
  hasPendingRows,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
      <Button size="sm" variant="primary" onClick={() => fileInputRef.current?.click()}>
        Add PDFs
      </Button>

      <TextInput
        type="password"
        label="Default password"
        placeholder="Applies to all files unless overridden"
        value={defaultPassword}
        onChange={(e) => onDefaultPasswordChange(e.target.value)}
        containerClassName="w-56"
      />

      <span className="flex items-end gap-1">
        <SelectInput
          value={bulkOperation}
          onChange={(value) => onBulkOperationChange(value as PdfOperation)}
          options={OPERATION_OPTIONS}
          className="mb-0 w-44"
        />
        <Button size="sm" variant="outline-secondary" onClick={onApplyToAll}>Apply to all</Button>
      </span>

      <Button size="sm" variant="success" onClick={onStartAll} disabled={!hasPendingRows}>
        Start
      </Button>
      <Button size="sm" variant="outline-primary" onClick={onDownloadAllAsZip} disabled={!hasCompletedRows}>
        Download All as ZIP
      </Button>
    </div>
  );
};

export default PdfToolsToolbar;
```

- [ ] **Step 3: Write `page.tsx`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { ToolLayout } from '@design-system';
import { getToolByRoute } from '../index';
import useBatchPdfTools from './hooks/useBatchPdfTools';
import PdfToolsToolbar from './components/PdfToolsToolbar';
import PdfToolsRow from './components/PdfToolsRow';

const PdfToolsPage: React.FC = () => {
  const vm = useBatchPdfTools();
  const tool = getToolByRoute('/pdf-tools');

  return (
    <ToolLayout
      tool={tool!}
      title="PDF Tools"
      description="Unlock password-protected PDFs or convert them to images, one file or a whole batch, entirely in your browser."
      showRelatedTools
    >
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <PdfToolsToolbar
          defaultPassword={vm.defaultPassword}
          onDefaultPasswordChange={vm.setDefaultPassword}
          bulkOperation={vm.bulkOperation}
          onBulkOperationChange={vm.setBulkOperation}
          onApplyToAll={vm.applyOperationToAll}
          onFilesSelected={vm.addFiles}
          onStartAll={() => {
            void vm.startAll();
          }}
          onDownloadAllAsZip={() => {
            void vm.downloadAllAsZip();
          }}
          hasCompletedRows={vm.rows.some((row) => row.status === 'done')}
          hasPendingRows={vm.rows.some((row) => row.status === 'pending')}
        />

        {vm.rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Add one or more PDFs to get started.
          </p>
        ) : (
          <div>
            {vm.rows.map((row) => (
              <PdfToolsRow
                key={row.id}
                row={row}
                onOperationChange={(operation) => vm.setRowOperation(row.id, operation)}
                onPasswordChange={(password) => vm.setRowPassword(row.id, password)}
                onRetry={() => {
                  void vm.retryRow(row.id);
                }}
                onDownload={() => {
                  void vm.downloadRow(row.id);
                }}
                onRemove={() => vm.removeRow(row.id)}
              />
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToolsPage;
```

- [ ] **Step 4: Write `index.ts`**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
export { default } from './page';
```

- [ ] **Step 5: Write the failing UI smoke test**

```typescript
/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('../src/tools/index', () => ({
  getToolByRoute: () => ({
    id: 'pdf-tools',
    route: '/pdf-tools',
    title: 'PDF Tools',
    description: 'test',
    icon: () => null,
    category: 'Utilities',
    metadata: { keywords: [] },
  }),
}));

import PdfToolsPage from '../src/tools/pdf-tools/page';

describe('PdfToolsPage', () => {
  test('shows an empty-state message with no files added', () => {
    render(<PdfToolsPage />);
    expect(screen.getByText(/add one or more pdfs to get started/i)).toBeInTheDocument();
  });

  test('adding a file renders a row with its name', () => {
    render(<PdfToolsPage />);
    const file = new File([new Uint8Array([1])], 'contract.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run the test to verify it fails, then passes**

Run: `pnpm jest __tests__/tools.pdf-tools.ui.test.tsx -v`
Expected first: FAIL — `Cannot find module '../src/tools/pdf-tools/page'` (before Steps 1-4) or a `getToolByRoute` crash (`tool!` non-null assertion on `undefined`) if `../src/tools/index` isn't mocked yet.
Expected after Steps 1-5: PASS (2 tests).

- [ ] **Step 7: Typecheck and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: same pre-existing `pdf-to-img` registry error as before (fixed next task), no new errors.

- [ ] **Step 8: Commit**

```bash
git add src/tools/pdf-tools/components src/tools/pdf-tools/page.tsx src/tools/pdf-tools/index.ts __tests__/tools.pdf-tools.ui.test.tsx
git commit -m "feat(pdf-tools): add compact batch table UI"
```

---

### Task 6: Wire up the registry, route redirect, and final verification

**Files:**
- Modify: `src/tools/index.ts:622` (the `pdf-to-image` entry)
- Modify: `src/app/routes.tsx`

**Interfaces:**
- Consumes: `PdfToolsPage` (Task 5, via `lazy(() => import('./pdf-tools/index'))`).
- Produces: nothing further — this is the final integration task.

- [ ] **Step 1: Update the registry entry**

In `src/tools/index.ts`, find the `pdf-to-image` entry (around line 622):

```typescript
  {
    id: "pdf-to-image",
    route: "/pdf-to-img",
    title: "PDF to Image Converter",
    description:
      "Convert PDF pages to PNG, JPG, or WebP images directly in your browser.",
    longDescription:
      "Transform PDF documents into high-quality raster images entirely in your browser. Supports PNG (lossless), JPG (compressed), and WebP formats with adjustable quality and resolution. Batch convert multiple pages and download as a ZIP file. No server uploads required.",
    icon: PdfToImageIcon,
    component: lazy(() => import("./pdf-to-img/index")),
    category: "Conversion",
    isNew: true,
    metadata: {
      keywords: [
        "pdf to image",
        "pdf to png",
        "pdf to jpg",
        "pdf to jpeg",
        "pdf to webp",
        "convert pdf",
        "pdf converter",
        "rasterize pdf",
        "pdf export",
        "document converter",
      ],
      learnMoreUrl: "https://en.wikipedia.org/wiki/PDF",
      relatedTools: ["img-to-svg", "image-compressor", "qrcode-generator"],
    },
    uiOptions: { showExamples: false, fullWidth: true },
  },
```

Replace it with:

```typescript
  {
    id: "pdf-tools",
    route: "/pdf-tools",
    title: "PDF Tools",
    description:
      "Unlock password-protected PDFs and convert PDF pages to images, one file or a whole batch.",
    longDescription:
      "A batch-friendly PDF toolkit that runs entirely in your browser: remove passwords from one or many PDFs at once using QPDF compiled to WebAssembly, or convert PDF pages to PNG images. Mix operations per file or apply one to the whole batch, then download results individually or as a single ZIP. No server uploads required.",
    icon: PdfToImageIcon,
    component: lazy(() => import("./pdf-tools/index")),
    category: "Conversion",
    isNew: true,
    metadata: {
      keywords: [
        "pdf password remover",
        "unlock pdf",
        "remove pdf password",
        "pdf decrypt",
        "batch pdf",
        "pdf to image",
        "pdf to png",
        "convert pdf",
        "pdf converter",
        "document converter",
      ],
      learnMoreUrl: "https://en.wikipedia.org/wiki/PDF",
      relatedTools: ["img-to-svg", "image-compressor", "qrcode-generator"],
    },
    uiOptions: { showExamples: false, fullWidth: true },
  },
```

- [ ] **Step 2: Add the redirect for the old route**

In `src/app/routes.tsx`, add `Navigate` to the react-router-dom import:

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
```

Then add a redirect route right before the tool-registry map (inside `<Routes>`, after the `TermsOfService` route):

```typescript
      <Route path="/pdf-to-img" element={<Navigate to="/pdf-tools" replace />} />
      <Route path="/pdf-to-img/*" element={<Navigate to="/pdf-tools" replace />} />
```

- [ ] **Step 3: Typecheck, lint, and run the full test suite**

Run: `pnpm typecheck`
Expected: PASS — no errors (this is the first time it's clean since Task 3).

Run: `pnpm lint`
Expected: PASS with `--max-warnings 0`.

Run: `pnpm test`
Expected: PASS — all existing tests plus the four new `tools.pdf-tools.*` test files.

- [ ] **Step 4: Manual verification (the part unit tests can't cover)**

Run: `pnpm dev`, open `http://localhost:5173/pdf-tools`, and check:
1. Old URL `http://localhost:5173/pdf-to-img` redirects to `/pdf-tools`.
2. "Add PDFs" accepts multiple files at once; each becomes a row.
3. Drop in a PDF that is password-protected with a real user password (create one with any PDF tool, or reuse a known test fixture). Enter the correct password as the "Default password", click Start — row goes `pending → processing → done`, "Download" produces a PDF that opens without a password prompt.
4. Same file with a wrong default password — row goes to `needs-password`; type the correct password into the row's own field and click "Retry" — row completes.
5. Drop in an unencrypted PDF with operation "Unlock Password" — it still completes successfully (pass-through case).
6. Switch a row's operation to "Convert to Image", start it, download — get a ZIP of PNG pages.
7. With 2+ completed rows, "Download All as ZIP" produces one archive containing all outputs.

If Step 4.3 fails (the actual QPDF decrypt doesn't work as expected — this is the one part of the design that couldn't be verified ahead of time, see the design doc's "Key technical finding" section), stop and re-check: the `qpdf.wasm` locate path from Task 2 Step 2, whether `callMain`'s exit code convention matches what `qpdfWorker.ts` assumes, and whether the `--decrypt` flag combination needs adjustment (e.g. some qpdf builds want `--decrypt` before the password flag, or need `--` before the output path). Fix in `qpdfWorker.ts` only — the client/hook/UI layers don't need to change.

- [ ] **Step 5: Commit**

```bash
git add src/tools/index.ts src/app/routes.tsx
git commit -m "feat(pdf-tools): wire up /pdf-tools route and redirect the old /pdf-to-img URL"
```

---

## Self-Review Notes

- **Spec coverage:** Tool placement/routing → Task 6. Per-file operation model → Task 4/5. Compact dense-table layout → Task 5. QPDF unlock engine in a worker → Task 2. Convert-to-image reuse → Task 1 (copy) + Task 4 (invocation). ZIP output (per-row and "download all") → Task 1 (`batchZip.ts`) + Task 4 (`downloadRow`/`downloadAllAsZip`). New dependency → Task 2. Error handling (wrong password, retry, non-PDF) → Task 4. Testing approach (no wasm in jsdom, manual QA instead) → Task 2 and Task 6 Step 4.
- **Placeholder scan:** none found — every step has complete, runnable code.
- **Type consistency:** `PdfToolRow`, `PdfOperation`, `RowStatus` defined once in Task 1 and reused verbatim in Tasks 2, 4, 5. `UnlockResult`/`UnlockSuccess`/`UnlockFailure` defined in Task 2, consumed as-is in Task 4. `UseBatchPdfToolsReturn` defined in Task 4, consumed as-is in Task 5.
