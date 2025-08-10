/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useState } from 'react';
import {
  getConnectionInfo,
  getTechTier,
  isConnectionApiSupported,
    pingSamples,
    average,
    measureDownloadSpeed,
    measureUploadSpeed,
    calcJitter,
  ConnectionInfo,
} from '../lib/networkSuite';

export const useNetworkSuite = () => {
  const [connection, setConnection] = useState<ConnectionInfo>(getConnectionInfo());
  const [tech, setTech] = useState(getTechTier(connection));
  const [offline, setOffline] = useState(!navigator.onLine);
  const [connectionSupported] = useState(isConnectionApiSupported());

  const [pingUrl, setPingUrl] = useState('https://www.google.com/generate_204');
  const [pingResults, setPingResults] = useState<number[]>([]);
  const [pingRunning, setPingRunning] = useState(false);

  const [speedUrl, setSpeedUrl] = useState('https://speed.hetzner.de/10MB.bin');
  const [speedProgress, setSpeedProgress] = useState(0);
  const [speedMbps, setSpeedMbps] = useState<number | null>(null);
  const [speedRunning, setSpeedRunning] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('https://www.google.com/generate_204');
  const [uploadMbps, setUploadMbps] = useState<number | null>(null);
  const [uploadRunning, setUploadRunning] = useState(false);

  useEffect(() => {
    const update = () => {
      const info = getConnectionInfo();
      setConnection(info);
      setTech(getTechTier(info));
    };
    update();
    const nav = navigator as unknown as { connection?: { addEventListener?(t: string, l: EventListener): void; removeEventListener?(t: string, l: EventListener): void } };
    const conn = nav.connection;
    if (conn?.addEventListener) conn.addEventListener('change', update);
    const onOnline = () => setOffline(!navigator.onLine);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOnline);
    return () => {
      if (conn?.removeEventListener) conn.removeEventListener('change', update);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOnline);
    };
  }, []);

  const startPing = async () => {
    setPingRunning(true);
    try {
      const res = await pingSamples(pingUrl);
      setPingResults(res);
    } catch {
      setPingResults([]);
    }
    setPingRunning(false);
  };

  const startSpeed = async () => {
    setSpeedRunning(true);
    setSpeedProgress(0);
    try {
      const mbps = await measureDownloadSpeed(speedUrl, 10 * 1024 * 1024, (b) => {
        setSpeedProgress(Math.min(100, (b / (10 * 1024 * 1024)) * 100));
      });
      setSpeedMbps(mbps);
    } catch {
      setSpeedMbps(null);
    }
    setSpeedRunning(false);
  };

  const startUpload = async () => {
    setUploadRunning(true);
    try {
      const up = await measureUploadSpeed(uploadUrl, 5 * 1024 * 1024);
      setUploadMbps(up);
    } catch {
      setUploadMbps(null);
    }
    setUploadRunning(false);
  };

  const getReport = () => ({
    timestamp: new Date().toISOString(),
    connection,
    tech,
    offline,
    ping: {
      url: pingUrl,
      results: pingResults,
      averageMs: average(pingResults),
      jitterMs: calcJitter(pingResults),
    },
    download: { url: speedUrl, mbps: speedMbps },
    upload: { url: uploadUrl, mbps: uploadMbps },
  });

  const copyReport = async () => {
    const json = JSON.stringify(getReport(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      return true;
    } catch {
      return false;
    }
  };

  return {
    connection,
    tech,
    offline,
    connectionSupported,
    pingUrl,
    setPingUrl,
    pingResults,
    pingRunning,
    avgPing: average(pingResults),
    jitter: calcJitter(pingResults),
    startPing,
    speedUrl,
    setSpeedUrl,
    speedProgress,
    speedMbps,
    speedRunning,
    startSpeed,
    uploadUrl,
    setUploadUrl,
    uploadMbps,
    uploadRunning,
    startUpload,
    getReport,
    copyReport,
  };
};

export type UseNetworkSuiteReturn = ReturnType<typeof useNetworkSuite>;
export default useNetworkSuite;
