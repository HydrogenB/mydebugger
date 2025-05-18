import React from 'react';
import { FlagOption } from '../types';

interface RegexPatternInputProps {
  pattern: string;
  flags: string;
  flagOptions: FlagOption[];
  error: string | null;
  onPatternChange: (pattern: string) => void;
  onToggleFlag: (flag: string) => void;
}

/**
 * Component for regex pattern input and flag selection
 */
const RegexPatternInput: React.FC<RegexPatternInputProps> = ({
  pattern,
  flags,
  flagOptions,
  error,
  onPatternChange,
  onToggleFlag
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="pattern" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Regular Expression
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 dark:text-gray-400">
            /
          </span>
          <input
            id="pattern"
            type="text"
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder="Enter regex pattern"
            className={`
              pl-6 pr-20 py-2 w-full border rounded-md shadow-sm focus:ring-2 focus:outline-none
              ${error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500'
              }
            `}
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">
            /{flags}
          </span>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
      
      <div>
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Flags
        </span>
        <div className="flex flex-wrap gap-2">
          {flagOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggleFlag(option.value)}
              className={`
                px-3 py-1 text-xs rounded-full transition-colors
                ${flags.includes(option.value) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
              title={option.description}
            >
              {option.label} ({option.value})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegexPatternInput;
