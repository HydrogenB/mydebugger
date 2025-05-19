import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getTools, getAllCategories, getToolsByCategory, getPopularTools } from '../src/tools';

export default function HomePage() {
  const router = useRouter();
  const allTools = getTools();
  const categories = getAllCategories();
  const popularTools = getPopularTools();
  
  const navigateToTool = (route) => {
    router.push(route);
  };
  
  return (
    <div id="app-root">
      <Head>
        <title>MyDebugger</title>
        <meta name="description" content="Debugging and development toolkit" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="container mx-auto py-6 px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">MyDebugger Tools</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            A collection of essential tools for developers
          </p>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Popular Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularTools.slice(0, 6).map((tool) => (
              <div 
                key={tool.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => navigateToTool(tool.route)}
              >
                <h3 className="text-xl font-medium mb-2">{tool.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{tool.description}</p>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  onClick={() => navigateToTool(tool.route)}
                >
                  Open Tool
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
