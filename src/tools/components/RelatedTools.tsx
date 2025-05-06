import React from 'react';
import { Link } from 'react-router-dom';
import { getRelatedTools } from '../index';

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
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h2 className="text-xl font-semibold mb-4">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedTools.map((tool) => (
          <Link
            key={tool.id}
            to={tool.route}
            className="flex items-center bg-white p-4 rounded-md border border-gray-200 hover:shadow-md transition group"
          >
            <div className="flex-shrink-0 mr-3">
              <tool.icon className="h-6 w-6 text-blue-500 group-hover:text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-lg mb-1 group-hover:text-blue-600">{tool.title}</h3>
              <p className="text-gray-600 text-sm">{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedTools;