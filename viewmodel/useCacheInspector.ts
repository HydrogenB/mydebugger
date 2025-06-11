/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useMemo, useState } from 'react';
import {
  analyzeCacheFor,
  CacheResult,
  ResourceType,
  exportCacheResults,
} from '../model/cacheInspector';
import { formatExportFilename } from '../model/cookies';

export interface GroupedResults {
  type: ResourceType;
  items: CacheResult[];
}

export const useCacheInspector = () => {
  const [results, setResults] = useState<CacheResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const urls = Array.from(new Set(entries.map((e) => e.name)));
      const data = await analyzeCacheFor(urls);
      setResults(data);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<ResourceType, CacheResult[]> = {
      script: [],
      style: [],
      image: [],
      fetch: [],
    };
    results.forEach((r) => {
      g[r.resourceType].push(r);
    });
    return Object.entries(g)
      .filter(([, arr]) => arr.length > 0)
      .map(([type, items]) => ({ type: type as ResourceType, items }));
  }, [results]);

  const exportJson = () => {
    const blob = new Blob([exportCacheResults(results)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = formatExportFilename(window.location.hostname);
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return { grouped, loading, exportJson };
};

export default useCacheInspector;
