import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout, Card, TabGroup, Tab, TabPanel } from '@design-system';
import JwtDecoder from './JwtDecoder';
import { BuilderWizard } from './components/BuilderWizard';
import { InspectorPane } from './components/InspectorPane';
import { JwksProbe } from './components/JwksProbe';
import { BenchResult } from './components/BenchResult';
import { JwtProvider } from './context/JwtContext';

/**
 * JWT Toolkit Component
 * 
 * Comprehensive suite of JWT tools including decoder, inspector, builder, and more
 */
const JwtToolkit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('/');
  const jwtTool = getToolByRoute('/jwt');
  
  const tabItems = [
    { id: '/', label: 'Decoder', title: 'Decode & Verify JWT Tokens' },
    { id: '/inspect', label: 'Inspector', title: 'Deep Inspection & Security Analysis' },
    { id: '/build', label: 'Builder', title: 'Create & Sign JWT Tokens' },
    { id: '/jwks', label: 'JWKS', title: 'JWKS Tool & Public Key Discovery' },
    { id: '/benchmark', label: 'Performance', title: 'Algorithm Performance Benchmarks' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
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
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>
      
      <ToolLayout tool={jwtTool!}>
        <Card className="p-0 overflow-visible">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabGroup 
              activeTab={activeTab}
              onChange={handleTabChange}
            >
              {tabItems.map(tab => (
                <Tab 
                  key={tab.id}
                  id={tab.id}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabGroup>
          </div>
          
          <JwtProvider>
            <div className="p-5">
              <TabPanel id="/" active={activeTab === '/'}>
                <JwtDecoder />
              </TabPanel>
              
              <TabPanel id="/inspect" active={activeTab === '/inspect'}>
                <InspectorPane />
              </TabPanel>
              
              <TabPanel id="/build" active={activeTab === '/build'}>
                <BuilderWizard />
              </TabPanel>
              
              <TabPanel id="/jwks" active={activeTab === '/jwks'}>
                <JwksProbe />
              </TabPanel>
              
              <TabPanel id="/benchmark" active={activeTab === '/benchmark'}>
                <BenchResult />
              </TabPanel>
            </div>
          </JwtProvider>
        </Card>
      </ToolLayout>
    </>
  );
};

export default JwtToolkit;