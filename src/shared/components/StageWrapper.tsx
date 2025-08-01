/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Stage-Aware Component Wrapper
 */
import React, { ReactNode } from 'react';

import { StageLevel, useStageManager } from '../hooks/useStageManager';

interface StageWrapperProps {
  children: ReactNode;
  requiredStage?: StageLevel;
  requiredFeature?: string;
  fallback?: ReactNode;
  className?: string;
}

function StageWrapper({
  children,
  requiredStage,
  requiredFeature,
  fallback = null,
  className = ''
}: StageWrapperProps) {
  const { currentStage, availableStages, isFeatureEnabled } = useStageManager();

  // Check stage requirement
  if (requiredStage) {
    const currentIndex = availableStages.indexOf(currentStage);
    const requiredIndex = availableStages.indexOf(requiredStage);
    if (currentIndex < requiredIndex) {
      return <div className={className}>{fallback}</div>;
    }
  }

  // Check feature requirement
  if (requiredFeature && !isFeatureEnabled(requiredFeature)) {
    return <div className={className}>{fallback}</div>;
  }

  return <div className={className}>{children}</div>;
}

interface StageIndicatorProps {
  showProgress?: boolean;
  showDescription?: boolean;
  className?: string;
}

function StageIndicator({
  showProgress = true,
  showDescription = false,
  className = ''
}: StageIndicatorProps) {
  const { currentStage, stageProgress, getStageDescription, advance, availableStages, canAdvance } = useStageManager();

  const getButtonClassName = (stage: StageLevel) => {
    if (stage === currentStage) {
      return 'bg-blue-600 text-white';
    }
    if (canAdvance(stage)) {
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
    }
    return 'bg-gray-100 text-gray-400 cursor-not-allowed';
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Current Stage: <span className="capitalize text-blue-600 dark:text-blue-400">{currentStage}</span>
        </h3>
        <div className="flex gap-2">
          {availableStages.map(stage => (
            <button
              key={stage}
              type="button"
              onClick={() => advance(stage)}
              disabled={!canAdvance(stage)}
              className={`px-2 py-1 text-xs rounded ${getButtonClassName(stage)}`}
              title={getStageDescription(stage)}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>
      
      {showProgress ? (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Stage Progress</span>
            <span>{Math.round(stageProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>
      ) : null}
      
      {showDescription ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {getStageDescription(currentStage)}
        </p>
      ) : null}
    </div>
  );
}

export { StageWrapper, StageIndicator };
export default StageWrapper;
