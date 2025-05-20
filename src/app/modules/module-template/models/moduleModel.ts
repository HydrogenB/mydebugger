/**
 * Module model template
 * 
 * This is a template for module-specific data models.
 * Models should contain pure business logic and data structures.
 * No React or Material UI imports should be here.
 */

/**
 * Sample data interface for the module
 */
export interface ModuleData {
  id: string;
  name: string;
  value: string;
  timestamp: Date;
}

/**
 * Sample function to process data
 * This is where your business logic should go
 */
export function processData(data: ModuleData): string {
  // Pure business logic with no side effects
  return `${data.name}: ${data.value} (Processed at ${data.timestamp.toISOString()})`;
}

/**
 * Sample API call function
 * Encapsulates data fetching logic
 */
export async function fetchModuleData(id: string): Promise<ModuleData> {
  // In a real module, this would call an actual API
  // This is just a placeholder
  return {
    id,
    name: 'Sample Data',
    value: 'Sample Value',
    timestamp: new Date(),
  };
}
