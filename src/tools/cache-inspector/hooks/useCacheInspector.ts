/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  analyzeCacheFor,
  CacheResult,
  ResourceType,
  exportCacheResults,
  exportCacheResultsCsv,
} from '../lib/cacheInspector';
import { formatExportFilename } from '../lib/cookies';

export interface GroupedResults {
  type: ResourceType;
  items: CacheResult[];
}

export interface CacheSummary {
  counts: Record<ResourceType, number>;
  statusCounts: Record<string, number>;
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
        // eslint-disable-next-line no-console -- surface analysis failure for debugging
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

  const summary = useMemo(() => {
    const counts: Record<ResourceType, number> = {
      script: 0,
      style: 0,
      image: 0,
      fetch: 0,
    };
    const statusCounts: Record<string, number> = {};
    results.forEach((r) => {
      counts[r.resourceType] += 1;
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    return { counts, statusCounts };
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
  }, [results]);

  const exportCsv = useCallback(() => {
    const blob = new Blob([exportCacheResultsCsv(results)], {
      type: 'text/csv',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${formatExportFilename(window.location.hostname)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [results]);

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }, []);

  return { grouped, loading, summary, exportJson, exportCsv, copyShareLink };
};

export default useCacheInspector;
