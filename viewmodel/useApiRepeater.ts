/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseCurl, exportLogs, ParsedHttpCurl } from '../model/apiRepeater';

const profileKey = 'api-repeater-profile';

const useApiRepeater = () => {
  const [curl, setCurl] = useState('');
  const [delay, setDelay] = useState(1000);
  const [parsed, setParsed] = useState<ParsedHttpCurl | null>(null);
  const [reqLogs, setReqLogs] = useState<string[]>([]);
  const [resLogs, setResLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number>();

  useEffect(() => {
    const stored = localStorage.getItem(profileKey);
    if (stored) {
      try {
        const profile = JSON.parse(stored);
        setCurl(profile.curl || '');
        setDelay(profile.delay || 1000);
        if (profile.curl) setParsed(parseCurl(profile.curl));
      } catch {
        // ignore malformed profile
      }
    }
  }, []);

  const parse = useCallback(() => {
    try {
      const p = parseCurl(curl);
      setParsed(p);
      setError(null);
      return p;
    } catch (e) {
      setParsed(null);
      setError((e as Error).message);
      return null;
    }
  }, [curl]);

  const start = useCallback(() => {
    const p = parsed || parse();
    if (!p) return;
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(async () => {
      const startTime = performance.now();
      setReqLogs(l => [`${new Date().toISOString()} ➜ ${p.method} ${p.url}`, ...l]);
      try {
        const res = await fetch(p.url, {
          method: p.method,
          headers: p.headers,
          body: p.body || undefined,
        });
        const text = await res.text();
        const dur = Math.round(performance.now() - startTime);
        setResLogs(l => [`${new Date().toISOString()} ⇐ ${res.status} in ${dur}ms ${text}`, ...l]);
      } catch (err) {
        const dur = Math.round(performance.now() - startTime);
        setResLogs(l => [`${new Date().toISOString()} ✖ error in ${dur}ms ${(err as Error).message}`, ...l]);
      }
    }, delay);
    setRunning(true);
  }, [delay, parsed, parse]);

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
    setRunning(false);
  }, []);

  const clearLogs = () => {
    setReqLogs([]);
    setResLogs([]);
  };

  const saveProfile = () => {
    localStorage.setItem(profileKey, JSON.stringify({ curl, delay }));
  };

  const exportLogFile = () => exportLogs([...reqLogs, '---', ...resLogs]);

  return {
    curl,
    setCurl,
    delay,
    setDelay,
    parsed,
    reqLogs,
    resLogs,
    running,
    error,
    parse,
    start,
    stop,
    clearLogs,
    saveProfile,
    exportLogFile,
  };
};

export default useApiRepeater;
