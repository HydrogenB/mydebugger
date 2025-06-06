import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ToolCard from '@/components/ui/ToolCard';
import { Tool } from '@/models';

describe('ToolCard', () => {
  const tool: Tool = {
    id: 'link-tracer',
    name: 'Link Tracer',
    description: 'Trace the complete redirect path of any URL.',
    categoryId: 'utilities',
    route: '/tools/link-tracer',
  };

  it('renders tool name and description', () => {
    render(<ToolCard tool={tool} />);
    expect(screen.getByText(/Link Tracer/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Trace the complete redirect path of any URL./i),
    ).toBeInTheDocument();
  });
});
