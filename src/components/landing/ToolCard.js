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

  const navigateToTool = (e) => {
    // Allow opening in new tab with Ctrl/Cmd + Click
    if (e.metaKey || e.ctrlKey) {
      window.open(route, '_blank');
      return;
    }
    setIsClicked(true);
    router.push(route);
  };

  let badgeText = null;
  let badgeClasses = "";

  if (featured) {
    badgeText = "FEATURED";
    badgeClasses = "bg-gradient-to-r from-purple-500 to-indigo-500 text-white";
  } else if (isNew) {
    badgeText = "NEW";
    badgeClasses = "bg-green-500 text-white";
  } else if (isPopular) {
    badgeText = "POPULAR";
    badgeClasses = "bg-blue-500 text-white";
  } else if (isBeta) {
    badgeText = "BETA";
    badgeClasses = "bg-yellow-500 text-black"; // Changed to black text for better contrast on yellow
  }

  const badgeElement = badgeText ? (
    <span 
      className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wider ${badgeClasses}`}
    >
      {badgeText}
    </span>
  ) : null;
  
  // Determine card border based on featured status
  const cardBorderClass = featured 
    ? 'border-2 border-indigo-400 dark:border-indigo-600 shadow-lg' 
    : 'border border-gray-200 dark:border-gray-700 shadow-md';

  return (
    <div 
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl 
        ${cardBorderClass}
        ${isHovered 
          ? 'shadow-xl scale-[1.03] transform-gpu' 
          : 'hover:shadow-lg'
        }
        ${isClicked ? 'scale-[0.97] opacity-90' : ''}
        transition-all duration-200 ease-out 
        flex flex-col h-full group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)} // Simplified touch handling
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Clickable area covering the whole card */}
      <a 
        href={route} 
        onClick={navigateToTool} 
        className="absolute inset-0 z-10" 
        aria-label={`Open ${title} tool`}
      ></a>

      <div className="p-5 flex-grow"> {/* Reduced padding slightly */}
        <div className="flex items-start mb-3"> {/* Align items start for better badge placement */}
          {Icon && (
            <div className={`
              p-2.5 rounded-lg mr-4 shrink-0
              ${featured 
                ? 'bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-800/50 dark:to-blue-800/50' 
                : 'bg-gray-100 dark:bg-gray-700/60'
              }
              group-hover:scale-105 transition-transform duration-200
            `}>
              <Icon className={`
                w-7 h-7 
                ${featured 
                  ? 'text-indigo-600 dark:text-indigo-300' 
                  : 'text-indigo-500 dark:text-indigo-400'
                }
              `} />
            </div>
          )}
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-0.5 line-clamp-2"> {/* Increased font weight, reduced margin */}
              {title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {category}
            </p>
          </div>
          {/* Badge is now part of the main flow, not absolutely positioned if not featured */}
          {!featured && badgeElement}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 min-h-[60px] leading-relaxed">
          {description}
        </p>
        
        {metadata?.keywords && (
          <div className="flex flex-wrap gap-1.5 mt-auto mb-1">
            {metadata.keywords.slice(0, 3).map((keyword, index) => (
              <span 
                key={index} 
                className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-700 transition-colors duration-150"
              >
                {keyword}
              </span>
            ))}
            {metadata.keywords.length > 3 && (
              <span className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-500">
                +{metadata.keywords.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Featured badge remains absolute */}
      {featured && badgeElement}

      <div className={`
        p-4 border-t 
        bg-gray-50 dark:bg-gray-800/70 
        border-gray-200 dark:border-gray-700/70
        group-hover:bg-indigo-50 dark:group-hover:bg-gray-700/90
        transition-colors duration-200
      `}>
        <button
          tabIndex={-1} // Button is not focusable, card is
          className={`
            w-full rounded-md py-2 px-3 font-medium text-sm flex items-center justify-center
            text-indigo-600 dark:text-indigo-300 
            group-hover:text-white group-hover:bg-indigo-600 dark:group-hover:text-white
            transition-all duration-200 transform-gpu
          `}
          aria-hidden="true" // Screen readers will use the main link
        >
          <span>Open Tool</span>
          <svg 
            className={`w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path> {/* Updated arrow icon */}
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ToolCard;
