\
import React from 'react';
import { useRouter } from 'next/router';

const ToolCard = ({ tool }) => {
  const router = useRouter();
  const { title, description, icon: Icon, route, isNew, isPopular, isBeta, category } = tool;

  const navigateToTool = () => {
    router.push(route);
  };

  let badge = null;
  if (isNew) {
    badge = <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">NEW</span>;
  } else if (isPopular) {
    badge = <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">POPULAR</span>;
  } else if (isBeta) {
    badge = <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">BETA</span>;
  }

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out overflow-hidden cursor-pointer flex flex-col h-full"
      onClick={navigateToTool}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && navigateToTool()}
    >
      <div className="p-6 flex-grow">
        <div className="flex items-center mb-4">
          {Icon && (
            <div className="mr-4 p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{category}</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 min-h-[60px]">
          {description}
        </p>
      </div>
      {badge}
      <div className="p-6 bg-gray-50 dark:bg-gray-700 mt-auto">
        <button
          className="w-full text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors duration-200"
        >
          Open Tool &rarr;
        </button>
      </div>
    </div>
  );
};

export default ToolCard;
