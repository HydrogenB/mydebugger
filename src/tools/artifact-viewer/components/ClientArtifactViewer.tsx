
import React, { useState, useEffect } from 'react';
import { RefreshCw, Monitor, Smartphone, AlertCircle } from 'lucide-react'; 
import { useArtifactCompiler } from '../useArtifactCompiler';

interface Props {
  fileContent: string;
}

const ClientArtifactViewer: React.FC<Props> = ({ fileContent }) => {
  // Use passed content directly, no local state needed for editing
  const { compiledHtml, error } = useArtifactCompiler(fileContent);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="flex flex-col h-[600px] lg:h-[700px] bg-gray-100 rounded-lg border border-gray-200 shadow-sm mx-auto max-w-7xl w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b rounded-t-lg shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Preview Mode</span>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded ${device === 'desktop' ? 'bg-white shadow' : 'text-gray-500'}`}
            title="Desktop View"
          >
            <Monitor size={18} />
          </button>
          <button 
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded ${device === 'mobile' ? 'bg-white shadow' : 'text-gray-500'}`}
            title="Mobile View"
          >
            <Smartphone size={18} />
          </button>
        </div>
        
        {/* Placeholder for future buttons if needed, currently empty to align center */}
        <div className="w-10"></div> 
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden relative flex justify-center items-center p-4 bg-gray-100/50 rounded-b-lg">
        {/* Error Overlay */}
        {error && (
            <div className="absolute top-4 left-4 right-4 z-30 mx-auto max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold flex items-center gap-2">
                <AlertCircle size={18} />
                Compilation Error
            </h3>
            <pre className="mt-2 text-xs overflow-auto max-h-32 whitespace-pre-wrap font-mono">{error}</pre>
            </div>
        )}

        {/* Loading */}
        {!compiledHtml && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-20 rounded-b-lg">
            <div className="animate-spin text-blue-600">
                <RefreshCw size={32} />
            </div>
            </div>
        )}

        <iframe
        srcDoc={compiledHtml || ''}
        className={`bg-white transition-all duration-300 shadow-2xl ${
            device === 'mobile' 
            ? 'w-[375px] h-[667px] rounded-[3rem] border-8 border-gray-800' 
            : 'w-full h-full rounded-lg border border-gray-200'
        }`}
        sandbox="allow-scripts allow-modals allow-same-origin" 
        title="Artifact Preview"
        />
      </div>
    </div>
  );
};

export default ClientArtifactViewer;
