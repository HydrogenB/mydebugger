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
    // The shipped types omit writeFile from EmscriptenFS even though the
    // real Emscripten FS exposes it at runtime; EmscriptenFS isn't exported
    // from the package so it can't be fixed via declaration merging — cast
    // at this one call site instead.
    (qpdf.FS as typeof qpdf.FS & { writeFile(path: string, data: Uint8Array): void }).writeFile(
      '/input.pdf',
      bytes,
    );

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
