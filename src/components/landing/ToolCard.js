import React, { useState } from 'react';
import { useRouter } from 'next/router';

const ToolCard = ({ tool, featured = false }) => {
  const router = useRouter();
  const { 
    title, 
    description, 
    icon: Icon, 
    route, 
    isNew, 
    isPopular, 
    isBeta, 
    category,
    metadata
  } = tool;
  
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const navigateToTool = () => {
    setIsClicked(true);
    setTimeout(() => {
      router.push(route);
    }, 150);
  };

  let badge = null;
  if (isNew) {
    badge = <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">NEW</span>;
  } else if (isPopular) {
    badge = <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">POPULAR</span>;
  } else if (isBeta) {
    badge = <span className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">BETA</span>;
  }

  return (
    <div 
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl 
        ${featured 
          ? 'shadow-xl border border-indigo-100 dark:border-indigo-900' 
          : 'shadow-md border border-gray-100 dark:border-gray-700'
        } 
        ${isHovered 
          ? 'shadow-xl scale-[1.02] border-indigo-200 dark:border-indigo-800' 
          : 'hover:shadow-xl hover:scale-[1.02] hover:border-indigo-200 dark:hover:border-indigo-800'
        }
        ${isClicked ? 'scale-[0.98]' : ''}
        transition-all duration-300 ease-in-out overflow-hidden 
        cursor-pointer flex flex-col h-full
      `}
      onClick={navigateToTool}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && navigateToTool()}
      aria-label={`Open ${title} tool`}
    >
      {/* Create a subtle gradient overlay for visual interest */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-transparent 
        ${featured ? 'via-indigo-50/30 to-blue-50/40 dark:via-indigo-900/10 dark:to-blue-900/20' : ''}
        transition-opacity duration-300 pointer-events-none
        ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      ></div>

      <div className="p-6 flex-grow">
        <div className="flex items-center mb-4">
          {Icon && (
            <div className={`
              p-3 rounded-xl mr-4
              ${featured 
                ? 'bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40' 
                : 'bg-indigo-50 dark:bg-indigo-900/30'
              }
              ${isHovered ? 'scale-110' : ''}
              transition-all duration-300
            `}>
              <Icon className={`
                w-8 h-8 
                ${featured 
                  ? 'text-indigo-600 dark:text-indigo-300' 
                  : 'text-indigo-500 dark:text-indigo-400'
                }
              `} />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
              {category}
              {metadata?.keywords && (
                <span className="ml-2 opacity-60 text-[10px] normal-case truncate max-w-[150px]">
                  • {metadata.keywords.slice(0, 3).join(", ")}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 min-h-[60px]">
          {description}
        </p>
        
        {/* Keywords tags - visible only on featured cards or when hovered */}
        {metadata?.keywords && (featured || isHovered) && (
          <div className="flex flex-wrap gap-1 mt-2 mb-1 transition-opacity duration-300">
            {metadata.keywords.slice(0, featured ? 5 : 3).map((keyword, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {badge}

      <div className={`
        p-4 mt-auto border-t 
        ${isHovered 
          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30' 
          : 'bg-gray-50 dark:bg-gray-800/80 border-gray-100 dark:border-gray-700/50'
        }
        transition-colors duration-300
      `}>
        <button
          className={`
            w-full rounded-md py-2 px-4 font-medium flex items-center justify-center
            ${isHovered 
              ? 'bg-indigo-600 text-white' 
              : 'text-indigo-600 dark:text-indigo-400'
            }
            transition-all duration-200 group
          `}
          aria-label={`Open ${title}`}
        >
          <span>Open Tool</span>
          <svg 
            className={`w-4 h-4 ml-1 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ToolCard;
