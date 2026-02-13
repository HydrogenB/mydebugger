
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Monitor, Smartphone, Code, Terminal, AlertCircle } from 'lucide-react'; 
import { useArtifactCompiler } from '../useArtifactCompiler';
import { useDebounce } from '../useDebounce';

interface LogEntry {
  type: 'log' | 'error';
  payload: string[];
  timestamp: string;
}

interface Props {
  fileContent: string; // Made required as it's passed from Server Component
}

const ClientArtifactViewer: React.FC<Props> = ({ fileContent: initialFileContent }) => {
  const [code, setCode] = useState(initialFileContent);
  
  // 1. Debounce Input (prevent freezing)
  const debouncedCode = useDebounce(code, 600);
  
  const { compiledHtml, error } = useArtifactCompiler(debouncedCode);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showSource, setShowSource] = useState(false);
  
  // Console Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 2. Listen for Console Logs from Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CONSOLE_LOG') {
        setLogs(prev => [...prev, {
          type: event.data.level,
          payload: event.data.payload,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Clear logs on re-compile
  useEffect(() => {
    if (compiledHtml) {
        setLogs([]);
    }
  }, [compiledHtml]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-gray-100 -m-4 sm:-m-6 lg:-m-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm z-10 shrink-0">
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

        <div className="flex gap-2">
            <button 
                onClick={() => setShowConsole(!showConsole)}
                className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${showConsole ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Terminal size={16} /> Console
            </button>
            <button 
                onClick={() => setShowSource(!showSource)}
                className={`text-sm flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${showSource ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                <Code size={16} /> Source
            </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
        
        {/* Stage */}
        <div className="flex-1 relative flex justify-center items-center p-4 bg-gray-100/50 overflow-hidden">
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
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 z-20">
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

        {/* Source Editor Panel */}
        {showSource && (
            <div className="w-full md:w-[40%] h-[40vh] md:h-auto border-t md:border-t-0 md:border-l border-gray-200 bg-[#1e1e1e] flex flex-col transition-all duration-300">
                <div className="px-4 py-2 bg-[#252526] text-gray-300 text-xs flex justify-between items-center shrink-0">
                    <span>Source Code (Editable)</span>
                    <span className="text-gray-500">Auto-saves on stop typing</span>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 p-4 bg-[#1e1e1e] text-gray-300 font-mono text-sm resize-none focus:outline-none"
                    spellCheck={false}
                />
            </div>
        )}
      </div>

      {/* Console Drawer */}
      {showConsole && (
          <div className="h-48 border-t border-gray-200 bg-white flex flex-col shrink-0 transition-all duration-300">
              <div className="px-4 py-1 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Console Output</span>
                  <button 
                    onClick={() => setLogs([])}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                      Clear
                  </button>
              </div>
              <div className="flex-1 overflow-auto p-2 font-mono text-xs space-y-1">
                  {logs.length === 0 && (
                      <div className="text-gray-400 italic p-2">No logs yet...</div>
                  )}
                  {logs.map((log, i) => (
                      <div key={i} className={`flex gap-2 p-1 border-b border-gray-50 last:border-0 ${log.type === 'error' ? 'text-red-600 bg-red-50' : 'text-gray-700'}`}>
                          <span className="text-gray-400 select-none">[{log.timestamp}]</span>
                          <div className="flex-1 break-all">
                              {log.payload.join(' ')}
                          </div>
                      </div>
                  ))}
                  <div ref={logsEndRef} />
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientArtifactViewer;
