/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export function createParseWorker(): Worker {
  // Vite-compatible worker import
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const worker = new Worker(new URL("../worker/parseWorker.ts", import.meta.url), {
    type: "module",
    name: "bson-csv-parse-worker",
  });
  return worker;
}

export default createParseWorker;
