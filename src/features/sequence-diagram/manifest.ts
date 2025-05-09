import { lazy } from 'react';
import { ToolCategory } from '@types/tools';
import { SequenceDiagramIcon } from '@shared/components/icons';

const sequenceDiagram = {
  id: 'sequence-diagram',
  route: '/sequence-diagram',
  title: 'Sequence Diagram',
  description: 'Create and edit interactive sequence diagrams with multiple export formats.',
  longDescription: 'Visual sequence diagram editor with real-time preview, multiple export formats (SVG, PNG, PDF), and support for different diagram syntaxes.',
  icon: SequenceDiagramIcon,
  component: lazy(() => import('./SequenceDiagramTool')),
  category: 'Utilities' as ToolCategory,
  isNew: false,
  metadata: {
    keywords: ['diagram', 'sequence diagram', 'flow', 'visualization', 'UML', 'mermaid', 'plantuml', 'visual', 'architecture'],
    learnMoreUrl: 'https://en.wikipedia.org/wiki/Sequence_diagram',
    relatedTools: ['regex-tester'],
  },
  uiOptions: {
    fullWidth: true,
    showExamples: false
  }
};

export default sequenceDiagram;
