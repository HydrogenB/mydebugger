'use client';

import { useState } from 'react';
import { ToolCategory, Tool } from '@/models';

export function useHomeViewModel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // These functions will be implemented when we actually have tools to display
  const categories: ToolCategory[] = [];
  const tools: Tool[] = [];
  
  const filteredTools = tools;

  // Filter logic will be implemented when we have actual tools data

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredTools,
  };
}
