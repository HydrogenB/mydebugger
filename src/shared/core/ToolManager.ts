/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Standardized tool configuration system
 * Provides a consistent way to manage tool metadata and configuration
 */

import React from 'react';
import { Tool, ToolCategory } from '../../tools';

export interface ToolConfig {
  id: string;
  enabled: boolean;
  settings: Record<string, any>;
  metadata: {
    lastUsed?: number;
    usageCount: number;
    isPinned: boolean;
    customTitle?: string;
    customDescription?: string;
  };
}

export interface ToolRegistry {
  tools: Map<string, Tool>;
  configs: Map<string, ToolConfig>;
  categories: Map<ToolCategory, Tool[]>;
}

/**
 * Centralized tool management system
 * Eliminates scattered tool registration and provides consistent tool access
 */
class ToolManager {
  private registry: ToolRegistry = {
    tools: new Map(),
    configs: new Map(),
    categories: new Map()
  };

  private subscribers = new Set<(registry: ToolRegistry) => void>();

  /**
   * Register a tool in the system
   */
  registerTool(tool: Tool): void {
    this.registry.tools.set(tool.id, tool);
    
    // Organize by category
    if (!this.registry.categories.has(tool.category)) {
      this.registry.categories.set(tool.category, []);
    }
    this.registry.categories.get(tool.category)!.push(tool);

    // Create default config if not exists
    if (!this.registry.configs.has(tool.id)) {
      this.registry.configs.set(tool.id, {
        id: tool.id,
        enabled: true,
        settings: {},
        metadata: {
          usageCount: 0,
          isPinned: false
        }
      });
    }

    this.notifySubscribers();
  }

  /**
   * Unregister a tool
   */
  unregisterTool(toolId: string): void {
    const tool = this.registry.tools.get(toolId);
    if (tool) {
      this.registry.tools.delete(toolId);
      this.registry.configs.delete(toolId);
      
      // Remove from category
      const categoryTools = this.registry.categories.get(tool.category);
      if (categoryTools) {
        const index = categoryTools.findIndex(t => t.id === toolId);
        if (index !== -1) {
          categoryTools.splice(index, 1);
        }
      }

      this.notifySubscribers();
    }
  }

  /**
   * Get tool by ID
   */
  getTool(id: string): Tool | undefined {
    return this.registry.tools.get(id);
  }

  /**
   * Get tool by route
   */
  getToolByRoute(route: string): Tool | undefined {
    return Array.from(this.registry.tools.values()).find(tool => tool.route === route);
  }

  /**
   * Get all tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.registry.tools.values());
  }

  /**
   * Get enabled tools
   */
  getEnabledTools(): Tool[] {
    return this.getAllTools().filter(tool => {
      const config = this.registry.configs.get(tool.id);
      return config?.enabled !== false;
    });
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: ToolCategory): Tool[] {
    return this.registry.categories.get(category) || [];
  }

  /**
   * Get all categories
   */
  getCategories(): ToolCategory[] {
    return Array.from(this.registry.categories.keys());
  }

  /**
   * Get popular tools
   */
  getPopularTools(): Tool[] {
    return this.getAllTools().filter(tool => tool.isPopular);
  }

  /**
   * Get new tools
   */
  getNewTools(): Tool[] {
    return this.getAllTools().filter(tool => tool.isNew);
  }

  /**
   * Get beta tools
   */
  getBetaTools(): Tool[] {
    return this.getAllTools().filter(tool => tool.isBeta);
  }

  /**
   * Get pinned tools
   */
  getPinnedTools(): Tool[] {
    return this.getAllTools().filter(tool => {
      const config = this.registry.configs.get(tool.id);
      return config?.metadata.isPinned;
    });
  }

  /**
   * Get related tools
   */
  getRelatedTools(toolId: string): Tool[] {
    const tool = this.getTool(toolId);
    if (!tool || !tool.metadata.relatedTools) return [];

    return tool.metadata.relatedTools
      .map(id => this.getTool(id))
      .filter((tool): tool is Tool => tool !== undefined);
  }

  /**
   * Update tool configuration
   */
  updateToolConfig(toolId: string, updates: Partial<ToolConfig>): void {
    const config = this.registry.configs.get(toolId);
    if (config) {
      this.registry.configs.set(toolId, { ...config, ...updates });
      this.notifySubscribers();
    }
  }

  /**
   * Track tool usage
   */
  trackToolUsage(toolId: string): void {
    const config = this.registry.configs.get(toolId);
    if (config) {
      config.metadata.usageCount += 1;
      config.metadata.lastUsed = Date.now();
      this.notifySubscribers();
    }
  }

  /**
   * Pin/unpin tool
   */
  toggleToolPin(toolId: string): void {
    const config = this.registry.configs.get(toolId);
    if (config) {
      config.metadata.isPinned = !config.metadata.isPinned;
      this.notifySubscribers();
    }
  }

  /**
   * Search tools
   */
  searchTools(query: string): Tool[] {
    const lowerQuery = query.toLowerCase();
    
    return this.getAllTools().filter(tool => 
      tool.title.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery) ||
      tool.metadata.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      )
    );
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(callback: (registry: ToolRegistry) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify subscribers of changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.registry);
      } catch (error) {
        console.error('Error in tool registry subscriber:', error);
      }
    });
  }

  /**
   * Get registry snapshot
   */
  getRegistry(): ToolRegistry {
    return {
      tools: new Map(this.registry.tools),
      configs: new Map(this.registry.configs),
      categories: new Map(this.registry.categories)
    };
  }
}

// Global tool manager instance
export const toolManager = new ToolManager();

/**
 * React hook for accessing tool manager
 */
export const useToolManager = () => {
  const [registry, setRegistry] = React.useState<ToolRegistry>(toolManager.getRegistry());

  React.useEffect(() => {
    const unsubscribe = toolManager.subscribe(setRegistry);
    return unsubscribe;
  }, []);

  return {
    registry,
    getTool: (id: string) => toolManager.getTool(id),
    getToolByRoute: (route: string) => toolManager.getToolByRoute(route),
    getAllTools: () => toolManager.getAllTools(),
    getEnabledTools: () => toolManager.getEnabledTools(),
    getToolsByCategory: (category: ToolCategory) => toolManager.getToolsByCategory(category),
    getCategories: () => toolManager.getCategories(),
    getPopularTools: () => toolManager.getPopularTools(),
    getNewTools: () => toolManager.getNewTools(),
    getBetaTools: () => toolManager.getBetaTools(),
    getPinnedTools: () => toolManager.getPinnedTools(),
    getRelatedTools: (toolId: string) => toolManager.getRelatedTools(toolId),
    searchTools: (query: string) => toolManager.searchTools(query),
    trackToolUsage: (toolId: string) => toolManager.trackToolUsage(toolId),
    toggleToolPin: (toolId: string) => toolManager.toggleToolPin(toolId),
    updateToolConfig: (toolId: string, updates: Partial<ToolConfig>) => 
      toolManager.updateToolConfig(toolId, updates)
  };
};
