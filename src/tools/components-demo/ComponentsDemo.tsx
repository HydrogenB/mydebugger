import React from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import OtpInputDemo from './OtpInputDemo';

// Define proper interfaces for placeholder components
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  maxWidth?: string;
}

interface InfoBoxProps {
  title: string;
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  infoTooltip?: React.ReactNode;
}

// Temporarily import placeholder components until they are properly migrated
const Tooltip: React.FC<TooltipProps> = ({ children, content, position = "top", maxWidth = "" }) => (
  <div className="relative inline-block">
    {children}
    <div className={`absolute hidden group-hover:block z-50 ${maxWidth}`}>
      <div className="bg-gray-800 text-white text-sm rounded p-2 shadow-lg">
        {content}
      </div>
    </div>
  </div>
);

const InfoBox: React.FC<InfoBoxProps> = ({ title, children, variant = "info", infoTooltip }) => (
  <div className={`p-4 rounded-md ${variant === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 
    variant === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
    variant === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border`}>
    <div className="flex items-center mb-2">
      <h4 className={`font-medium ${variant === 'info' ? 'text-blue-800 dark:text-blue-300' : 
        variant === 'success' ? 'text-green-800 dark:text-green-300' : 
        variant === 'warning' ? 'text-yellow-800 dark:text-yellow-300' : 
        'text-red-800 dark:text-red-300'}`}>{title}</h4>
      {infoTooltip && (
        <Tooltip content={infoTooltip}>
          <span className="ml-1 cursor-help">ℹ️</span>
        </Tooltip>
      )}
    </div>
    <div className={`text-sm ${variant === 'info' ? 'text-blue-700 dark:text-blue-200' : 
      variant === 'success' ? 'text-green-700 dark:text-green-200' : 
      variant === 'warning' ? 'text-yellow-700 dark:text-yellow-200' : 
      'text-red-700 dark:text-red-200'}`}>{children}</div>
  </div>
);

/**
 * Demo component to showcase UI components and their usage
 */
const ComponentsDemo: React.FC = () => {
  const tool = getToolByRoute('/components-demo');
  
  return (
    <>
      <Helmet>
        <title>UI Components Demo | MyDebugger</title>
        <meta name="description" content="Showcase of reusable UI components in the MyDebugger toolkit" />
      </Helmet>
      <ToolLayout tool={tool!}>
        <div className="space-y-8">
          {/* OTP Input Demo */}
          <OtpInputDemo />
          
          {/* Tooltip Demo */}
          <Card title="Tooltip Component" isElevated>
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                Tooltips provide additional information on hover. They can be positioned in different directions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="flex flex-col items-center space-y-8">
                  <Tooltip content="This is a top tooltip">
                    <Button>Hover for Top Tooltip</Button>
                  </Tooltip>
                  
                  <Tooltip content="This is a right tooltip" position="right">
                    <Button variant="secondary">Hover for Right Tooltip</Button>
                  </Tooltip>
                </div>
                
                <div className="flex flex-col items-center space-y-8">
                  <Tooltip content="This is a bottom tooltip" position="bottom">
                    <Button variant="info">Hover for Bottom Tooltip</Button>
                  </Tooltip>
                  
                  <Tooltip content="This is a left tooltip" position="left">
                    <Button variant="warning">Hover for Left Tooltip</Button>
                  </Tooltip>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-2">Rich Content Tooltip</h3>
                <div className="flex justify-center">
                  <Tooltip 
                    content={
                      <div className="space-y-2">
                        <p className="font-semibold">Rich Tooltip Content</p>
                        <p>Tooltips can contain complex content:</p>
                        <ul className="list-disc list-inside text-xs">
                          <li>Multiple paragraphs</li>
                          <li>Formatting options</li>
                          <li>Even small images</li>
                        </ul>
                      </div>
                    }
                    position="bottom"
                    maxWidth="max-w-md"
                  >
                    <Button variant="ghost">Hover for Rich Content</Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Card>
          
          {/* InfoBox Demo */}
          <Card title="InfoBox Component" isElevated>
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                InfoBoxes provide contextual information with different visual styles based on their purpose.
              </p>
              
              <div className="space-y-4">
                <InfoBox title="Information Box" variant="info" infoTooltip={null}>
                  This is a standard information box that provides helpful context to users.
                </InfoBox>
                
                <InfoBox 
                  title="Success Message" 
                  variant="success" 
                  infoTooltip="This tooltip provides additional context about the success message"
                >
                  Operation completed successfully. All data was processed correctly.
                </InfoBox>
                
                <InfoBox title="Warning Notice" variant="warning" infoTooltip={null}>
                  <p>Please be aware of the following limitations:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Maximum file size: 10MB</li>
                    <li>Supported formats: PNG, JPG, SVG</li>
                  </ul>
                </InfoBox>
                
                <InfoBox 
                  title="Error Message" 
                  variant="error"
                  infoTooltip={
                    <div>
                      <p className="font-bold">Error Details</p>
                      <p>Status: 403 Forbidden</p>
                      <p>Check API credentials and try again</p>
                    </div>
                  }
                >
                  Unable to connect to the API service. Please check your credentials and network connection.
                </InfoBox>
              </div>
            </div>
          </Card>
          
          {/* Component Integration Demo */}
          <Card title="Component Integration Example" isElevated>
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                UI components can be easily combined to create rich interfaces.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  Settings Configuration
                  <Tooltip content="Configure your application settings" position="right">
                    <svg className="w-4 h-4 text-gray-400 ml-2 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Enable notifications</label>
                      <p className="text-sm text-gray-500">Receive alerts about important updates</p>
                    </div>
                    <div>
                      <button className="w-10 h-5 bg-blue-600 rounded-full flex items-center transition-colors focus:outline-none">
                        <span className="w-4 h-4 bg-white rounded-full transform translate-x-5 transition-transform"></span>
                      </button>
                    </div>
                  </div>
                  
                  <InfoBox 
                    title="Beta Feature" 
                    variant="warning"
                    infoTooltip="This feature is currently in beta and might change"
                  >
                    These settings are part of our new control panel which is still in beta testing.
                  </InfoBox>
                  
                  <div className="flex justify-end space-x-3">
                    <Tooltip content="Discard all changes">
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Cancel
                      </button>
                    </Tooltip>
                    
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ToolLayout>
    </>
  );
};

export default ComponentsDemo;