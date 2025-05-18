import React, { useState, useEffect } from 'react';
import { TextArea } from '../../../design-system/components/inputs/TextArea';
import { Button } from '../../../design-system/components/inputs/Button';
import { Alert } from '../../../design-system/components/feedback/Alert';

interface TokenInputProps {
  value: string;
  onChange: (token: string) => void;
  onClear: () => void;
  error?: string | null;
  placeholder?: string;
  isReadOnly?: boolean;
}

/**
 * Component for JWT token input
 * Handles user input for JWT tokens with validation and error display
 */
export const TokenInput: React.FC<TokenInputProps> = ({
  value,
  onChange,
  onClear,
  error,
  placeholder = 'Paste your JWT token here...',
  isReadOnly = false,
}) => {
  const [localValue, setLocalValue] = useState<string>(value);
  
  // Sync local state with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Handle input change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Debounce the onChange callback
    const timeoutId = setTimeout(() => {
      onChange(newValue);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };
  
  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setLocalValue(clipboardText);
      onChange(clipboardText);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          JWT Token
        </label>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePaste}
            disabled={isReadOnly}
          >
            Paste
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClear}
            disabled={isReadOnly || !value}
          >
            Clear
          </Button>
        </div>
      </div>
      
      <TextArea
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        rows={5}
        readOnly={isReadOnly}
        className={`font-mono text-sm w-full ${error ? 'border-red-500' : ''}`}
      />
      
      {error && (
        <Alert variant="error" className="mt-2">
          {error}
        </Alert>
      )}
    </div>
  );
};
