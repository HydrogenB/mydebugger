'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { useState, useMemo } from 'react';
import { Tool, availableTools } from '@/models';

export function useHomeViewModel() {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTools = useMemo(() => {
    if (!searchQuery) return availableTools;
    const query = searchQuery.toLowerCase();
    return availableTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredTools,
  };
}
