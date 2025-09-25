/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import type { FlattenOptions, NullPolicy, NumericOptions } from "../types";
import { ObjectId, Decimal128, Long, BSONRegExp, Binary, Timestamp } from "bson";

export type FlatRecord = Record<string, string>;

interface FlattenContext {
  options: FlattenOptions;
  numerics: NumericOptions;
  nullPolicy: NullPolicy;
}

export function flattenObject(
  input: unknown,
  ctx: FlattenContext,
): FlatRecord {
  const out: FlatRecord = {};
  innerFlatten(input, out, "", ctx);
  return out;
}

function innerFlatten(
  value: unknown,
  out: FlatRecord,
  path: string,
  ctx: FlattenContext,
): void {
  if (isNullish(value)) {
    out[path] = ctx.nullPolicy === "literal-null" ? (value === null ? "null" : "undefined") : "";
    return;
  }

  if (Array.isArray(value)) {
    const { strategy, maxArrayLength, joinDelimiter } = ctx.options;
    if (strategy === "join") {
      if (value.every(isScalarish)) {
        const joined = value.map((v) => scalarToString(v, ctx)).join(joinDelimiter);
        out[path] = joined;
        return;
      }
      // fallback to index for complex arrays
    }

    if (strategy === "explode") {
      // NOTE: true explode is handled at a higher layer during row generation.
      // Here we fallback to indexing to avoid combinatorial blowups in flatten step.
    }

    const n = maxArrayLength === 0 ? value.length : Math.min(value.length, maxArrayLength);
    for (let i = 0; i < n; i += 1) {
      const childPath = path ? `${path}[${i}]` : `[${i}]`;
      innerFlatten(value[i], out, childPath, ctx);
    }
    if (value.length > n) {
      out[`${path}.__truncated`] = String(value.length);
    }
    return;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      out[path] = "";
      return;
    }
    for (const [k, v] of entries) {
      const key = normalizeKey(k);
      const nextPath = path ? `${path}.${key}` : key;
      innerFlatten(v, out, nextPath, ctx);
    }
    return;
  }

  // Scalars (including BSON special types)
  out[path] = scalarToString(value, ctx);
}

function isNullish(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && !(v instanceof Date) && !isBsonSpecial(v);
}

function isScalarish(v: unknown): boolean {
  return (
    v === null ||
    v === undefined ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean" ||
    v instanceof Date ||
    isBsonSpecial(v)
  );
}

function isBsonSpecial(v: unknown): boolean {
  return (
    v instanceof ObjectId ||
    v instanceof Decimal128 ||
    v instanceof Long ||
    v instanceof BSONRegExp ||
    v instanceof Binary ||
    v instanceof Timestamp
  );
}

function normalizeKey(key: string): string {
  // Preserve case; replace tabs/newlines in keys; escape dots
  return replaceAllStr(replaceAllStr(replaceAllStr(key, "\n", " "), "\t", " "), ".", "\\.");
}

function scalarToString(v: unknown, ctx: FlattenContext): string {
  if (v === null) return ctx.nullPolicy === "literal-null" ? "null" : "";
  if (v === undefined) return ctx.nullPolicy === "literal-null" ? "undefined" : "";

  // BSON mappings
  if (v instanceof ObjectId) return v.toHexString();
  if (v instanceof Date) return v.toISOString();
  if (v instanceof Decimal128) return v.toString();
  if (v instanceof Long) return ctx.numerics.stringifyIntegers ? v.toString() : String(v.toNumber());
  if (v instanceof Binary) return `base64:${btoa(String.fromCharCode(...v.buffer))}`;
  if (v instanceof BSONRegExp) return `/${v.pattern}/${v.options}`;
  if (v instanceof Timestamp) return new Date(v.getHighBits() * 1000).toISOString();

  switch (typeof v) {
    case "string":
      return v;
    case "number":
      if (!Number.isFinite(v)) return ctx.numerics.stringifyFloats ? String(v) : "";
      return ctx.numerics.stringifyFloats ? String(v) : String(v);
    case "boolean":
      return v ? "true" : "false";
    default:
      try {
        return JSON.stringify(v);
      } catch {
        return String(v);
      }
  }
}

function replaceAllStr(s: string, search: string, replacement: string): string {
  if (search === "") return s;
  return s.split(search).join(replacement);
}
