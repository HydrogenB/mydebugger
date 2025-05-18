import React from 'react';

interface UrlFormProps {
  url: string;
  userAgent: string;
  onUrlChange: (value: string) => void;
  onUserAgentChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/**
 * URL input form for the Link Tracer tool
 */
const UrlForm: React.FC<UrlFormProps> = ({
  url,
  userAgent,
  onUrlChange,
  onUserAgentChange,
  onSubmit,
  isLoading
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL to Trace
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
          required
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter the URL you want to trace redirect chains for
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          User Agent
        </label>
        <select
          value={userAgent}
          onChange={(e) => onUserAgentChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800"
        >
          <option value="desktop">Desktop Browser</option>
          <option value="mobile">Mobile Browser</option>
          <option value="googlebot">Google Bot</option>
          <option value="facebook">Facebook Bot</option>
          <option value="twitter">Twitter Bot</option>
        </select>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading || !url}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading || !url
              ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isLoading ? 'Tracing...' : 'Trace Link'}
        </button>
      </div>
    </form>
  );
};

export default UrlForm;
