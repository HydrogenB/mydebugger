import React from 'react';
import { Card } from '../../design-system/components/layout';
import SequenceDiagramEditor from './components/SequenceDiagramEditor';
import { useTool } from '../../hooks/useTool';

const SequenceDiagramTool: React.FC = () => {
  // Import the getToolByRoute function or retrieve from context
  const tool = useTool('/sequence-diagram');
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{tool?.title || 'Sequence Diagram'}</h1>
      <Card className="mb-4">
        <p>{tool?.description || 'Create and edit sequence diagrams with an interactive editor.'}</p>
      </Card>
      
      <SequenceDiagramEditor />
    </div>
  );
};

export default SequenceDiagramTool;