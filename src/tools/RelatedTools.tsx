import React from 'react';
import Link from 'next/link';
import { getRelatedTools, Tool } from './index';
import { Card } from '../design-system/components/layout';

/**
 * Displays related tools based on a given tool id
 */
interface RelatedToolsProps {
  toolId: string;
  maxItems?: number;
}

const RelatedTools: React.FC<RelatedToolsProps> = ({ 
  toolId, 
  maxItems = 3 
}) => {
  const relatedTools = getRelatedTools(toolId);
  
  if (!relatedTools.length) {
    return null;
  }
  
  const displayedTools = relatedTools.slice(0, maxItems);
  
  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Related Tools</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayedTools.map((tool: Tool) => (          <Link 
            key={tool.id} 
            href={tool.route} 
            className="no-underline"
          >
            <Card
              isInteractive
              isElevated={false}
              className="h-full hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center mb-2">
                <div className="mr-3 p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <tool.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white text-lg">{tool.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {tool.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedTools;