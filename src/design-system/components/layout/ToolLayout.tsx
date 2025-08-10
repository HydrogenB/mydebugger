import React, { ReactNode, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Tool } from '../../../tools/index';
import { ResponsiveContainer } from './ResponsiveContainer';
import { LoadingSpinner } from '../feedback';
import { TOOL_PANEL_CLASS } from '../../foundations/layout';
import { Tag } from '../display/Tag';
import { useTranslation } from '../../../context/TranslationContext';

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
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
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
  showRelatedTools = true,
  title: titleProp,
  description: descriptionProp
}) => {
  const { title: toolTitle, description: toolDescription, metadata, id } = tool;
  const { t } = useTranslation();
  
  // Use provided props if available, otherwise use values from tool
  const finalTitle = titleProp || t(`tools.${id}.title`, toolTitle);
  const finalDescription = descriptionProp || t(`tools.${id}.description`, toolDescription);
  
  const pageTitle = `${finalTitle} | MyDebugger`;
  const pageDescription = finalDescription;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://mydebugger.vercel.app${tool.route}`} />
        <meta property="og:site_name" content="MyDebugger" />
        <meta property="og:image" content="https://mydebugger.vercel.app/favicon.svg" />
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
                  <h1 className="text-3xl font-bold heading-gradient mr-2">{finalTitle}</h1>
              {tool.isBeta && (
                <Tag variant="warning" size="sm" className="ml-1">BETA</Tag>
              )}
            </div>
          </div>
        )}
        
        {showDescription && (
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-300">{finalDescription}</p>
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
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('toolLayout.learnMore', 'Learn More')}</h2>
            <div className={`border border-gray-200 dark:border-gray-700 ${TOOL_PANEL_CLASS.replace('p-6', 'p-4')}`}> 
              <a 
                href={metadata.learnMoreUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium inline-flex items-center"
              >
                {t('toolLayout.readMore', 'Read more about {title}').replace('{title}', finalTitle)}
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