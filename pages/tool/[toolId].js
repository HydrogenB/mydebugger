import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import toolRegistry from '../../src/tools';
import { LoadingSpinner } from '../../src/design-system/components/feedback';
import NotFound from '../../src/components/NotFound';

export default function ToolPage() {
  const router = useRouter();
  const { toolId } = router.query;
  
  // Allow hydration to complete
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle loading state during SSR/hydration
  if (!isClient || !toolId) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Find the requested tool
  const tool = toolRegistry.find(t => t.route === `/${toolId}` || t.id === toolId);
  
  if (!tool) {
    return <NotFound />;
  }
  // Safely use tool component with error handling
  const [error, setError] = useState(false);

  // Use effect to catch any errors with tool loading
  useEffect(() => {
    if (tool && !tool.component) {
      console.error(`Tool ${toolId} found but has no component`);
      setError(true);
    }
  }, [tool, toolId]);

  if (error) {
    return <NotFound />;
  }

  // Get component if available
  const ToolComponent = tool?.component;
  
  return (
    <div>
      <Head>
        <title>{tool?.name || 'Tool'} - MyDebugger</title>
        <meta name="description" content={tool?.description || `MyDebugger Tool`} />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="container mx-auto py-6 px-4">
        {ToolComponent ? <ToolComponent /> : <LoadingSpinner size="lg" />}
      </main>
    </div>
  );
}
