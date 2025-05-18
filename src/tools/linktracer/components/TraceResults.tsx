import React from 'react';
import { Hop } from '../types';

interface TraceResultsProps {
  hops: Hop[];
  isLoading: boolean;
  totalTimeMs: number;
}

/**
 * Component to display redirect chain trace results
 */
const TraceResults: React.FC<TraceResultsProps> = ({
  hops,
  isLoading,
  totalTimeMs
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-600 dark:text-gray-300">Tracing link redirects...</span>
      </div>
    );
  }

  if (!hops || hops.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Trace Results
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Total time: {totalTimeMs}ms • {hops.length} hops
        </span>
      </div>

      <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  URL
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Latency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {hops.map((hop) => (
                <tr key={hop.n} className={hop.error ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {hop.n}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                    <div className="truncate">
                      <a 
                        href={hop.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {hop.url}
                      </a>
                    </div>
                    {hop.error && (
                      <div className="text-red-600 dark:text-red-400 text-xs mt-1">
                        Error: {hop.error}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${getStatusColorClass(hop.status)}`}>
                      {hop.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {hop.type || 'Direct'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {hop.latencyMs.toFixed(0)}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine status code color
const getStatusColorClass = (status: number): string => {
  if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  
  if (status >= 200 && status < 300) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  } else if (status >= 300 && status < 400) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  } else if (status >= 400 && status < 500) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  } else if (status >= 500) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export default TraceResults;
