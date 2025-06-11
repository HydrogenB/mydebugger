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
    let isMounted = true;
    (async () => {
      try {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const urls = Array.from(new Set(entries.map((e) => e.name)));
        const data = await analyzeCacheFor(urls);
        if (isMounted) {
          setResults(data);
        }
      } catch (error) {
        console.error('Error analyzing cache:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const groupedMap: Record<ResourceType, CacheResult[]> = {
      script: [],
      style: [],
      image: [],
      fetch: [],
    };
    results.forEach((r) => {
      groupedMap[r.resourceType].push(r);
    });
    return Object.entries(groupedMap)
      .filter(([, arr]) => arr.length > 0)
      .map(([type, items]) => ({ type: type as ResourceType, items }));
  }, [results]);

  const exportJson = useCallback(() => {
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
