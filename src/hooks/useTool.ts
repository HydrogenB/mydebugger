import { useEffect, useState } from 'react';

// Define a basic Tool type
interface Tool {
  id: string;
  title: string;
  route: string;
  description: string;
  icon: React.ComponentType;
  component: React.ComponentType;
  // Add other properties as needed
}

// Mock function to get tools data
export const getToolByRoute = (route: string): Tool | undefined => {
  // This would be replaced with your actual tool lookup logic
  const tools: Tool[] = [
    // Add your tools here
    {
      id: 'sequence-diagram',
      title: 'Sequence Diagram',
      route: '/sequence-diagram',
      description: 'Create and edit sequence diagrams',
      icon: () => null, // Replace with actual icon
      component: () => null, // Replace with actual component
    },
    // ... other tools
  ];
  
  return tools.find(tool => tool.route === route);
};

export const useTool = (route: string) => {
  const [tool, setTool] = useState<Tool | undefined>(undefined);
  
  useEffect(() => {
    const toolData = getToolByRoute(route);
    setTool(toolData);
  }, [route]);
  
  return tool;
};
