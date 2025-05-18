# Tool Standardization

This document outlines the standardized structure for tools in the MyDebugger project.

## Folder Structure

Each tool should follow this structure:

```
src/tools/{tool-name}/
├── index.ts            # Main exports 
├── {ToolName}.tsx      # Main component
├── types.ts            # Type definitions
├── components/         # UI components
│   └── index.ts        # Component exports
├── hooks/              # Custom hooks
│   └── index.ts        # Hook exports
└── utils/              # Utility functions
    └── index.ts        # Utility exports
```

## File Responsibilities

### index.ts

The main entry point that exports the tool and its supporting modules:

```typescript
import ToolName from './ToolName';

// Export components
export { ToolName };

// Export types
export * from './types';

// Export hooks
export * from './hooks';

// Export utilities
export * from './utils';

// Default export for lazy loading
export default ToolName;
```

### {ToolName}.tsx

The main component that uses hooks for logic and smaller components for the UI:

```typescript
import React from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout } from '../../design-system/components/layout';
import { useToolHook } from './hooks';
import { ComponentA, ComponentB } from './components';

/**
 * Tool Description
 */
const ToolName: React.FC = () => {
  const tool = getToolByRoute('/tool-route');
  
  // Use our custom hook for all functionality
  const {
    // State
    stateA,
    stateB,
    // Actions
    actionA,
    actionB
  } = useToolHook();
  
  return (
    <ToolLayout tool={tool!}>
      {/* Components */}
    </ToolLayout>
  );
};

export default ToolName;
```

### types.ts

Contains type definitions used across the tool:

```typescript
/**
 * Tool Type Definitions
 */

export interface TypeA {
  // properties
}

export interface TypeB {
  // properties
}
```

### components/

Contains smaller reusable UI components specific to the tool. Each component should:
- Be focused on a specific UI concern
- Accept props for its data needs
- Delegate complex logic to hooks

### hooks/

Contains custom hooks that encapsulate the business logic:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { TypeA } from '../types';
import { utilityFunction } from '../utils';

/**
 * Custom hook description
 */
export const useToolHook = () => {
  // State
  const [stateA, setStateA] = useState<TypeA | null>(null);
  
  // Effects, callbacks, etc.
  
  return {
    // Expose state and actions
    stateA,
    actionA: useCallback(() => {
      // Action implementation
    }, [dependencies])
  };
};
```

### utils/

Contains pure functions and logic that doesn't depend on React:

```typescript
import { TypeA } from '../types';

/**
 * Utility function description
 */
export const utilityFunction = (param: string): TypeA => {
  // Implementation
};
```

## Benefits of This Structure

1. **Separation of Concerns**: UI, business logic, and utilities are separated
2. **Testability**: Easier to write tests for hooks and utilities
3. **Maintainability**: Smaller, focused files are easier to understand and modify
4. **Reusability**: Components and hooks can be reused in other parts of the application
5. **Consistency**: Following the same pattern makes the codebase more predictable
