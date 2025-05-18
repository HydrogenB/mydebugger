import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DnsResult, DnsRecordType, DNS_RECORD_TYPES } from '../types';
import { formatDomain, performDnsLookup } from '../utils';

/**
 * Custom hook for DNS lookup functionality
 */
export const useDnsLookup = (initialDomain?: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get domain from URL query parameter if not provided directly
  const searchParams = new URLSearchParams(location.search);
  const domainFromUrl = searchParams.get('domain');
  
  // State variables
  const [domain, setDomain] = useState<string>(initialDomain || domainFromUrl || '');
  const [dnsResults, setDnsResults] = useState<DnsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<DnsRecordType>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  /**
   * Handles domain input change
   */
  const handleDomainChange = useCallback((value: string) => {
    setDomain(value);
  }, []);
  
  /**
   * Handles record type selection change
   */
  const handleRecordTypeChange = useCallback((type: DnsRecordType) => {
    setSelectedRecordType(type);
  }, []);
  
  /**
   * Shows a toast message
   */
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);
  
  /**
   * Performs DNS lookup
   */
  const handleLookup = useCallback(async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    setLoading(true);
    setError(null);
    setDnsResults(null);

    try {
      // Update URL with the current domain parameter
      const params = new URLSearchParams(location.search);
      params.set('domain', domain);
      navigate({ search: params.toString() }, { replace: true });
      
      const results = await performDnsLookup(domain, selectedRecordType);
      setDnsResults(results);
    } catch (error) {
      console.error('DNS lookup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to perform DNS lookup');
    } finally {
      setLoading(false);
    }
  }, [domain, selectedRecordType, location.search, navigate]);

  return {
    // State
    domain,
    dnsResults,
    loading,
    error,
    selectedRecordType,
    recordTypes: DNS_RECORD_TYPES,
    toastMessage,
    
    // Actions
    setDomain: handleDomainChange,
    setRecordType: handleRecordTypeChange,
    performLookup: handleLookup,
    showToast
  };
};
