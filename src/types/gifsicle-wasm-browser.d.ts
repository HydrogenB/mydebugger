/**
 * © 2026 MyDebugger Contributors – MIT License
 */
declare module 'gifsicle-wasm-browser' {
  interface RunOptions {
    input: { file: string | File | Blob | ArrayBuffer; name: string }[];
    command: string[];
    folder?: string[];
    isStrict?: boolean;
  }
  const gifsicle: { run(opts: RunOptions): Promise<File[]> };
  export default gifsicle;
}
