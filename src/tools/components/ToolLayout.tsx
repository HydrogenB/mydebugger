import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { Tool } from '../index';
import RelatedTools from './RelatedTools';

interface ToolLayoutProps {
  tool: Tool;
  children: ReactNode;
  showHeader?: boolean;
  showDescription?: boolean;
  showRelatedTools?: boolean;
}

/**
 * Standard layout wrapper for all tools with consistent UI
 */
const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  showHeader = true,
  showDescription = true,
  showRelatedTools = true
}) => {
  const { title, description, category, metadata, id } = tool;
  const pageTitle = `${title} | MyDebugger`;
  const pageDescription = description;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mydebugger.vercel.app${tool.route}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="keywords" content={metadata.keywords.join(', ')} />
        <link rel="canonical" href={`https://mydebugger.vercel.app${tool.route}`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {showHeader && (
          <div className="flex items-center mb-2">
            <div className="mr-3">
              <tool.icon className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {tool.isBeta && (
              <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                BETA
              </span>
            )}
            {tool.isNew && (
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                NEW
              </span>
            )}
          </div>
        )}
        
        {showDescription && (
          <div className="mb-8">
            <p className="text-gray-600">{description}</p>
          </div>
        )}
        
        <div className={tool.uiOptions?.fullWidth ? "w-full" : ""}>
          {children}
        </div>
        
        {showRelatedTools && <RelatedTools toolId={id} />}
        
        {metadata.learnMoreUrl && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Learn More</h2>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <a 
                href={metadata.learnMoreUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center"
              >
                Read more about {title}
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ToolLayout;