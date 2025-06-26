/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useRef, useState } from 'react';
import {
  getStorageSnapshot,
  StorageEntry,
  entriesToEnv,
  diffSnapshots,
  DiffResult,
  isJsonValid,
} from '../model/storage';

export type StorageArea = 'localStorage' | 'sessionStorage';

export const useStorageDebugger = () => {
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [tab, setTab] = useState<StorageArea>('localStorage');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<Record<string, 'changed' | 'removed'>>({});
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const pending = useRef<Record<string, { value: string; area: StorageArea }>>({});
  const timer = useRef<number>();
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setFilter(search), 300);
    return () => window.clearTimeout(id);
  }, [search]);

  const refresh = () => {
    setEntries(getStorageSnapshot());
  };

  const markHighlight = (k: string, type: 'changed' | 'removed') => {
    setHighlights((h) => ({ ...h, [k]: type }));
    window.setTimeout(() => {
      setHighlights((h) => {
        const copy = { ...h };
        delete copy[k];
        return copy;
      });
    }, 800);
  };

  const flushPending = () => {
    const batch = pending.current;
    pending.current = {};
    Object.entries(batch).forEach(([id, { value }]) => {
      const [a, key] = id.split(':');
      const store = a === 'localStorage' ? localStorage : sessionStorage;
      store.setItem(key, value);
      markHighlight(id, 'changed');
    });
    refresh();
  };

  const scheduleFlush = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flushPending, 300);
  };

  const editEntry = (key: string, value: string, area: StorageArea) => {
    setEntries((prev) =>
      prev.map((e) => (e.key === key && e.area === area ? { ...e, value } : e)),
    );
    pending.current[`${area}:${key}`] = { value, area };
    scheduleFlush();
  };

  const removeEntry = (key: string, area: StorageArea) => {
    delete pending.current[`${area}:${key}`];
    const store = area === 'localStorage' ? localStorage : sessionStorage;
    store.removeItem(key);
    markHighlight(`${area}:${key}`, 'removed');
    refresh();
  };

  const exportJson = () => {
    const data = entries.filter((e) => e.area === tab);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tab}-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEnv = () => {
    const data = entries.filter((e) => e.area === tab);
    const blob = new Blob([entriesToEnv(data)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tab}-${new Date().toISOString()}.env`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const requestDiff = () => {
    setDiff(null);
    channelRef.current?.postMessage({ type: 'snapshot-request' });
  };

  useEffect(() => {
    refresh();
    const handler = (e: StorageEvent) => {
      const area: StorageArea =
        e.storageArea === localStorage ? 'localStorage' : 'sessionStorage';
      setEvents((prev) => [
        `${new Date().toLocaleTimeString()} ${area} ${e.key ?? ''} changed`,
        ...prev.slice(0, 19),
      ]);
      refresh();
    };
    window.addEventListener('storage', handler);
    const ch = new BroadcastChannel('storage-sync-debugger');
    channelRef.current = ch;
    const msg = (ev: MessageEvent) => {
      if (ev.data?.type === 'snapshot-request') {
        ch.postMessage({ type: 'snapshot-response', data: getStorageSnapshot() });
      } else if (ev.data?.type === 'snapshot-response') {
        const other = ev.data.data as StorageEntry[];
        setDiff(diffSnapshots(getStorageSnapshot(), other));
      }
    };
    ch.addEventListener('message', msg);
    return () => {
      window.removeEventListener('storage', handler);
      ch.removeEventListener('message', msg);
      ch.close();
    };
  }, []);

  return {
    tab,
    setTab,
    search,
    setSearch,
    entries: entries
      .filter((e) => e.area === tab)
      .filter(
        (e) =>
          !filter ||
          e.key.toLowerCase().includes(filter.toLowerCase()) ||
          e.value.toLowerCase().includes(filter.toLowerCase()),
      ),
    editEntry,
    removeEntry,
    exportJson,
    exportEnv,
    events,
    highlights,
    diff,
    requestDiff,
    isJsonValid,
  };
};

export default useStorageDebugger;
