import { useState, useCallback } from 'react';
import { ComponentCategory, DemoComponent } from '../types';

/**
 * Custom hook for the Components Demo tool
 * Manages component categories, selected components, and examples
 */
export const useComponentsDemo = () => {
  const [activeCategory, setActiveCategory] = useState<ComponentCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // List of available component categories
  const categories: ComponentCategory[] = [
    'layout',
    'display',
    'input',
    'navigation',
    'feedback',
    'overlay'
  ];
  
  // Sample components list - in a real implementation, this could be fetched from a JSON file or API
  const allComponents: DemoComponent[] = [
    {
      id: 'button',
      name: 'Button',
      description: 'Clickable button component with various styles',
      category: 'input',
      path: 'design-system/components/inputs/Button'
    },
    {
      id: 'card',
      name: 'Card',
      description: 'Container component for organizing content',
      category: 'layout',
      path: 'design-system/components/layout/Card'
    },
    {
      id: 'tooltip',
      name: 'Tooltip',
      description: 'Displays additional information on hover',
      category: 'overlay',
      path: 'design-system/components/overlays/Tooltip'
    },
    {
      id: 'infobox',
      name: 'InfoBox',
      description: 'Displays important information with different styles',
      category: 'feedback',
      path: 'design-system/components/feedback/InfoBox'
    }
  ];
  
  // Filter components based on active category and search term
  const filteredComponents = useCallback(() => {
    let filtered = [...allComponents];
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(component => component.category === activeCategory);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(component => 
        component.name.toLowerCase().includes(searchLower) || 
        component.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [activeCategory, searchTerm, allComponents]);
  
  // Get component by ID
  const getComponentById = (id: string): DemoComponent | undefined => {
    return allComponents.find(component => component.id === id);
  };
  
  // Get components by category
  const getComponentsByCategory = (category: ComponentCategory): DemoComponent[] => {
    return allComponents.filter(component => component.category === category);
  };
  
  return {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    categories,
    components: filteredComponents(),
    getComponentById,
    getComponentsByCategory
  };
};
