import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  name?: string;
  id?: string;
  className?: string;
  menuClassName?: string;
  optionClassName?: string;
  error?: string;
  label?: string;
  helpText?: string;
  noOptionsMessage?: string;
  loading?: boolean;
}

/**
 * Advanced Select component with support for:
 * - Single and multi-select modes
 * - Searchable options
 * - Keyboard navigation
 * - Accessible design
 * - Custom styling
 * - Error states
 */
const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isMulti = false,
  isSearchable = false,
  isClearable = false,
  isDisabled = false,
  isRequired = false,
  name,
  id,
  className = '',
  menuClassName = '',
  optionClassName = '',
  error,
  label,
  helpText,
  noOptionsMessage = 'No options available',
  loading = false,
}) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Generate unique ID for accessibility
  const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;
  
  // Filter options based on search term
  const filteredOptions = options.filter((option) => {
    if (!isSearchable || !searchValue) return true;
    return option.label.toLowerCase().includes(searchValue.toLowerCase());
  });

  // Format display value
  const getDisplayValue = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return '';
    }

    if (isMulti && Array.isArray(value)) {
      if (value.length === 0) return '';
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option ? option.label : '';
      }
      return `${value.length} selected`;
    } else {
      const singleValue = Array.isArray(value) ? value[0] : value;
      const option = options.find(opt => opt.value === singleValue);
      return option ? option.label : '';
    }
  };

  // Check if option is selected
  const isOptionSelected = (option: SelectOption) => {
    if (isMulti && Array.isArray(value)) {
      return value.includes(option.value);
    } 
    return option.value === value;
  };

  // Toggle option selection
  const toggleOption = (option: SelectOption) => {
    if (option.disabled) return;
    
    if (isMulti) {
      if (Array.isArray(value)) {
        if (value.includes(option.value)) {
          onChange(value.filter(v => v !== option.value));
        } else {
          onChange([...value, option.value]);
        }
      } else {
        onChange([option.value]);
      }
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  // Clear selection
  const clearSelection = () => {
    onChange(isMulti ? [] : '');
    if (isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
        setSearchValue('');
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Reset highlight when options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const highlightedElement = menuRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
      
      case 'Enter':
        e.preventDefault();
        if (isOpen) {
          if (filteredOptions[highlightedIndex]) {
            toggleOption(filteredOptions[highlightedIndex]);
          }
        } else {
          setIsOpen(true);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchValue('');
        break;
      
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setSearchValue('');
        }
        break;
        
      case ' ': // Space
        if (!isSearchable) {
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (filteredOptions[highlightedIndex]) {
            toggleOption(filteredOptions[highlightedIndex]);
          }
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
        break;
    }
  };

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (isOpen && isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium mb-1 ${
            isDisabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        ref={containerRef}
        className={`
          relative w-full rounded-md cursor-default
          ${isDisabled ? 'opacity-50 pointer-events-none' : ''}
          ${error ? 'ring-1 ring-red-500' : ''}
        `}
        onKeyDown={handleKeyDown}
        tabIndex={isDisabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${selectId}-menu`}
        aria-labelledby={label ? `${selectId}-label` : undefined}
        aria-required={isRequired}
        aria-invalid={!!error}
        role="combobox"
        onClick={() => {
          if (!isDisabled) {
            setIsOpen(!isOpen);
          }
        }}
      >
        {/* Current selection display / search input */}
        <div
          className={`
            flex items-center w-full px-3 py-2 text-left
            border border-gray-300 dark:border-gray-700
            bg-white dark:bg-gray-800
            text-gray-800 dark:text-gray-200
            rounded-md shadow-sm
            focus:outline-none focus:ring-2 
            ${error 
              ? 'focus:ring-red-500 focus:border-red-500' 
              : 'focus:ring-blue-500 focus:border-blue-500'
            }
            ${isDisabled 
              ? 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-600' 
              : ''
            }
          `}
        >
          {isSearchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={getDisplayValue() || placeholder}
              id={selectId}
              name={name}
              autoComplete="off"
              disabled={isDisabled}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`block truncate ${!getDisplayValue() ? 'text-gray-400 dark:text-gray-500' : ''}`}>
              {getDisplayValue() || placeholder}
            </span>
          )}
          
          <div className="flex ml-auto pl-2 gap-1">
            {/* Clear button */}
            {isClearable && !!value && (value as string[] || []).length > 0 && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                aria-label="Clear selection"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Loading spinner */}
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              /* Dropdown arrow */
              <svg 
                className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Options dropdown */}
        {isOpen && (
          <div
            ref={menuRef}
            className={`
              absolute z-10 w-full mt-1 py-1
              bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-700
              rounded-md shadow-lg
              max-h-60 overflow-auto
              focus:outline-none
              ${menuClassName}
            `}
            id={`${selectId}-menu`}
            role="listbox"
            aria-multiselectable={isMulti}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer flex items-start
                    ${highlightedIndex === index ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                    ${isOptionSelected(option) ? 'bg-blue-100 dark:bg-blue-800/40' : ''}
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                    ${optionClassName}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                  aria-selected={isOptionSelected(option)}
                  aria-disabled={option.disabled}
                  data-index={index}
                >
                  {/* Multi-select checkbox */}
                  {isMulti && (
                    <div className="flex-shrink-0 mr-2 mt-0.5">
                      <div
                        className={`
                          w-4 h-4 border rounded
                          ${isOptionSelected(option)
                            ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600'
                            : 'border-gray-300 dark:border-gray-600'}
                        `}
                      >
                        {isOptionSelected(option) && (
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                {noOptionsMessage}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
      
      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
};

export default Select;