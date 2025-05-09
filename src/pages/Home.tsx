import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@design-system'; // Assuming Card is exported from the main design system entry
import { getTools } from '../tools';

const Home: React.FC = () => {
  const tools = getTools();
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Developer Tools</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <Link 
            key={tool.id} 
            to={tool.route}
            className="block no-underline"
          >
            <Card isInteractive className="h-full hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-md">
                  <tool.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="ml-3 font-semibold text-xl">{tool.title}</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{tool.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;