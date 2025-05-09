import React, { useState } from 'react';
import { ToolLayout } from '@design-system'; // Assuming ToolLayout is from main design system entry
import SequenceDiagramEditor from './components/SequenceDiagramEditor';
import { useTool } from '../../hooks/useTool';

interface SequenceDiagramToolProps {}

const SequenceDiagramTool: React.FC<SequenceDiagramToolProps> = () => {
  const tool = getToolByRoute('/sequence-diagram');
  const [code, setCode] = useState<string>(`title Simple Sequence Diagram
participant User
participant System
User->System: Request
System-->User: Response`);
  
  return (
    <ToolLayout tool={tool!}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-medium mb-2">Editor</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 font-mono p-2 border rounded"
          />
        </div>
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-medium mb-2">Preview</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 h-64 flex items-center justify-center">
            <p className="text-gray-500">Diagram preview would render here</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default SequenceDiagramTool;