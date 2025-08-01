/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Stage Management Hook for Progressive Enhancement
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

export type StageLevel = 'basic' | 'enhanced' | 'advanced' | 'expert';

export interface StageConfiguration {
  level: StageLevel;
  features: string[];
  requirements: string[];
  description: string;
}

export interface StageState {
  currentStage: StageLevel;
  availableStages: StageLevel[];
  stageConfigs: Record<StageLevel, StageConfiguration>;
  canAdvance: (to: StageLevel) => boolean;
  advance: (to: StageLevel) => void;
  isFeatureEnabled: (feature: string) => boolean;
  getStageDescription: (stage: StageLevel) => string;
  getEnabledFeatures: () => string[];
  stageProgress: number;
}

const DEFAULT_STAGE_CONFIGS: Record<StageLevel, StageConfiguration> = {
  basic: {
    level: 'basic',
    features: ['core-functionality', 'basic-ui', 'error-handling'],
    requirements: [],
    description: 'Essential functionality with basic user interface'
  },
  enhanced: {
    level: 'enhanced',
    features: ['core-functionality', 'basic-ui', 'error-handling', 'enhanced-ui', 'data-persistence', 'export-functionality'],
    requirements: ['basic'],
    description: 'Improved UI with data persistence and export capabilities'
  },
  advanced: {
    level: 'advanced',
    features: ['core-functionality', 'basic-ui', 'error-handling', 'enhanced-ui', 'data-persistence', 'export-functionality', 'real-time-features', 'interactive-previews', 'advanced-settings'],
    requirements: ['basic', 'enhanced'],
    description: 'Real-time features with interactive previews and advanced settings'
  },
  expert: {
    level: 'expert',
    features: ['core-functionality', 'basic-ui', 'error-handling', 'enhanced-ui', 'data-persistence', 'export-functionality', 'real-time-features', 'interactive-previews', 'advanced-settings', 'edge-case-handling', 'performance-optimization', 'accessibility-features'],
    requirements: ['basic', 'enhanced', 'advanced'],
    description: 'Complete feature set with edge case handling and performance optimization'
  }
};

export const useStageManager = (
  initialStage: StageLevel = 'basic',
  customConfigs?: Partial<Record<StageLevel, StageConfiguration>>
): StageState => {
  const [currentStage, setCurrentStage] = useState<StageLevel>(initialStage);
  
  const stageConfigs = useMemo(() => ({
    ...DEFAULT_STAGE_CONFIGS,
    ...customConfigs
  }), [customConfigs]);

  const availableStages = useMemo<StageLevel[]>(() => ['basic', 'enhanced', 'advanced', 'expert'], []);

  useEffect(() => {
    // Load saved stage preference
    const saved = localStorage.getItem('mydebugger-stage-preference');
    if (saved && availableStages.includes(saved as StageLevel)) {
      setCurrentStage(saved as StageLevel);
    }
  }, [availableStages]);

  useEffect(() => {
    // Save stage preference
    localStorage.setItem('mydebugger-stage-preference', currentStage);
  }, [currentStage]);

  const canAdvance = useCallback((to: StageLevel): boolean => {
    const targetConfig = stageConfigs[to];
    if (!targetConfig) return false;
    
    // Check if all requirements are met
    return targetConfig.requirements.every(req => 
      availableStages.indexOf(req as StageLevel) <= availableStages.indexOf(currentStage)
    );
  }, [currentStage, stageConfigs, availableStages]);

  const advance = useCallback((to: StageLevel) => {
    if (canAdvance(to)) {
      setCurrentStage(to);
    }
  }, [canAdvance]);

  const isFeatureEnabled = useCallback((feature: string): boolean => 
    stageConfigs[currentStage]?.features.includes(feature) ?? false
  , [currentStage, stageConfigs]);

  const getStageDescription = useCallback((stage: StageLevel): string => 
    stageConfigs[stage]?.description ?? ''
  , [stageConfigs]);

  const getEnabledFeatures = useCallback((): string[] => 
    stageConfigs[currentStage]?.features ?? []
  , [currentStage, stageConfigs]);

  const stageProgress = useMemo(() => {
    const currentIndex = availableStages.indexOf(currentStage);
    return ((currentIndex + 1) / availableStages.length) * 100;
  }, [currentStage, availableStages]);

  return {
    currentStage,
    availableStages,
    stageConfigs,
    canAdvance,
    advance,
    isFeatureEnabled,
    getStageDescription,
    getEnabledFeatures,
    stageProgress
  };
};

export default useStageManager;
