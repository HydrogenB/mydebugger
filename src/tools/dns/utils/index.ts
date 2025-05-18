import { DnsResult, DnsRecordType } from '../types';

/**
 * API endpoint URL for DNS lookup
 */
export const API_URL = '/api/dns-lookup';

/**
 * Formats a domain by removing protocol, www, and path portions
 * @param domain Domain to format
 * @returns Formatted domain
 */
export const formatDomain = (domain: string): string => {
  // Remove protocol if present
  let formattedDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Remove path and query parameters if present
  formattedDomain = formattedDomain.split('/')[0];
  
  return formattedDomain;
};

/**
 * Performs a DNS lookup for the given domain and record type
 * @param domain Domain to look up
 * @param recordType DNS record type to look up
 * @returns DNS lookup results
 */
export const performDnsLookup = async (
  domain: string, 
  recordType: DnsRecordType = 'ALL'
): Promise<DnsResult> => {
  const formattedDomain = formatDomain(domain);
  
  try {
    const response = await fetch(`${API_URL}?domain=${encodeURIComponent(formattedDomain)}&type=${recordType}`);
    
    if (!response.ok) {
      throw new Error(`DNS lookup failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as DnsResult;
  } catch (error) {
    console.error('Error performing DNS lookup:', error);
    throw error;
  }
};

/**
 * Filters DNS records by type
 * @param dnsResults DNS lookup results
 * @param recordType Record type to filter by
 * @returns Filtered DNS records
 */
export const filterRecordsByType = (
  dnsResults: DnsResult | null, 
  recordType: DnsRecordType
): DnsResult | null => {
  if (!dnsResults) return null;
  if (recordType === 'ALL') return dnsResults;
  
  return {
    ...dnsResults,
    records: dnsResults.records.filter(record => record.type === recordType)
  };
};

/**
 * Exports DNS results as JSON
 * @param dnsResults DNS results to export
 */
export const exportAsJson = (dnsResults: DnsResult | null): void => {
  if (!dnsResults) return;
  
  const jsonString = JSON.stringify(dnsResults, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `dns-lookup-${dnsResults.domain}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copies DNS results to clipboard as text
 * @param dnsResults DNS results to copy
 * @returns Success status
 */
export const copyResultsToClipboard = async (dnsResults: DnsResult | null): Promise<boolean> => {
  if (!dnsResults) return false;
  
  try {
    const text = JSON.stringify(dnsResults, null, 2);
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
