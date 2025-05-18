import React, { useState } from 'react';
import { HeaderData, HeadersAnalysisResult } from '../types';
import { groupHeadersByCategory } from '../utils';

interface HeadersDisplayProps {
  result: HeadersAnalysisResult;
}

/**
 * Component to display analyzed headers grouped by category
 */
const HeadersDisplay: React.FC<HeadersDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'response' | 'request'>('response');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    security: true,  // Security headers expanded by default
    caching: false,
    content: false,
    cors: false,
    authentication: false,
    request: false,
    other: false
  });
  
  // Filter headers by search term
  const filteredHeaders = result.headers[activeTab]
    .filter(header => 
      searchTerm === '' || 
      header.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      header.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  // Group headers by category
  const groupedHeaders = groupHeadersByCategory(filteredHeaders);
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Copy header value to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // Display status information
  const renderStatus = () => {
    if (!result.statusCode) return null;
    
    const statusClass = 
      result.statusCode < 300 ? 'text-green-600 dark:text-green-400' :
      result.statusCode < 400 ? 'text-yellow-600 dark:text-yellow-400' :
      'text-red-600 dark:text-red-400';
    
    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</h3>
        <div className="flex items-center">
          <span className={`text-xl font-bold ${statusClass}`}>
            {result.statusCode}
          </span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {result.statusText}
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Headers Analysis
        </h2>
        <div className="flex items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">URL:</span>
          <a 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline break-all"
          >
            {result.url}
          </a>
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Analysis performed: {new Date(result.timestamp).toLocaleString()}
        </div>
      </div>
      
      {renderStatus()}
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('response')}
            className={`py-2 px-4 mr-2 text-sm font-medium ${
              activeTab === 'response'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Response Headers ({result.headers.response.length})
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === 'request'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Request Headers ({result.headers.request.length})
          </button>
        </nav>
      </div>
      
      {/* Search filter */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search headers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Headers content */}
      <div className="space-y-4">
        {Object.keys(groupedHeaders).length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No {activeTab} headers found{searchTerm ? ' matching your search' : ''}
          </div>
        ) : (
          Object.entries(groupedHeaders).map(([category, headers]) => (
            <div 
              key={category}
              className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                    {category} Headers
                  </span>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                    {headers.length}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    expandedCategories[category] ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedCategories[category] && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {headers.map((header, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">
                              {header.name}
                            </h4>
                            <button
                              onClick={() => copyToClipboard(header.value)}
                              className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              title="Copy value to clipboard"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-all">
                            {header.value}
                          </p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {header.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HeadersDisplay;
