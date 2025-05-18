import React from 'react';
import { Button } from '../../../design-system/components/inputs';

interface UrlFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/**
 * URL input form for headers analyzer
 */
const UrlForm: React.FC<UrlFormProps> = ({
  url,
  onUrlChange,
  onSubmit,
  isLoading
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-2">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Enter URL to analyze HTTP headers
        </label>
        <div className="flex">
          <input
            type="text"
            id="url"
            name="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com"
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !url}
            className="rounded-l-none"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter a website URL to retrieve and analyze its HTTP headers
        </p>
      </div>
    </form>
  );
};

export default UrlForm;
