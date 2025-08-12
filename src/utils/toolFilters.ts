/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface Identifiable { id: string }

export function excludeById<T extends Identifiable>(items: T[], exclude: T[]): T[] {
  return items.filter(item => !exclude.some(e => e.id === item.id));
}

export function sortByTitle<T extends { title: string }>(
  items: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) =>
    order === 'asc'
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title)
  );
}
