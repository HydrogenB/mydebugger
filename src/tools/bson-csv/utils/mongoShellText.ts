/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { normalizeMongoShellExtendedTypes } from "./mongoShell";

export interface MongoShellParseOptions {
  onWarning?: (message: string) => void;
}

const warn = (options: MongoShellParseOptions | undefined, message: string) => {
  options?.onWarning?.(message);
};

export function hasMongoShellMarkers(text: string): boolean {
  return /\/\*\s*\d+\s*\*\//.test(text) ||
    /(ISODate|ObjectId|NumberLong|NumberInt|NumberDecimal|UUID|BinData)\(/.test(text);
}

function parseDocument(
  raw: string,
  options?: MongoShellParseOptions,
): Record<string, unknown> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const normalized = normalizeMongoShellExtendedTypes(trimmed);
    const parsed = JSON.parse(normalized);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    warn(options, "Malformed JSON document skipped");
  }
  return null;
}

export function parseMongoShellDump(
  text: string,
  options?: MongoShellParseOptions,
): Record<string, unknown>[] {
  const docs: Record<string, unknown>[] = [];
  let inBlockComment = false;
  let inString = false;
  let escape = false;
  let started = false;
  let depth = 0;
  let curr = "";

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = i + 1 < text.length ? text[i + 1] : "";

    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (!inString && ch === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (started) {
      curr += ch;
      if (inString) {
        if (escape) {
          escape = false;
        } else if (ch === "\\") {
          escape = true;
        } else if (ch === '"') {
          inString = false;
        }
        continue;
      }
      if (ch === '"') {
        inString = true;
        continue;
      }
      if (ch === "{") {
        depth += 1;
        continue;
      }
      if (ch === "}") {
        depth -= 1;
        if (depth === 0) {
          const parsed = parseDocument(curr, options);
          if (parsed) {
            docs.push(parsed);
          }
          curr = "";
          started = false;
        }
        continue;
      }
      continue;
    }

    if (!inString && ch === "{") {
      started = true;
      depth = 1;
      curr = "{";
      continue;
    }
  }

  if (started && curr.trim()) {
    const parsed = parseDocument(curr, options);
    if (parsed) {
      docs.push(parsed);
    }
  }

  return docs;
}

export default parseMongoShellDump;
