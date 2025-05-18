/**
 * DNS Tool Type Definitions
 */

/**
 * Represents a single DNS record
 */
export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

/**
 * Complete DNS lookup result
 */
export interface DnsResult {
  domain: string;
  records: DnsRecord[];
}

/**
 * Props for the DnsLookup component
 */
export interface DnsLookupProps {
  initialDomain?: string;
}

/**
 * DNS record type options
 */
export const DNS_RECORD_TYPES = [
  'ALL', 'A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'
] as const;

export type DnsRecordType = typeof DNS_RECORD_TYPES[number];
