import React from 'react';
import { RegexMatch, RegexMatchResult } from '../types';

interface MatchesDisplayProps {
  result: RegexMatchResult;
  highlightedHtml: string;
  showDebugInfo: boolean;
}

/**
 * Component to display regex matches and results
 */
const MatchesDisplay: React.FC<MatchesDisplayProps> = ({
  result,
  highlightedHtml,
  showDebugInfo
}) => {
  const { matches, executionTime, totalMatches } = result;
  
  if (totalMatches === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No matches found
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Matches ({totalMatches})
        </h3>
        {showDebugInfo && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Execution time: {executionTime.toFixed(2)}ms
          </p>
        )}
      </div>
      
      {/* Highlighted text */}
      <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-x-auto">
        <div 
          dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
          className="whitespace-pre-wrap break-all"
        />
      </div>
      
      {/* Matches table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Match
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Index
              </th>
              {showDebugInfo && (
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Groups
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {matches.map((match, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {idx + 1}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 font-mono break-all">
                  {match.match}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {match.index}
                </td>
                {showDebugInfo && (
                  <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {match.groups.length > 0 ? (
                      <div className="space-y-1">
                        {match.groups.map((group, groupIdx) => (
                          <div key={groupIdx} className="text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Group {groupIdx + 1}:</span> {group}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">No groups</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchesDisplay;
