/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface Identifiable { id: string }

export function excludeById<T extends Identifiable>(items: T[], exclude: T[]): T[] {
  return items.filter(item => !exclude.some(e => e.id === item.id));
}
