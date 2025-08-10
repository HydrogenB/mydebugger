import React from 'react';

interface StageWrapperProps {
  children: React.ReactNode;
  requiredFeature?: string;
  className?: string;
}

export const StageWrapper: React.FC<StageWrapperProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

interface StageIndicatorProps {
  showProgress?: boolean;
  showDescription?: boolean;
  className?: string;
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({ showProgress, showDescription, className }) => {
  return (
    <div className={className}>
      {showProgress ? (
        <div aria-label="progress" style={{ height: 6 }} className="w-full bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
          <div className="h-full bg-blue-500 dark:bg-blue-400 animate-pulse" style={{ width: '66%' }} />
        </div>
      ) : null}
      {showDescription ? (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Feature preview enabled</div>
      ) : null}
    </div>
  );
};

export default StageWrapper;


