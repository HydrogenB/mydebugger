export interface StageManagerApi {
  isFeatureEnabled: (feature: string) => boolean;
}

export function useStageManager(): StageManagerApi {
  return {
    isFeatureEnabled: () => true,
  };
}



