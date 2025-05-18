import React, { useState } from 'react';
import { RegexExample } from '../types';

interface ExamplesAndPatternsProps {
  commonPatterns: { name: string; pattern: string; description: string }[];
  examples: RegexExample[];
  onUsePattern: (pattern: string) => void;
  onLoadExample: (example: RegexExample) => void;
}

/**
 * Component for displaying and selecting regex examples and common patterns
 */
const ExamplesAndPatterns: React.FC<ExamplesAndPatternsProps> = ({
  commonPatterns,
  examples,
  onUsePattern,
  onLoadExample
}) => {
  const [activeTab, setActiveTab] = useState<'examples' | 'patterns'>('examples');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('examples')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'examples'
              ? 'bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Examples
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'patterns'
              ? 'bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Common Patterns
        </button>
      </div>
      
      <div className="p-4 bg-white dark:bg-gray-800">
        {activeTab === 'examples' ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Example Regex Patterns
            </h3>
            <div className="grid gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => onLoadExample(example)}
                  className="text-left p-2 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {example.name}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
                    /{example.pattern}/{example.flags}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Common Regex Patterns
            </h3>
            <div className="grid gap-2">
              {commonPatterns.map((pattern, index) => (
                <div 
                  key={index}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {pattern.name}
                    </h4>
                    <button
                      onClick={() => onUsePattern(pattern.pattern)}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Use
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {pattern.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                    {pattern.pattern}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamplesAndPatterns;
