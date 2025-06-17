import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout, Card } from '../../design-system';
import { TabGroup, Tab, TabPanel } from '../../design-system/components/navigation';
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
  const [activeTab, setActiveTab] = useState<string>('decoder');
  const tool = getToolByRoute('/jwt');
  
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
      
      <ToolLayout tool={tool!}>
        <JwtProvider>
          <Card className="p-0 overflow-visible">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabGroup 
                activeTab={activeTab}
                onChange={setActiveTab}
              >
                <Tab id="decoder" label="Decoder" />
                <Tab id="inspector" label="Inspector" />
                <Tab id="builder" label="Builder" />
                <Tab id="jwks" label="JWKS" />
                <Tab id="benchmark" label="Performance" />
              </TabGroup>
            </div>
            
            <div className="p-5">
              <TabPanel id="decoder">
                <JwtDecoder />
              </TabPanel>
              
              <TabPanel id="inspector">
                <InspectorPane />
              </TabPanel>
              
              <TabPanel id="builder">
                <BuilderWizard />
              </TabPanel>
              
              <TabPanel id="jwks">
                <JwksProbe />
              </TabPanel>
              
              <TabPanel id="benchmark">
                <BenchResult />
              </TabPanel>
            </div>
          </Card>
        </JwtProvider>
      </ToolLayout>
    </>
  );
};

export default JwtToolkit;
