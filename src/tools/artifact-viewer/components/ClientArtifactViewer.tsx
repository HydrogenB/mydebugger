import React, { useState, useCallback } from "react";
import {
  RefreshCw,
  Monitor,
  Smartphone,
  AlertCircle,
  Code2,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { useArtifactCompiler } from "../useArtifactCompiler";
import { useDebounce } from "../useDebounce";

interface Props {
  fileContent: string;
}

const ClientArtifactViewer: React.FC<Props> = ({
  fileContent: initialContent,
}) => {
  const [code, setCode] = useState(initialContent);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const [copied, setCopied] = useState(false);

  const debouncedCode = useDebounce(code, 300);
  const { compiledHtml, error, isLoading } = useArtifactCompiler(debouncedCode);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(initialContent);
  }, [initialContent]);

  return (
    <div className="flex flex-col h-[600px] lg:h-[700px] bg-gray-100 rounded-lg border border-gray-200 shadow-sm mx-auto max-w-7xl w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b rounded-t-lg shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Artifact Viewer</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            TSX/JSX
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === "code"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Code2 size={16} />
              <span className="hidden sm:inline">Code</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <div className="w-px h-6 bg-gray-200" />

          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-2 rounded ${
                device === "desktop" ? "bg-white shadow" : "text-gray-500"
              }`}
              title="Desktop View"
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-2 rounded ${
                device === "mobile" ? "bg-white shadow" : "text-gray-500"
              }`}
              title="Mobile View"
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex justify-center items-center p-4 bg-gray-100/50 rounded-b-lg">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-30 mx-auto max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-sm">
            <h3 className="font-bold flex items-center gap-2">
              <AlertCircle size={18} />
              Compilation Error
            </h3>
            <pre className="mt-2 text-xs overflow-auto max-h-32 whitespace-pre-wrap font-mono">
              {error}
            </pre>
          </div>
        )}

        {isLoading && activeTab === "preview" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-20 rounded-b-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin text-blue-600">
                <RefreshCw size={32} />
              </div>
              <span className="text-sm text-gray-500">Compiling...</span>
            </div>
          </div>
        )}

        {activeTab === "code" ? (
          <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
              <span className="text-sm text-gray-500">artifact.tsx</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Reset
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-white text-gray-800"
              spellCheck={false}
              placeholder="Enter your TSX/JSX code here..."
            />
          </div>
        ) : (
          <iframe
            srcDoc={compiledHtml || ""}
            className={`bg-white transition-all duration-300 shadow-2xl ${
              device === "mobile"
                ? "w-[375px] h-[667px] rounded-[3rem] border-8 border-gray-800"
                : "w-full h-full rounded-lg border border-gray-200"
            }`}
            sandbox="allow-scripts allow-modals allow-same-origin"
            title="Artifact Preview"
          />
        )}
      </div>
    </div>
  );
};

export default ClientArtifactViewer;
