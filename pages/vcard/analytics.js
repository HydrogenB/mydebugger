import React, { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { Card } from '../../src/design-system/components/layout';
import { LoadingSpinner } from '../../src/design-system/components/feedback';
import { Alert } from '../../src/design-system/components/feedback/Alert';

export default function VCardAnalyticsPage({ session }) {
  const [analytics, setAnalytics] = useState(null);
  const [vcard, setVcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('all'); // 'all', 'week', 'month'

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch vcard data
        const vcardRes = await fetch('/api/vcard');
        
        if (!vcardRes.ok) {
          if (vcardRes.status === 404) {
            setError("You don't have a VCard yet. Please create one first.");
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch VCard: ${vcardRes.status}`);
        }
        
        const vcardData = await vcardRes.json();
        setVcard(vcardData);
        
        // Fetch analytics data
        const analyticsRes = await fetch(`/api/vcard/analytics?username=${vcardData.username}`);
        
        if (!analyticsRes.ok) {
          throw new Error(`Failed to fetch analytics: ${analyticsRes.status}`);
        }
        
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert type="error">
          {error}
        </Alert>
        
        <div className="mt-8 text-center">
          <a href="/vcard/editor" className="text-blue-500 hover:text-blue-700 font-medium">
            Go to VCard Editor
          </a>
        </div>
      </div>
    );
  }

  // Process click data from the clickCount object
  const clickData = analytics?.clickCount || {};
  const totalClicks = Object.values(clickData).reduce((sum, count) => sum + Number(count), 0);
  
  // Group click data by type
  const socialClicks = Object.entries(clickData)
    .filter(([key]) => key.startsWith('social_'))
    .reduce((sum, [, count]) => sum + Number(count), 0);
    
  const customLinkClicks = Object.entries(clickData)
    .filter(([key]) => key.startsWith('custom_'))
    .reduce((sum, [, count]) => sum + Number(count), 0);
    
  const contactClicks = (Number(clickData.phone || 0) + 
    Number(clickData.email || 0) + 
    Number(clickData.website || 0) + 
    Number(clickData.whatsapp || 0));

  return (
    <>
      <Head>
        <title>VCard Analytics Dashboard</title>
        <meta name="description" content="View analytics and performance metrics for your digital business card." />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">VCard Analytics</h1>
          <div className="flex space-x-2">
            <a 
              href={`/${vcard?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
            >
              View My VCard
            </a>
            <a 
              href="/vcard/editor"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium"
            >
              Edit VCard
            </a>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-5">
            <div className="text-sm text-gray-500 mb-1">Total Views</div>
            <div className="text-3xl font-bold">{analytics?.viewCount || 0}</div>
          </Card>
          
          <Card className="p-5">
            <div className="text-sm text-gray-500 mb-1">Contacts Saved</div>
            <div className="text-3xl font-bold">{analytics?.totalContacts || 0}</div>
          </Card>
          
          <Card className="p-5">
            <div className="text-sm text-gray-500 mb-1">QR Code Scans</div>
            <div className="text-3xl font-bold">{analytics?.qrDownloads || 0}</div>
          </Card>
          
          <Card className="p-5">
            <div className="text-sm text-gray-500 mb-1">Total Link Clicks</div>
            <div className="text-3xl font-bold">{totalClicks || 0}</div>
          </Card>
        </div>
        
        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Click Distribution */}
          <Card className="p-5">
            <h2 className="text-xl font-bold mb-4">Click Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Contact Information</span>
                  <span className="text-sm">{contactClicks} clicks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${totalClicks ? (contactClicks / totalClicks * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Social Links</span>
                  <span className="text-sm">{socialClicks} clicks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${totalClicks ? (socialClicks / totalClicks * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Custom Links</span>
                  <span className="text-sm">{customLinkClicks} clicks</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${totalClicks ? (customLinkClicks / totalClicks * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Most Popular Links</h3>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500">Link</th>
                      <th className="text-right text-sm font-medium text-gray-500">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(clickData)
                      .sort(([, a], [, b]) => Number(b) - Number(a))
                      .slice(0, 5)
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-2 text-sm">{formatLinkName(key)}</td>
                          <td className="py-2 text-sm text-right">{value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
          
          {/* Engagement Stats */}
          <Card className="p-5">
            <h2 className="text-xl font-bold mb-4">Engagement Stats</h2>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Contact Save Rate</div>
              <div className="text-2xl font-bold">
                {analytics?.viewCount 
                  ? ((analytics.totalContacts / analytics.viewCount) * 100).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-xs text-gray-500">
                Percentage of viewers who saved your contact
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Click-Through Rate</div>
              <div className="text-2xl font-bold">
                {analytics?.viewCount 
                  ? ((totalClicks / analytics.viewCount) * 100).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-xs text-gray-500">
                Percentage of viewers who clicked on any link
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">QR Scan Conversion</div>
              <div className="text-2xl font-bold">
                {analytics?.qrDownloads && analytics?.viewCount 
                  ? ((analytics.qrDownloads / analytics.viewCount) * 100).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-xs text-gray-500">
                Percentage of QR code scans that led to views
              </div>
            </div>
          </Card>
        </div>
        
        {/* Support section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-indigo-800 mb-2">Support VCard Analytics</h2>
          <p className="text-indigo-600 mb-4">
            VCard analytics help you understand how people interact with your digital business card.
            If you find this feature valuable, please consider supporting development and server costs.
          </p>
          <a
            href="https://buymeacoffee.com/jiradbirdp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium"
          >
            ☕ Buy Me a Coffee
          </a>
        </div>
      </div>
    </>
  );
}

// Format link keys for display
function formatLinkName(key) {
  if (key === 'email') return 'Email';
  if (key === 'phone') return 'Phone';
  if (key === 'website') return 'Website';
  if (key === 'whatsapp') return 'WhatsApp';
  
  if (key.startsWith('social_')) {
    return `${key.replace('social_', '')} (Social)`;
  }
  
  if (key.startsWith('custom_')) {
    return `${key.replace('custom_', '')} (Custom)`;
  }
  
  if (key.startsWith('portfolio_')) {
    return `${key.replace('portfolio_', '')} (Portfolio)`;
  }
  
  if (key.startsWith('donate_')) {
    return 'Donation Link';
  }
  
  return key;
}

// Ensure users are logged in to access this page
export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }
  
  return {
    props: { session }
  };
}
