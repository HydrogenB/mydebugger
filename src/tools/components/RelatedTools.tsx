import React from 'react';
import { Link } from 'react-router-dom';
import { getRelatedTools } from '../index';
import { ResponsiveContainer } from './index';

interface RelatedToolsProps {
  toolId: string;
}

/**
 * Component to display related tools for a given tool
 */
const RelatedTools: React.FC<RelatedToolsProps> = ({ toolId }) => {
  const relatedTools = getRelatedTools(toolId);
  
  if (relatedTools.length === 0) return null;
  
  return (
    <ResponsiveContainer className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedTools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.route}
            className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200 group"
          >
            <div className="flex-shrink-0 mr-3 p-2 bg-primary-50 dark:bg-primary-900 rounded-lg">
              <tool.icon className="h-6 w-6 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1 text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{tool.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </ResponsiveContainer>
  );
};

export default RelatedTools;