/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface StayAwakeStats {
  todayMs: number;
  weekMs: number;
  lastDate: string; // ISO yyyy-mm-dd
  weekStart: string; // ISO start of week
}

const STORAGE_KEY = 'stayawake-stats';

const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

const getWeekStart = (d: Date): string => {
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday start
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - diff);
  return isoDate(start);
};

const defaultStats = (): StayAwakeStats => {
  const now = new Date();
  return { todayMs: 0, weekMs: 0, lastDate: isoDate(now), weekStart: getWeekStart(now) };
};

export const loadStats = (): StayAwakeStats => {
  if (typeof window === 'undefined') return defaultStats();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    const parsed = JSON.parse(raw) as StayAwakeStats;
    const now = new Date();
    if (parsed.lastDate !== isoDate(now)) {
      parsed.todayMs = 0;
      parsed.lastDate = isoDate(now);
    }
    if (parsed.weekStart !== getWeekStart(now)) {
      parsed.weekMs = 0;
      parsed.weekStart = getWeekStart(now);
    }
    return parsed;
  } catch {
    return defaultStats();
  }
};

const saveStats = (stats: StayAwakeStats): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

export const addAwakeTime = (ms: number): StayAwakeStats => {
  const stats = loadStats();
  stats.todayMs += ms;
  stats.weekMs += ms;
  saveStats(stats);
  return stats;
};

export const resetStats = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
