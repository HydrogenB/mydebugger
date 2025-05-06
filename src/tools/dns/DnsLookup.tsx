import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import ToolLayout from '../components/ToolLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

interface DnsResult {
  domain: string;
  records: DnsRecord[];
}

const DnsLookup: React.FC = () => {
  const tool = getToolByRoute('/dns-check');
  const [domain, setDomain] = useState<string>('');
  const [dnsResults, setDnsResults] = useState<DnsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecordType, setSelectedRecordType] = useState<string>('ALL');
  
  // DNS record types
  const recordTypes = ['ALL', 'A', 'AAAA', 'CNAME', 'MX', 'NS', 'PTR', 'SOA', 'SRV', 'TXT'];
  
  // API endpoint URL - replace with your actual deployed API URL
  const API_URL = '/api/dns-lookup';
  
  const handleLookup = async () => {
    if (!domain) {
      setError('Please enter a domain name');
      return;
    }

    setLoading(true);
    setError(null);
    setDnsResults(null);

    try {
      // Format domain (remove protocol if present)
      let formattedDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
      
      // Remove path and query parameters if present
      formattedDomain = formattedDomain.split('/')[0];
      
      // Call the real DNS API
      const response = await fetchDnsRecords(formattedDomain);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setDnsResults(response);
      
    } catch (err) {
      setError(`Error performing DNS lookup: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDnsRecords = async (domain: string): Promise<any> => {
    try {
      const url = new URL(API_URL, window.location.origin);
      url.searchParams.append('domain', domain);
      url.searchParams.append('recordType', selectedRecordType);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch DNS records');
      }
      
      return await response.json();
    } catch (error) {
      console.error('DNS Lookup Error:', error);
      throw error;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };
  
  // Function to handle record type change
  const handleRecordTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecordType(e.target.value);
    
    // If results already exist, refresh with new record type
    if (dnsResults) {
      handleLookup();
    }
  };

  // Filter records based on selected type
  const filteredRecords = dnsResults?.records.filter(
    record => selectedRecordType === 'ALL' || record.type === selectedRecordType
  ) || [];

  // SEO metadata
  const pageTitle = "DNS Lookup Tool | MyDebugger";
  const pageDescription = "Query DNS records for any domain name.";
  
  return (
    <ToolLayout tool={tool!}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/dns-check" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/dns-check" />
      </Helmet>
      
      <div className="space-y-6">
        <Card isElevated>
          <div className="space-y-4">
            <div>
              <label htmlFor="domain-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter domain name
              </label>
              <div className="flex">
                <input
                  id="domain-input"
                  type="text"
                  className="flex-grow rounded-l-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <Button
                  onClick={handleLookup}
                  isLoading={loading}
                  disabled={loading || !domain}
                  className="rounded-l-none"
                >
                  Lookup
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter a domain name to query its DNS records (e.g., example.com, google.com)
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            )}

            {dnsResults && !loading && (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                    DNS Records for <span className="text-primary-600 dark:text-primary-400">{dnsResults.domain}</span>
                  </h2>
                  <div>
                    <label htmlFor="record-type" className="sr-only">Record Type</label>
                    <select
                      id="record-type"
                      value={selectedRecordType}
                      onChange={handleRecordTypeChange}
                      className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50 text-sm"
                    >
                      {recordTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No {selectedRecordType} records found for {dnsResults.domain}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Value
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            TTL
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredRecords.map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                              <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {record.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {record.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono break-all">
                              {record.value}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {record.ttl > 0 ? `${record.ttl}s` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card title="DNS Record Types" isElevated>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">A (Address) Record</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Maps a domain name to an IPv4 address.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">AAAA Record</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Maps a domain name to an IPv6 address.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">CNAME Record</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Canonical name record that maps an alias to another domain name.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">MX Record</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mail exchange record that specifies mail servers for a domain.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">NS Record</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name server records that delegate a domain to DNS servers.</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">TXT Record</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Text records that store text data, often used for verification.</p>
            </div>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default DnsLookup;