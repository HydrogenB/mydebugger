import React, { useState, useEffect } from 'react';

interface InputOutputProps {
  inputValue: string;
  outputValue: string;
  onInputChange: (value: string) => void;
  placeholder?: {
    input?: string;
    output?: string;
  };
  labels?: {
    input?: string;
    output?: string;
  };
  isMonospaced?: boolean;
  isReadOnly?: boolean;
  isVertical?: boolean;
  inputHeight?: string;
  outputHeight?: string;
  actions?: {
    onCopy?: () => void;
    onReset?: () => void;
    onProcess?: () => void;
    isCopied?: boolean;
    extraButtons?: React.ReactNode;
  };
}

/**
 * Standardized input/output component for tools that process text
 */
const InputOutput: React.FC<InputOutputProps> = ({
  inputValue,
  outputValue,
  onInputChange,
  placeholder = { input: 'Enter input...', output: 'Output will appear here...' },
  labels = { input: 'Input', output: 'Output' },
  isMonospaced = false,
  isReadOnly = false,
  isVertical = false,
  inputHeight = 'h-40',
  outputHeight = 'h-40',
  actions
}) => {
  const [copied, setCopied] = useState(actions?.isCopied || false);

  // Handle copying to clipboard
  const handleCopy = () => {
    if (!outputValue) return;
    
    if (actions?.onCopy) {
      actions.onCopy();
    } else {
      navigator.clipboard.writeText(outputValue);
      setCopied(true);
    }
  };
  
  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Use actions.isCopied if provided as a prop
  useEffect(() => {
    if (actions?.isCopied !== undefined) {
      setCopied(actions.isCopied);
    }
  }, [actions?.isCopied]);

  return (
    <div 
      className={`flex gap-6 ${isVertical ? 'flex-col' : 'flex-col md:flex-row'}`}
    >
      {/* Input Section */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="input-field" className="block font-medium text-gray-700">
            {labels.input}
          </label>
        </div>
        <textarea
          id="input-field"
          className={`
            w-full rounded-md border-gray-300 shadow-sm 
            focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 
            ${isMonospaced ? 'font-mono' : ''}
            ${inputHeight}
          `}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder.input}
          readOnly={isReadOnly}
          spellCheck="false"
        />
      </div>
      
      {/* Output Section */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="output-field" className="block font-medium text-gray-700">
            {labels.output}
          </label>
          <div className="flex space-x-2">
            {actions?.onCopy !== null && (
              <button
                onClick={handleCopy}
                disabled={!outputValue}
                className={`px-3 py-1 rounded-md text-sm transition ${
                  outputValue
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
            {actions?.onReset && (
              <button
                onClick={actions.onReset}
                className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
              >
                Reset
              </button>
            )}
            {actions?.onProcess && (
              <button
                onClick={actions.onProcess}
                className="px-3 py-1 rounded-md text-sm bg-green-500 hover:bg-green-600 text-white transition"
              >
                Process
              </button>
            )}
            {actions?.extraButtons}
          </div>
        </div>
        <textarea
          id="output-field"
          className={`
            w-full rounded-md border-gray-300 bg-gray-50 shadow-sm 
            ${isMonospaced ? 'font-mono' : ''}
            ${outputHeight}
          `}
          value={outputValue}
          readOnly
          placeholder={placeholder.output}
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default InputOutput;