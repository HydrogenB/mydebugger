import React, { useState } from 'react';
import { useLiveUpdate } from '../hooks/useLiveUpdate';

interface SequenceDiagramEditorProps {
  initialCode?: string;
}

const SequenceDiagramEditor: React.FC<SequenceDiagramEditorProps> = ({ 
  initialCode = 'sequenceDiagram\n  participant Alice\n  participant Bob\n  Alice->>Bob: Hello Bob, how are you?\n  Bob-->>Alice: I am good thanks!'
}) => {
  const { code, setCode, result, error, isCompiling } = useLiveUpdate(initialCode);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-2">Editor</h3>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 font-mono p-2 border rounded"
          placeholder="Enter your sequence diagram code here..."
        />
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        {isCompiling && (
          <div className="flex justify-center items-center h-64">
            <span>Loading...</span>
          </div>
        )}
        {error && (
          <div className="text-red-500 p-4 border border-red-300 rounded mb-4">
            {error}
          </div>
        )}
        <div 
          id="diagram-output" 
          className="overflow-auto" 
          dangerouslySetInnerHTML={{ __html: result.svg }}
        />
      </div>
    </div>
  );
};

export default SequenceDiagramEditor;
