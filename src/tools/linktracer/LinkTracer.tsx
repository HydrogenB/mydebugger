import React from 'react';
import { TOOL_PANEL_CLASS } from '../../design-system/foundations/layout';
// Remove helmet import
// import { Helmet } from 'react-helmet-async';

// Simplified LinkTracer component
const LinkTracer: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Link Tracer | MyDebugger';
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Link Tracer Tool</h1>
      <p className="mb-8">
        This tool traces link redirects step by step to help you understand the complete redirect chain.
      </p>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <p className="text-yellow-700">
          The link tracer functionality is currently disabled.
        </p>
      </div>
      
      {/* Simplified form */}
      <div className={TOOL_PANEL_CLASS}>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">URL to Trace</label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com"
              disabled
            />
          </div>
          
          <button
            type="button"
            disabled
            className="bg-blue-500 text-white px-4 py-2 rounded-md opacity-50 cursor-not-allowed"
          >
            Trace URL
          </button>
        </form>
      </div>
    </div>
  );
};

export default LinkTracer;