import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../design-system/components/layout/Card';
import TabGroup from '../../design-system/components/navigation/TabGroup';
import ToolLayout from '../../design-system/components/layout/ToolLayout';
import JwtRoutes from './routes';

const JwtToolkit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split('/jwt')[1] || '/';

  const tabs = [
    { id: '/', label: 'Decoder', title: 'Decode & Verify JWT Tokens' },
    { id: '/inspect', label: 'Inspector', title: 'Deep Inspection & Security Analysis' },
    { id: '/build', label: 'Builder', title: 'Create & Sign JWT Tokens' },
    { id: '/jwks', label: 'JWKS', title: 'JWKS Tool & Public Key Discovery' },
    { id: '/benchmark', label: 'Performance', title: 'Algorithm Performance Benchmarks' },
  ];

  const handleTabChange = (tabId: string) => {
    navigate(`/jwt${tabId}`);
  };
  
  // SEO metadata
  const pageTitle = "JWT Toolkit | MyDebugger";
  const pageDescription = "Complete JWT toolkit for developers: decode, create, inspect, verify and benchmark JSON Web Tokens with our comprehensive suite of JWT tools.";
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/jwt" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <link rel="canonical" href="https://mydebugger.vercel.app/jwt" />
      </Helmet>
      
      <ToolLayout 
        title="JWT Toolkit"
        subtitle="Comprehensive tool suite for JSON Web Tokens"
        infoText="Decode, verify, create and analyze JWT tokens with our secure, browser-based toolkit."
      >
        <Card className="p-0 overflow-visible">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabGroup 
              tabs={tabs} 
              activeTab={path}
              onChange={handleTabChange}
            />
          </div>
          
          <div className="p-5">
            <JwtRoutes />
          </div>
        </Card>
      </ToolLayout>
    </>
  );
};

export default JwtToolkit;