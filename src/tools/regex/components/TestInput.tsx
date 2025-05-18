import React from 'react';

interface TestInputProps {
  input: string;
  onInputChange: (input: string) => void;
}

/**
 * Component for the test input field
 */
const TestInput: React.FC<TestInputProps> = ({
  input,
  onInputChange
}) => {
  return (
    <div>
      <label htmlFor="test-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Test String
      </label>
      <textarea
        id="test-input"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="Enter text to test the regex pattern against"
        rows={5}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default TestInput;
