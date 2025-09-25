/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import type { InputFormat } from "../types";

/**
 * Best-effort input detection based on a small prefix of the file.
 * - If the user forces a format, that is returned directly.
 * - If the file starts with a valid BSON length (little-endian int32) within reasonable bounds, assume BSON.
 * - If decodes as text JSON starting with '[' -> json-array.
 * - If first non-space is '{' and there are newlines soon -> ndjson; otherwise fallback to ndjson for .txt.
 */
export async function detectFileFormat(
  file: File,
  forced: InputFormat,
): Promise<InputFormat | null> {
  if (forced && forced !== "auto") return forced;

  // Try BSON: read first 8 bytes to get the length prefix
  try {
    const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    if (head.length >= 4) {
      const view = new DataView(head.buffer, head.byteOffset, head.byteLength);
      const len = view.getInt32(0, true);
      if (len >= 5 && len <= file.size) {
        // Heuristic: BSON docs are at least 5 bytes and length-prefixed within file size
        return "bson";
      }
    }
  } catch {
    // ignore and continue
  }

  // Try text sniff
  try {
    const textBytes = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const text = decoder.decode(textBytes);
    const trimmed = text.trimStart();
    if (trimmed.startsWith("[")) return "json-array";
    if (trimmed.startsWith("{")) {
      // Look for newline soon after to suggest NDJSON; otherwise default to NDJSON since dumps often are line-delimited
      const nl = text.indexOf("\n");
      return nl > 0 ? "ndjson" : "ndjson";
    }
  } catch {
    // ignore
  }

  return "ndjson"; // default fallback for .txt-like inputs
}

export default detectFileFormat;
