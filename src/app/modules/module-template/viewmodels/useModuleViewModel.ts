/**
 * Module ViewModel template
 * 
 * This is a template for module-specific ViewModels.
 * ViewModels connect the Model with the View by transforming data and providing handlers.
 */

'use client';

import { useState, useEffect } from 'react';
import { ModuleData, processData, fetchModuleData } from '../models/moduleModel';

/**
 * Return type for the ViewModel hook
 */
interface ModuleViewModel {
  data: ModuleData | null;
  processedData: string;
  loading: boolean;
  error: string | null;
  refreshData: (id: string) => Promise<void>;
}

/**
 * Module ViewModel hook
 * 
 * This hook is responsible for:
 * 1. Managing UI state
 * 2. Calling model functions to process data
 * 3. Handling API calls through model functions
 * 4. Providing event handlers for components
 */
export function useModuleViewModel(initialId: string): ModuleViewModel {
  // State management
  const [data, setData] = useState<ModuleData | null>(null);
  const [processedData, setProcessedData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data effect
  useEffect(() => {
    refreshData(initialId);
  }, [initialId]);

  // Data processing effect
  useEffect(() => {
    if (data) {
      try {
        // Use the model function to process data
        const result = processData(data);
        setProcessedData(result);
      } catch (err) {
        setError(`Error processing data: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [data]);

  // Function to refresh data
  const refreshData = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the model function to fetch data
      const result = await fetchModuleData(id);
      setData(result);
    } catch (err) {
      setError(`Error fetching data: ${err instanceof Error ? err.message : String(err)}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Return everything the View needs
  return {
    data,
    processedData,
    loading,
    error,
    refreshData,
  };
}
