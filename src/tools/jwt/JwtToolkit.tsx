import React, { lazy } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../../design-system/components/layout/Card';
import { TabGroup, Tab } from '../../design-system/components/navigation/TabGroup';
import ToolLayout from '../../design-system/components/layout/ToolLayout';
import JwtRoutes from './routes';
import { Tool, ToolCategory } from '../../tools';

// Create a mock tool object to provide to ToolLayout
const jwtTool: Tool = {
  id: 'jwt',
  title: 'JWT Toolkit',
  description: 'Comprehensive tool suite for JSON Web Tokens',
  route: '/jwt',
  icon: () => <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12 0L1.604 6v12L12 24l10.396-6V6L12 0zm-1 20.5v-17l9 5.2v6.6l-9 5.2z"/></svg>,
  component: lazy(() => Promise.resolve({ default: () => <></> })),
  category: 'Security' as ToolCategory,
  metadata: {
    keywords: ['jwt', 'token', 'authentication', 'json web token'],
  },
  uiOptions: {
    fullWidth: true
  }
};

const JwtToolkit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split('/jwt')[1] || '/';

  const tabItems = [
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
      
      <ToolLayout tool={jwtTool}>
        <Card className="p-0 overflow-visible">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabGroup 
              activeTab={path}
              onChange={handleTabChange}
            >
              {tabItems.map(tab => (
                <Tab 
                  key={tab.id}
                  id={tab.id}
                  isActive={path === tab.id}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabGroup>
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