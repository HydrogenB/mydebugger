import React, { ReactNode, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Tool } from '../../../tools/index';
import { ResponsiveContainer } from './ResponsiveContainer';
import { LoadingSpinner } from '../feedback';

// Import RelatedTools component dynamically
const RelatedTools = lazy(() => 
  import('../../../tools/RelatedTools')
    .then(module => ({ default: module.default }))
    .catch(() => ({ default: () => null }))
);

export interface ToolLayoutProps {
  /** Tool object containing metadata */
  tool: Tool;
  /** Content to be rendered inside the tool layout */
  children: ReactNode;
  /** Whether to show the tool header */
  showHeader?: boolean;
  /** Whether to show the tool description */
  showDescription?: boolean;
  /** Whether to show related tools */
  showRelatedTools?: boolean;
}

/**
 * Standard layout wrapper for all tools with consistent UI
 * 
 * @example
 * ```tsx
 * <ToolLayout tool={tool}>
 *   <div>Tool content goes here</div>
 * </ToolLayout>
 * ```
 */
export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  showHeader = true,
  showDescription = true,
  showRelatedTools = true
}) => {
  const { title, description, metadata, id } = tool;
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
      
      <ResponsiveContainer maxWidth="6xl" padding="md" className="transition-colors duration-200">
        {showHeader && (
          <div className="flex items-center mb-2">
            <div className="mr-3 p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <tool.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex items-center flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mr-2">{title}</h1>
              {tool.isBeta && (
                <span className="ml-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded">
                  BETA
                </span>
              )}
              {tool.isNew && (
                <span className="ml-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded">
                  NEW
                </span>
              )}
            </div>
          </div>
        )}
        
        {showDescription && (
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        )}
        
        <div className={`${tool.uiOptions?.fullWidth ? "w-full" : ""} animate-fade-in`}>
          {children}
        </div>
        
        {showRelatedTools && (
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <RelatedTools toolId={id} />
          </Suspense>
        )}
        
        {metadata.learnMoreUrl && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Learn More</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <a 
                href={metadata.learnMoreUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium inline-flex items-center"
              >
                Read more about {title}
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </ResponsiveContainer>
    </>
  );
};

export default ToolLayout;