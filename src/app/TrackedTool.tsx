import React, { useEffect } from 'react';
import type { Tool } from '../tools';

interface TrackedToolProps {
  tool: Tool;
}

const TrackedTool: React.FC<TrackedToolProps> = ({ tool }) => {
  useEffect(() => {
    // Lazy import to keep initial bundle light
    import('../lib/analytics')
      .then(({ logEvent }) => {
        logEvent('tool_view', {
          tool_id: tool.id,
          tool_title: tool.title,
          tool_category: tool.category,
          page_path: window.location.pathname + window.location.search,
          page_title: document.title,
        });
      })
      .catch(() => {});
  }, [tool]);

  const Component = tool.component as React.ComponentType<any>;
  return <Component />;
};

export default TrackedTool;


