import { useEffect, useCallback } from 'react';

export interface ShortcutDefinition {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
  action: () => void;
  description?: string;
}

/**
 * Custom hook for managing keyboard shortcuts
 * 
 * Centralizes keyboard shortcut handling to avoid conflicts
 * and provides consistent behavior across components.
 * 
 * @param shortcuts Array of shortcut definitions
 * @param active Whether shortcuts should be active or not
 */
export function useShortcut(
  shortcuts: ShortcutDefinition[], 
  active = true
) {
  // Handler for keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if shortcuts are inactive
    if (!active) return;
    
    // Check if the active element is an input, textarea, or contentEditable
    const activeElement = document.activeElement;
    const isEditable = 
      activeElement?.tagName === 'INPUT' || 
      activeElement?.tagName === 'TEXTAREA' || 
      activeElement?.getAttribute('contenteditable') === 'true';
    
    // Only process certain shortcuts when in editable fields
    for (const shortcut of shortcuts) {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrlKey === e.ctrlKey;
      const altMatch = !!shortcut.altKey === e.altKey;
      const shiftMatch = !!shortcut.shiftKey === e.shiftKey;
      const metaMatch = !!shortcut.metaKey === e.metaKey;
      
      if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
        // If in an editable field, only allow valid editor shortcuts
        if (isEditable && !isEditorShortcut(shortcut)) {
          return;
        }
        
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        
        shortcut.action();
        return;
      }
    }
  }, [shortcuts, active]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Return a list of active shortcuts for UI display
  const getShortcutList = useCallback(() => {
    return shortcuts.map(shortcut => {
      const modifiers = [
        shortcut.ctrlKey ? (navigator.platform.startsWith('Mac') ? '⌘' : 'Ctrl') : '',
        shortcut.altKey ? (navigator.platform.startsWith('Mac') ? 'Option' : 'Alt') : '',
        shortcut.shiftKey ? 'Shift' : '',
        shortcut.metaKey && !navigator.platform.startsWith('Mac') ? 'Meta' : ''
      ].filter(Boolean).join('+');
      
      const keyDisplay = shortcut.key.length === 1 ? 
        shortcut.key.toUpperCase() : 
        shortcut.key;
      
      const shortcutText = modifiers ? `${modifiers}+${keyDisplay}` : keyDisplay;
      
      return {
        shortcut: shortcutText,
        description: shortcut.description || '',
      };
    });
  }, [shortcuts]);
  
  return {
    shortcuts: getShortcutList()
  };
}

/**
 * Helper function to determine if a shortcut is valid in an editor context
 */
function isEditorShortcut(shortcut: ShortcutDefinition): boolean {
  // Common editor shortcuts like Ctrl+C, Ctrl+V, etc.
  if (shortcut.ctrlKey && !shortcut.altKey && !shortcut.metaKey) {
    const editorKeys = ['c', 'v', 'x', 'a', 'z', 'y'];
    if (editorKeys.includes(shortcut.key.toLowerCase())) {
      return true;
    }
  }
  
  // Function keys are usually okay
  if (shortcut.key.startsWith('F') && shortcut.key.length > 1) {
    return true;
  }
  
  // Special case for presentation mode
  if ((shortcut.ctrlKey || shortcut.metaKey) && shortcut.key === 'm') {
    return true;
  }
  
  // Special case for save
  if ((shortcut.ctrlKey || shortcut.metaKey) && shortcut.key === 's') {
    return true;
  }
  
  return false;
}