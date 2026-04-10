/**
 * © 2025 MyDebugger Contributors – MIT License
 * ViewModel hook for the Permission Tester tool.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PERMISSIONS,
  PermissionDef,
  PermissionStatus,
  checkPermissionStatus,
  requestPermissionWithTimeout,
  cleanupPermissionData,
  generateCodeSnippet,
} from '../lib/permissions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface PermissionState {
  def: PermissionDef;
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';
  error?: string;
  data?: unknown;
  showPreview: boolean;
  showCode: boolean;
}

export type EventAction = 'request' | 'grant' | 'deny' | 'error';

export interface EventEntry {
  id: string;
  ts: Date;
  permissionId: string;
  permissionName: string;
  action: EventAction;
  detail?: string;
}

export interface PermissionTesterVM {
  permissions: PermissionState[];
  filteredPermissions: PermissionState[];
  events: EventEntry[];
  search: string;
  setSearch: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  stats: { granted: number; denied: number; unsupported: number; total: number };
  requestPermission: (id: string) => Promise<void>;
  togglePreview: (id: string) => void;
  toggleCode: (id: string) => void;
  copyCode: (id: string) => void;
  clearEvents: () => void;
  copyEventLog: () => void;
  exportResults: () => void;
  retryDenied: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePermissionTester(): PermissionTesterVM {
  const [permissions, setPermissions] = useState<PermissionState[]>(
    () => PERMISSIONS.map(def => ({ def, status: 'idle', showPreview: false, showCode: false })),
  );
  const [events, setEvents] = useState<EventEntry[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // ── Initial status check on mount ────────────────────────────────────────
  useEffect(() => {
    PERMISSIONS.forEach(async (def) => {
      try {
        const status = await checkPermissionStatus(def);
        setPermissions(prev =>
          prev.map(p =>
            p.def.id === def.id
              ? { ...p, status: status === 'unsupported' ? 'unsupported' : status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'idle' }
              : p,
          ),
        );
      } catch {
        // ignore
      }
    });
  }, []);

  // ── addEvent ─────────────────────────────────────────────────────────────
  const addEvent = useCallback((permissionId: string, permissionName: string, action: EventAction, detail?: string) => {
    const entry: EventEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ts: new Date(),
      permissionId,
      permissionName,
      action,
      detail,
    };
    setEvents(prev => [entry, ...prev].slice(0, 100));
  }, []);

  // ── requestPermission ─────────────────────────────────────────────────────
  const requestPermission = useCallback(async (id: string) => {
    const pState = permissions.find(p => p.def.id === id);
    if (!pState || pState.status === 'loading' || pState.status === 'unsupported') return;

    // Cleanup any existing data
    if (pState.data) cleanupPermissionData(id, pState.data);

    setPermissions(prev =>
      prev.map(p => (p.def.id === id ? { ...p, status: 'loading', error: undefined, data: undefined, showPreview: false } : p)),
    );
    addEvent(id, pState.def.displayName, 'request');

    try {
      const data = await requestPermissionWithTimeout(pState.def);
      setPermissions(prev =>
        prev.map(p => (p.def.id === id ? { ...p, status: 'granted', data, error: undefined } : p)),
      );
      addEvent(id, pState.def.displayName, 'grant');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isDenied =
        msg.toLowerCase().includes('denied') ||
        msg.toLowerCase().includes('not allowed') ||
        msg.toLowerCase().includes('permission');

      setPermissions(prev =>
        prev.map(p =>
          p.def.id === id
            ? { ...p, status: isDenied ? 'denied' : 'idle', error: msg, data: undefined }
            : p,
        ),
      );
      addEvent(id, pState.def.displayName, isDenied ? 'deny' : 'error', msg);
    }
  }, [permissions, addEvent]);

  // ── togglePreview ─────────────────────────────────────────────────────────
  const togglePreview = useCallback((id: string) => {
    setPermissions(prev =>
      prev.map(p => (p.def.id === id ? { ...p, showPreview: !p.showPreview } : p)),
    );
  }, []);

  // ── toggleCode ────────────────────────────────────────────────────────────
  const toggleCode = useCallback((id: string) => {
    setPermissions(prev =>
      prev.map(p => (p.def.id === id ? { ...p, showCode: !p.showCode } : p)),
    );
  }, []);

  // ── copyCode ──────────────────────────────────────────────────────────────
  const copyCode = useCallback((id: string) => {
    const snippet = generateCodeSnippet(id);
    navigator.clipboard.writeText(snippet).catch(() => {});
  }, []);

  // ── clearEvents ───────────────────────────────────────────────────────────
  const clearEvents = useCallback(() => setEvents([]), []);

  // ── copyEventLog ──────────────────────────────────────────────────────────
  const copyEventLog = useCallback(() => {
    const text = events
      .map(e => `[${e.ts.toLocaleTimeString()}] ${e.permissionName} — ${e.action}${e.detail ? ': ' + e.detail : ''}`)
      .join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  }, [events]);

  // ── exportResults ─────────────────────────────────────────────────────────
  const exportResults = useCallback(() => {
    const output = permissions.map(p => ({
      id: p.def.id,
      name: p.def.displayName,
      category: p.def.category,
      status: p.status,
      error: p.error,
    }));
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permission-test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [permissions]);

  // ── retryDenied ───────────────────────────────────────────────────────────
  const retryDenied = useCallback(async () => {
    const denied = permissions.filter(p => p.status === 'denied');
    for (const p of denied) {
      await requestPermission(p.def.id);
      await new Promise(r => setTimeout(r, 500));
    }
  }, [permissions, requestPermission]);

  // ── stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    granted: permissions.filter(p => p.status === 'granted').length,
    denied: permissions.filter(p => p.status === 'denied').length,
    unsupported: permissions.filter(p => p.status === 'unsupported').length,
    total: permissions.length,
  }), [permissions]);

  // ── filteredPermissions ───────────────────────────────────────────────────
  const filteredPermissions = useMemo(() => {
    const q = search.toLowerCase();
    return permissions.filter(p => {
      const matchCat = categoryFilter === 'all' || p.def.category === categoryFilter;
      const matchSearch =
        !q ||
        p.def.displayName.toLowerCase().includes(q) ||
        p.def.description.toLowerCase().includes(q) ||
        p.def.id.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [permissions, search, categoryFilter]);

  return {
    permissions,
    filteredPermissions,
    events,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    stats,
    requestPermission,
    togglePreview,
    toggleCode,
    copyCode,
    clearEvents,
    copyEventLog,
    exportResults,
    retryDenied,
  };
}
