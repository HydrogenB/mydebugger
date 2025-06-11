/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export interface StorageEntry {
  key: string;
  value: string;
  domain: string;
  size: number;
  area: 'localStorage' | 'sessionStorage';
}

const gatherEntries = (storage: Storage, area: 'localStorage' | 'sessionStorage', domain: string): StorageEntry[] => {
  const out: StorageEntry[] = [];
  for (let i = 0; i < storage.length; i += 1) {
    const k = storage.key(i);
    if (k) {
      const v = storage.getItem(k) ?? '';
      out.push({ key: k, value: v, domain, size: k.length + v.length, area });
    }
  }
  return out;
};

export const getStorageSnapshot = (): StorageEntry[] => {
  const domain = window.location.hostname;
  return [
    ...gatherEntries(localStorage, 'localStorage', domain),
    ...gatherEntries(sessionStorage, 'sessionStorage', domain),
  ];
};

export const entriesToEnv = (entries: StorageEntry[]): string =>
  entries
    .map((e) => `${e.key}=${JSON.stringify(e.value)}`)
    .join('\n');

export interface DiffResult {
  added: StorageEntry[];
  removed: StorageEntry[];
  changed: Array<{ key: string; before: string; after: string }>;
}

export const diffSnapshots = (
  current: StorageEntry[],
  other: StorageEntry[],
): DiffResult => {
  const id = (e: StorageEntry) => `${e.area}|${e.key}`;
  const mapA = new Map(current.map((e) => [id(e), e]));
  const mapB = new Map(other.map((e) => [id(e), e]));
  const added: StorageEntry[] = [];
  const removed: StorageEntry[] = [];
  const changed: Array<{ key: string; before: string; after: string }> = [];

  mapB.forEach((entry, key) => {
    if (!mapA.has(key)) {
      added.push(entry);
    }
  });

  mapA.forEach((entry, key) => {
    const otherEntry = mapB.get(key);
    if (!otherEntry) {
      removed.push(entry);
    } else if (otherEntry.value !== entry.value) {
      changed.push({ key: entry.key, before: entry.value, after: otherEntry.value });
    }
  });

  return { added, removed, changed };
};

export const isJsonValid = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return true;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

export default getStorageSnapshot;
