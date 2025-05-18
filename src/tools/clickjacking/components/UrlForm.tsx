import React from 'react';

interface UrlFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/**
 * URL input form for clickjacking validator
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

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="mb-4">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Enter URL to check for clickjacking vulnerability
        </label>
        <div className="flex">
          <input
            type="text"
            id="url"
            name="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com"
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className={`px-4 py-2 text-white font-medium rounded-r-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading || !url
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Checking...' : 'Check'}
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter a URL to check if it's protected against clickjacking attacks
        </p>
      </div>
    </form>
  );
};

export default UrlForm;
