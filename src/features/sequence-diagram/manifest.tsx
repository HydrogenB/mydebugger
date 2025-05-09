import { lazy } from 'react';
import { Tool, ToolCategory } from '../../tools'; // Corrected path for ToolCategory
import { ChartBarIcon } from '@heroicons/react/24/outline'; // Placeholder Icon

// Placeholder if SequenceDiagramIcon is missing
const SequenceDiagramIcon = ChartBarIcon;

const sequenceDiagramTool: Tool = {
  id: 'sequence-diagram',
  title: 'Sequence Diagram',
  description: 'Create and visualize sequence diagrams.',
  icon: SequenceDiagramIcon,
  category: 'Utilities' as ToolCategory, // Cast if ToolCategory is a string literal union
  route: '/sequence-diagram',
  component: lazy(() =>
    import('../../tools/sequence-diagram/SequenceDiagramTool').catch(() => ({
      default: () => (<div>Sequence Diagram Tool Component Not Found</div>),
    }))
  ),
  metadata: {
    keywords: ['sequence diagram', 'uml', 'diagram', 'visualization'],
  },
};

export default sequenceDiagramTool;
