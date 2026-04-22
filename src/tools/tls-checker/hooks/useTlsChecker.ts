/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useState } from 'react';
import {
  TlsProbeResult,
  describeErrorCode,
  isValidDomain,
  normalizeDomain,
  runTlsCheck,
} from '../lib/tlsChecker';

export interface UseTlsCheckerState {
  domain: string;
  setDomain: (value: string) => void;
  results: TlsProbeResult[];
  scannedDomain: string;
  scannedAt: string;
  loading: boolean;
  error: string;
  check: () => Promise<void>;
  reset: () => void;
}

export const useTlsChecker = (): UseTlsCheckerState => {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<TlsProbeResult[]>([]);
  const [scannedDomain, setScannedDomain] = useState('');
  const [scannedAt, setScannedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setResults([]);
    setScannedDomain('');
    setScannedAt('');
    setError('');
  };

  const check = async () => {
    if (!isValidDomain(domain)) {
      setError(describeErrorCode('INVALID_DOMAIN'));
      setResults([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const target = normalizeDomain(domain);
      const response = await runTlsCheck(target);
      setResults(response.results);
      setScannedDomain(response.domain);
      setScannedAt(response.scannedAt);
    } catch (err) {
      const code = err instanceof Error ? err.message : 'SERVER_ERROR';
      setError(describeErrorCode(code));
      setResults([]);
      setScannedDomain('');
      setScannedAt('');
    } finally {
      setLoading(false);
    }
  };

  return {
    domain,
    setDomain,
    results,
    scannedDomain,
    scannedAt,
    loading,
    error,
    check,
    reset,
  };
};

export default useTlsChecker;
