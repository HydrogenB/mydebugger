import { useState, useCallback } from 'react';
import { TraceResult, Hop, DeviceProfile } from '../types';
import { traceLink, getDeviceProfiles } from '../utils';

/**
 * Custom hook for link tracing functionality
 */
export const useLinkTracer = () => {
  const [url, setUrl] = useState<string>('');
  const [userAgent, setUserAgent] = useState<string>('desktop');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [deviceProfiles, setDeviceProfiles] = useState<DeviceProfile[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('desktop');

  /**
   * Load available device profiles
   */
  const loadDeviceProfiles = useCallback(async () => {
    try {
      const profiles = await getDeviceProfiles();
      setDeviceProfiles(profiles);
    } catch (err) {
      console.error('Failed to load device profiles:', err);
      setDeviceProfiles([
        { id: 'desktop', name: 'Desktop', type: 'Desktop', userAgent: 'Mozilla/5.0' },
        { id: 'mobile', name: 'Mobile', type: 'Mobile', userAgent: 'Mozilla/5.0 Mobile' },
        { id: 'googlebot', name: 'Google Bot', type: 'Bot', userAgent: 'Googlebot/2.1' }
      ]);
    }
  }, []);

  /**
   * Start tracing a link
   */
  const trace = useCallback(async () => {
    if (!url) {
      setError('Please enter a URL to trace');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Format URL if needed
      let urlToTrace = url;
      if (!urlToTrace.startsWith('http://') && !urlToTrace.startsWith('https://')) {
        urlToTrace = 'https://' + urlToTrace;
      }
      
      // Call the tracing utility function
      const result = await traceLink(urlToTrace, userAgent);
      setTraceResult(result);
    } catch (err) {
      console.error('Trace error:', err);
      setError(err instanceof Error ? err.message : 'Failed to trace link');
      setTraceResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [url, userAgent]);

  /**
   * Clear all results
   */
  const clearResults = useCallback(() => {
    setTraceResult(null);
    setError(null);
  }, []);

  return {
    // State
    url,
    userAgent,
    isLoading,
    error,
    traceResult,
    deviceProfiles,
    selectedDevice,
    
    // Actions
    setUrl,
    setUserAgent,
    trace,
    clearResults,
    loadDeviceProfiles,
    setSelectedDevice
  };
};
