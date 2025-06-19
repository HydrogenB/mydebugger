/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Higher-order component factory for standardizing tool page patterns
 * Eliminates repetitive tool page structure and provides consistent architecture
 */

import React, { Suspense } from 'react';
import { getToolByRoute, Tool } from '../../tools';
import { ToolLayout } from '../../design-system/components/layout';
import { LoadingSpinner } from '../../design-system/components/feedback';

export interface ToolPageConfig {
  route: string;
  showHeader?: boolean;
  showDescription?: boolean;
  showRelatedTools?: boolean;
  title?: string;
  description?: string;
}

export interface ToolPageProps {
  tool: Tool;
  children: React.ReactNode;
}

/**
 * Higher-order component that wraps tool pages with standard layout and functionality
 * This eliminates the repetitive pattern seen across all tool pages
 */
export const withToolPage = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: ToolPageConfig
) => {
  const ToolPageWrapper: React.FC<P> = (props) => {
    const tool = getToolByRoute(config.route);
    
    if (!tool) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">Tool not found: {config.route}</div>
        </div>
      );
    }

    return (
      <ToolLayout
        tool={tool}
        showHeader={config.showHeader}
        showDescription={config.showDescription}
        showRelatedTools={config.showRelatedTools}
        title={config.title}
        description={config.description}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <WrappedComponent {...props} />
        </Suspense>
      </ToolLayout>
    );
  };

  ToolPageWrapper.displayName = `withToolPage(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return ToolPageWrapper;
};

/**
 * Simplified wrapper for basic tool pages that follow the standard pattern
 */
export const createToolPage = (
  ViewComponent: React.ComponentType<any>,
  useViewModelHook: () => any,
  config: ToolPageConfig
) => {
  const ToolPage: React.FC = () => {
    const viewModel = useViewModelHook();
    return <ViewComponent {...viewModel} />;
  };

  return withToolPage(ToolPage, config);
};

/**
 * Factory function for creating standard tool page components
 * Reduces boilerplate for simple view-model pattern tools
 */
export const toolPageFactory = {
  /**
   * Create a standard tool page with view-model pattern
   */
  standard: <TViewModel extends object>(
    ViewComponent: React.ComponentType<TViewModel>,
    useViewModel: () => TViewModel,
    route: string,
    options: Partial<ToolPageConfig> = {}
  ) => {
    const config: ToolPageConfig = {
      route,
      showHeader: true,
      showDescription: true,
      showRelatedTools: true,
      ...options
    };

    return createToolPage(ViewComponent, useViewModel, config);
  },

  /**
   * Create a minimal tool page without standard layout features
   */
  minimal: <TViewModel extends object>(
    ViewComponent: React.ComponentType<TViewModel>,
    useViewModel: () => TViewModel,
    route: string
  ) => {
    const config: ToolPageConfig = {
      route,
      showHeader: false,
      showDescription: false,
      showRelatedTools: false
    };

    return createToolPage(ViewComponent, useViewModel, config);
  },

  /**
   * Create a full-width tool page
   */
  fullWidth: <TViewModel extends object>(
    ViewComponent: React.ComponentType<TViewModel>,
    useViewModel: () => TViewModel,
    route: string,
    options: Partial<ToolPageConfig> = {}
  ) => {
    const config: ToolPageConfig = {
      route,
      showHeader: true,
      showDescription: false,
      showRelatedTools: true,
      ...options
    };

    return createToolPage(ViewComponent, useViewModel, config);
  }
};
