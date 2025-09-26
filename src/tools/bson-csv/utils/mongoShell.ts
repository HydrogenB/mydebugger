/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface MongoShellHandler {
  prefix: string;
  pattern: RegExp;
  replace(match: RegExpExecArray): string;
}

const HANDLERS: MongoShellHandler[] = [
  {
    prefix: "ISODate",
    pattern: /^ISODate\(\s*(["'])(.*?)\1\s*\)/,
    replace: (match) => `"${match[2]}"`,
  },
  {
    prefix: "ObjectId",
    pattern: /^ObjectId\(\s*(["'])([0-9a-fA-F]{24})\1\s*\)/,
    replace: (match) => `"${match[2]}"`,
  },
  {
    prefix: "NumberLong",
    pattern: /^NumberLong\(\s*(["']?)(-?\d+)\1\s*\)/,
    replace: (match) => `"${match[2]}"`,
  },
  {
    prefix: "NumberInt",
    pattern: /^NumberInt\(\s*(["']?)(-?\d+)\1\s*\)/,
    replace: (match) => `"${match[2]}"`,
  },
  {
    prefix: "NumberDecimal",
    pattern: /^NumberDecimal\(\s*(["'])(.*?)\1\s*\)/,
    replace: (match) => `"${match[2]}"`,
  },
  {
    prefix: "UUID",
    pattern: /^UUID\(\s*(["'])(.*?)\1\s*\)/,
    replace: (match) => `"${match[2]}"`,
  },
  {
    prefix: "BinData",
    pattern: /^BinData\(\s*(\d+)\s*,\s*(["'])(.*?)\2\s*\)/,
    replace: (match) => `"base64:${match[3]}"`,
  },
];

function isQuote(char: string): boolean {
  return char === '"' || char === "'";
}

function copyStringLiteral(input: string, start: number): { end: number } {
  const quote = input[start];
  let i = start + 1;
  let escaped = false;
  while (i < input.length) {
    const ch = input[i];
    if (escaped) {
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else if (ch === quote) {
      i += 1;
      break;
    }
    i += 1;
  }
  return { end: i };
}

export function normalizeMongoShellExtendedTypes(input: string): string {
  if (!input) return input;
  let result = "";
  let index = 0;
  while (index < input.length) {
    const ch = input[index];
    if (isQuote(ch)) {
      const { end } = copyStringLiteral(input, index);
      result += input.slice(index, end);
      index = end;
      continue;
    }

    let handled = false;
    if ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z")) {
      for (const handler of HANDLERS) {
        if (input.startsWith(handler.prefix, index)) {
          const slice = input.slice(index);
          const match = handler.pattern.exec(slice);
          if (match) {
            result += handler.replace(match);
            index += match[0].length;
            handled = true;
          }
          break;
        }
      }
    }

    if (handled) {
      continue;
    }

    result += ch;
    index += 1;
  }
  return result;
}

export default normalizeMongoShellExtendedTypes;
