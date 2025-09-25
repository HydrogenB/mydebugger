/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import type { KeyOrder } from "../types";

export interface SchemaAccumulator {
  keysSet: Set<string>;
  firstSeenOrder: string[]; // preserves insertion order for first-seen
}

export function createSchemaAccumulator(): SchemaAccumulator {
  return {
    keysSet: new Set<string>(),
    firstSeenOrder: [],
  };
}

export function addFlatKeys(acc: SchemaAccumulator, flat: Record<string, unknown>): void {
  for (const k of Object.keys(flat)) {
    if (!acc.keysSet.has(k)) {
      acc.keysSet.add(k);
      acc.firstSeenOrder.push(k);
    }
  }
}

export function finalizeColumns(acc: SchemaAccumulator, order: KeyOrder): string[] {
  switch (order) {
    case "alpha":
      return Array.from(acc.keysSet).sort((a, b) => a.localeCompare(b));
    case "first-seen":
      return [...acc.firstSeenOrder];
    case "custom":
      // For v1, treat as first-seen. Custom ordering UI could allow rearranging later.
      return [...acc.firstSeenOrder];
    default:
      return [...acc.firstSeenOrder];
  }
}
