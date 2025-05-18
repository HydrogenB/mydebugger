import React, { useState } from 'react';
import { Card } from '../../../design-system/components/layout';
import { TabGroup, Tab, TabPanel } from '../../../design-system/components/navigation';
import { Badge } from '../../../design-system/components/display';
import { Tooltip } from '../../../design-system/components/overlays';
import { Button } from '../../../design-system/components/inputs/Button';
import { Text } from '../../../design-system/components/typography';
import { DecodedJwt } from '../types';

interface TokenDisplayProps {
  decoded: DecodedJwt | null;
  isVerified?: boolean | null;
}

/**
 * Component to display decoded JWT token information
 * Shows header and payload in different formats
 */
export const TokenDisplay: React.FC<TokenDisplayProps> = ({ decoded, isVerified }) => {
  const [activeTab, setActiveTab] = useState<'json' | 'table'>('json');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  if (!decoded) {
    return (
      <Card className="p-4 bg-gray-50 dark:bg-gray-800 text-center">
        <Text className="text-gray-500 dark:text-gray-400">
          No JWT token decoded yet. Enter a token above to see its contents.
        </Text>
      </Card>
    );
  }
  
  // Copy content to clipboard
  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };
  
  // Format date if timestamp
  const formatDate = (timestamp: number | undefined): string => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Get expiration status
  const getExpirationStatus = (): { status: 'valid' | 'expired' | 'notyet' | 'none'; message: string } => {
    if (!decoded.payload) return { status: 'none', message: 'No payload' };
    
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.payload.exp;
    const nbf = decoded.payload.nbf;
    
    if (exp && exp < now) {
      return {
        status: 'expired',
        message: `Expired on ${formatDate(exp)}`
      };
    }
    
    if (nbf && nbf > now) {
      return {
        status: 'notyet',
        message: `Valid from ${formatDate(nbf)}`
      };
    }
    
    if (exp) {
      return {
        status: 'valid',
        message: `Valid until ${formatDate(exp)}`
      };
    }
    
    return {
      status: 'none',
      message: 'No expiration'
    };
  };
  
  const expStatus = getExpirationStatus();
  
  return (
    <div className="mt-4 mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {isVerified !== null && (
          <Badge
            variant={isVerified ? 'success' : 'error'}
          >
            Signature: {isVerified ? 'Valid' : 'Invalid'}
          </Badge>
        )}
        
        {decoded.header?.alg && (
          <Badge variant="info">
            Algorithm: {decoded.header.alg}
          </Badge>
        )}
        
        <Badge
          variant={
            expStatus.status === 'valid'
              ? 'success'
              : expStatus.status === 'expired'
              ? 'error'
              : expStatus.status === 'notyet'
              ? 'warning'
              : 'default'
          }
        >
          {expStatus.message}
        </Badge>
      </div>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-md">
        <TabGroup 
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'json' | 'table')}
          className="border-b border-gray-200 dark:border-gray-700"
        >
          <Tab id="json">JSON</Tab>
          <Tab id="table">Table</Tab>
        </TabGroup>
        
        <div className="p-4">
          {/* JSON View */}
          <TabPanel id="json" active={activeTab === 'json'}>
            <div className="space-y-4">
              {/* Header Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-300">
                    Header
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')}
                  >
                    {copiedSection === 'header' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm overflow-auto max-h-40">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>
              
              {/* Payload Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-300">
                    Payload
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')}
                  >
                    {copiedSection === 'payload' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm overflow-auto max-h-80">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
              
              {/* Signature Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-300">
                    Signature
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => copyToClipboard(decoded.signature, 'signature')}
                  >
                    {copiedSection === 'signature' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm overflow-auto max-h-20 break-all">
                  {decoded.signature}
                </pre>
              </div>
            </div>
          </TabPanel>
          
          {/* Table View */}
          <TabPanel id="table" active={activeTab === 'table'}>
            <div className="space-y-6">
              {/* Header Table */}
              <div>
                <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-300 mb-2">
                  Header
                </Text>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Claim</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {decoded.header && Object.entries(decoded.header).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-mono">{key}</td>
                          <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 break-all">{JSON.stringify(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Payload Table */}
              <div>
                <Text size="sm" weight="medium" className="text-gray-700 dark:text-gray-300 mb-2">
                  Payload
                </Text>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Claim</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {decoded.payload && Object.entries(decoded.payload).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-mono">{key}</td>
                          <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 break-all">
                            {key === 'exp' || key === 'iat' || key === 'nbf' 
                              ? `${JSON.stringify(value)} (${formatDate(value as number)})`
                              : JSON.stringify(value)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {getClaimDescription(key)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

// Helper function to get description for standard JWT claims
function getClaimDescription(claim: string): string {
  const descriptions: Record<string, string> = {
    'iss': 'Issuer of the token',
    'sub': 'Subject of the token',
    'aud': 'Audience the token is intended for',
    'exp': 'Expiration time',
    'nbf': 'Not valid before',
    'iat': 'Issued at',
    'jti': 'JWT ID',
  };
  
  return descriptions[claim] || '';
}
