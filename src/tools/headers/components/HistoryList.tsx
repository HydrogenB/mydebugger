import React from 'react';
import { HeadersAnalysisResult } from '../types';

interface HistoryListProps {
  history: HeadersAnalysisResult[];
  onSelect: (item: HeadersAnalysisResult) => void;
  onClear: () => void;
}

/**
 * Component to display history of header analyses
 */
const HistoryList: React.FC<HistoryListProps> = ({ 
  history, 
  onSelect, 
  onClear 
}) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          No history yet. Analyze a website to see its headers here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
          Recent Analyses
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
        >
          Clear History
        </button>
      </div>
      
      <div className="space-y-2">
        {history.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            onClick={() => onSelect(item)}
            className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <div className="flex justify-between items-center">
              <div className="overflow-hidden">
                <div className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                  {item.url}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
                {item.statusCode && (
                  <div className="text-xs mt-1">
                    <span className={
                      item.statusCode < 300 ? 'text-green-600 dark:text-green-400' :
                      item.statusCode < 400 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }>
                      {item.statusCode} {item.statusText}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex space-x-1 text-xs">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {item.headers.response.length} headers
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
