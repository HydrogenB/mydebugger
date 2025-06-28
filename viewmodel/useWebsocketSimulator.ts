/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  parseCurl,
  textToHex,
  hexToText,
  exportLogs,
} from '../model/websocketSimulator';

export interface WsLogEntry {
  direction: 'send' | 'recv';
  text: string;
  size: number;
  time: number;
}

const profileKey = 'ws-pub-sim-profile';

const useWebsocketSimulator = () => {
  const [curl, setCurl] = useState('');
  const [url, setUrl] = useState('');
  const [origin, setOrigin] = useState('');
  const [payload, setPayload] = useState('');
  const [payloads, setPayloads] = useState<string[]>([]);
  const [hexMode, setHexMode] = useState(false);
  const [delay, setDelay] = useState(100);
  const [logs, setLogs] = useState<WsLogEntry[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number>();
  const indexRef = useRef(0);

  useEffect(() => {
    const loaded = localStorage.getItem(profileKey);
    if (loaded) {
      try {
        const profile = JSON.parse(loaded);
        setCurl(profile.curl);
        const parsed = parseCurl(profile.curl);
        setUrl(parsed.url);
        setOrigin(parsed.origin);
        setPayloads(profile.payloads || []);
        setDelay(profile.delay || 100);
      } catch {
        // ignore
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    const parsed = parseCurl(curl);
    setUrl(parsed.url);
    setOrigin(parsed.origin);
    if (!parsed.url) return;
    const ws = new WebSocket(parsed.url, []);
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      const reader = new FileReader();
      reader.onload = () => {
        setLogs((l) => [
          { direction: 'recv', text: reader.result as string, size: (reader.result as string).length, time: Date.now() },
          ...l,
        ]);
      };
      reader.readAsText(ev.data);
    };
    ws.onclose = () => {
      window.clearInterval(timerRef.current);
    };
  }, [curl]);

  const start = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      const p = payloads[indexRef.current];
      const bytes = hexMode ? new Uint8Array(p.split(/\s+/).map((b) => parseInt(b, 16))) : new TextEncoder().encode(p);
      wsRef.current.send(bytes);
      setLogs((l) => [
        { direction: 'send', text: p, size: bytes.length, time: Date.now() },
        ...l,
      ]);
      indexRef.current = (indexRef.current + 1) % payloads.length;
    }, delay);
  }, [payloads, delay, hexMode]);

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current);
  }, []);

  const addPayload = () => {
    setPayloads((p) => [...p, payload]);
    setPayload('');
  };
  const removePayload = (i: number) => {
    setPayloads((p) => p.filter((_, idx) => idx !== i));
  };

  const saveProfile = () => {
    localStorage.setItem(profileKey, JSON.stringify({ curl, payloads, delay }));
  };

  const clearLogs = () => setLogs([]);

  const exportLogFile = () => exportLogs(logs.map((l) => `${new Date(l.time).toISOString()} ${l.direction} ${l.text}`));

  const toggleMode = () => {
    setHexMode((m) => !m);
    setPayload((p) => (hexMode ? textToHex(p) : hexToText(p)));
  };

  return {
    curl,
    setCurl,
    url,
    origin,
    payload,
    setPayload,
    payloads,
    addPayload,
    removePayload,
    hexMode,
    toggleMode,
    delay,
    setDelay,
    logs,
    connect,
    start,
    stop,
    clearLogs,
    saveProfile,
    exportLogFile,
  };
};

export default useWebsocketSimulator;
