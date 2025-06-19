/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Plugin architecture for MyDebugger tools
 * Enables extensible, modular tool development following open-source best practices
 */

import React from 'react';
import { Tool, ToolCategory, IconProps } from '../../tools';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository?: string;
  homepage?: string;
  keywords: string[];
  dependencies?: string[];
  
  // Tool definitions
  tools: ToolDefinition[];
  
  // Plugin lifecycle hooks
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;
}

export interface ToolDefinition {
  id: string;
  route: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: React.FC<IconProps>;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  metadata: {
    keywords: string[];
    learnMoreUrl?: string;
    relatedTools?: string[];
  };
  uiOptions?: {
    showExamples?: boolean;
    fullWidth?: boolean;
  };
}

export interface PluginContext {
  registerTool: (tool: ToolDefinition) => void;
  unregisterTool: (id: string) => void;
  getRegisteredTools: () => Tool[];
  emitEvent: (event: string, data?: any) => void;
  onEvent: (event: string, handler: (data?: any) => void) => () => void;
}

/**
 * Plugin registry manages all installed plugins
 */
class PluginRegistry {
  private plugins = new Map<string, PluginManifest>();
  private tools = new Map<string, Tool>();
  private eventHandlers = new Map<string, Set<(data?: any) => void>>();

  /**
   * Register a new plugin
   */
  async registerPlugin(manifest: PluginManifest): Promise<void> {
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is already registered`);
    }

    // Validate dependencies
    if (manifest.dependencies) {
      for (const dep of manifest.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Missing dependency: ${dep}`);
        }
      }
    }

    // Register the plugin
    this.plugins.set(manifest.id, manifest);

    // Register tools from this plugin
    for (const toolDef of manifest.tools) {
      const tool: Tool = {
        ...toolDef,
        component: React.lazy(toolDef.component),
        isPopular: false,
        isBeta: false,
        isNew: true
      };
      this.tools.set(tool.id, tool);
    }

    // Execute activation hook
    if (manifest.onActivate) {
      await manifest.onActivate();
    }

    this.emitEvent('plugin:registered', { pluginId: manifest.id });
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Execute deactivation hook
    if (plugin.onDeactivate) {
      await plugin.onDeactivate();
    }

    // Remove tools
    for (const toolDef of plugin.tools) {
      this.tools.delete(toolDef.id);
    }

    // Remove plugin
    this.plugins.delete(pluginId);

    this.emitEvent('plugin:unregistered', { pluginId });
  }

  /**
   * Get all registered tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tool by ID
   */
  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Emit an event
   */
  emitEvent(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event
   */
  onEvent(event: string, handler: (data?: any) => void): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    const handlers = this.eventHandlers.get(event)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    };
  }

  /**
   * Create plugin context for plugin development
   */
  createContext(): PluginContext {
    return {
      registerTool: (tool: ToolDefinition) => {
        const fullTool: Tool = {
          ...tool,
          component: React.lazy(tool.component),
          isPopular: false,
          isBeta: false,
          isNew: true
        };
        this.tools.set(tool.id, fullTool);
      },
      unregisterTool: (id: string) => {
        this.tools.delete(id);
      },
      getRegisteredTools: () => this.getTools(),
      emitEvent: (event: string, data?: any) => this.emitEvent(event, data),
      onEvent: (event: string, handler: (data?: any) => void) => this.onEvent(event, handler)
    };
  }
}

// Global plugin registry instance
export const pluginRegistry = new PluginRegistry();

/**
 * Hook for accessing plugin functionality in React components
 */
export const usePlugins = () => {
  const [plugins, setPlugins] = React.useState<PluginManifest[]>([]);
  const [tools, setTools] = React.useState<Tool[]>([]);

  React.useEffect(() => {
    const updateState = () => {
      setPlugins(pluginRegistry.getPlugins());
      setTools(pluginRegistry.getTools());
    };

    updateState();

    const unsubscribe1 = pluginRegistry.onEvent('plugin:registered', updateState);
    const unsubscribe2 = pluginRegistry.onEvent('plugin:unregistered', updateState);

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, []);

  return {
    plugins,
    tools,
    registerPlugin: (manifest: PluginManifest) => pluginRegistry.registerPlugin(manifest),
    unregisterPlugin: (id: string) => pluginRegistry.unregisterPlugin(id),
    emitEvent: (event: string, data?: any) => pluginRegistry.emitEvent(event, data),
    onEvent: (event: string, handler: (data?: any) => void) => pluginRegistry.onEvent(event, handler)
  };
};

/**
 * Utility function to create a plugin manifest
 */
export const createPlugin = (config: Omit<PluginManifest, 'tools'> & { tools: ToolDefinition[] }): PluginManifest => {
  return {
    ...config,
    tools: config.tools
  };
};
