/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import { runDeviceTrace, DeviceTraceOptions } from '../model/deviceTrace';
import { DeviceTraceResult } from '../src/tools/linktracer/types';

export const useDeviceTrace = () => {
  const [url, setUrl] = useState('');
  const [iosAppId, setIosAppId] = useState('');
  const [androidPackage, setAndroidPackage] = useState('');
  const [deepLinkScheme, setDeepLinkScheme] = useState('');
  const [maxHops, setMaxHops] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeviceTraceResult | null>(null);
  const [error, setError] = useState('');

  const run = async () => {
    if (!url) return;
    setLoading(true);
    setError('');
    try {
      const opts: DeviceTraceOptions = {};
      if (iosAppId) opts.iosAppId = iosAppId;
      if (androidPackage) opts.androidPackage = androidPackage;
      if (deepLinkScheme) opts.deepLinkScheme = deepLinkScheme;
      const data = await runDeviceTrace(url, { ...opts, maxHops });
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: 'application/json',
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = 'device-trace.json';
    a.click();
    URL.revokeObjectURL(href);
  };

  return {
    url,
    setUrl,
    iosAppId,
    setIosAppId,
    androidPackage,
    setAndroidPackage,
    deepLinkScheme,
    setDeepLinkScheme,
    maxHops,
    setMaxHops,
    loading,
    result,
    error,
    run,
    copyJson,
    exportJson,
  };
};

export default useDeviceTrace;
