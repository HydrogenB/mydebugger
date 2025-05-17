import { useEffect, useState } from 'react';
import { Tool, getToolByRoute as _getToolByRoute } from '../tools';

/**
 * Custom hook to get a tool by its route
 * @param route The route of the tool
 * @returns The tool data or undefined if not found
 */
export const useTool = (route: string) => {
  const [tool, setTool] = useState<Tool | undefined>(undefined);
  
  useEffect(() => {
    const toolData = _getToolByRoute(route);
    setTool(toolData);
  }, [route]);
  
  return tool;
};
