import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing an undo/redo stack
 * 
 * Features:
 * - Configurable max history size (100 steps by default)
 * - Keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z)
 * - Full history stack
 * - Performance optimized for large text content
 */
export function useUndoStack<T>(
  initialValue: T, 
  options: { 
    maxSize?: number;
    onChange?: (value: T) => void;
  } = {}
) {
  const { maxSize = 100, onChange } = options;
  
  // Current value
  const [value, setValue] = useState<T>(initialValue);
  
  // History stacks
  const [undoStack, setUndoStack] = useState<T[]>([initialValue]);
  const [redoStack, setRedoStack] = useState<T[]>([]);
  
  // Current position in stack
  const [position, setPosition] = useState<number>(0);
  
  // Update value and update stacks
  const update = useCallback((newValue: T) => {
    // Don't record if value hasn't changed
    if (JSON.stringify(newValue) === JSON.stringify(value)) {
      return;
    }
    
    setValue(newValue);
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(newValue);
    }
    
    // Update undo stack
    setUndoStack(prevStack => {
      const newStack = [...prevStack.slice(0, position + 1), newValue];
      // Limit stack size
      return newStack.length > maxSize 
        ? newStack.slice(newStack.length - maxSize) 
        : newStack;
    });
    
    // Clear redo stack since we've added a new state
    setRedoStack([]);
    
    // Update position
    setPosition(prev => {
      const newPosition = prev + 1;
      return newPosition >= maxSize ? maxSize - 1 : newPosition;
    });
  }, [value, position, maxSize, onChange]);
  
  // Undo function
  const undo = useCallback(() => {
    if (position > 0) {
      const newPosition = position - 1;
      const newValue = undoStack[newPosition];
      
      setValue(newValue);
      
      // Call onChange callback if provided
      if (onChange) {
        onChange(newValue);
      }
      
      setPosition(newPosition);
      setRedoStack(prev => [undoStack[position], ...prev]);
    }
  }, [position, undoStack, onChange]);
  
  // Redo function
  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const newValue = redoStack[0];
      
      setValue(newValue);
      
      // Call onChange callback if provided
      if (onChange) {
        onChange(newValue);
      }
      
      setPosition(position + 1);
      setUndoStack(prev => [...prev, newValue]);
      setRedoStack(prev => prev.slice(1));
    }
  }, [redoStack, position, onChange]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the active element is a contenteditable element or input/textarea
      const activeElement = document.activeElement;
      if (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
      
      // Undo: Ctrl/Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Redo: Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y
      if (((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);
  
  // Reset the stack with a new initial value
  const reset = useCallback((newInitialValue: T) => {
    setValue(newInitialValue);
    setUndoStack([newInitialValue]);
    setRedoStack([]);
    setPosition(0);
    
    // Call onChange callback if provided
    if (onChange) {
      onChange(newInitialValue);
    }
  }, [onChange]);
  
  // Check if we can undo/redo
  const canUndo = position > 0;
  const canRedo = redoStack.length > 0;
  
  return {
    value,
    update,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    history: {
      undoStack,
      redoStack,
      position
    }
  };
}