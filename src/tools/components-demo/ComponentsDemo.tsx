import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { getToolByRoute } from '../index';
import { ToolLayout, Card, Grid } from '../../design-system/components/layout';
import { Text } from '../../design-system/components/typography';
import { DemoComponent } from './types';
import { useComponentsDemo } from './hooks';
import { CategoryFilter, ComponentCard, ComponentDetails } from './components';

/**
 * Demo component to showcase UI components and their usage
 * Standardized with separate components, hooks, and utility functions
 */
const ComponentsDemo: React.FC = () => {
  const tool = getToolByRoute('/components-demo');
  const { 
    activeCategory, 
    setActiveCategory, 
    searchTerm, 
    setSearchTerm, 
    categories, 
    components 
  } = useComponentsDemo();
  
  const [selectedComponent, setSelectedComponent] = useState<DemoComponent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const handleViewDetails = (component: DemoComponent) => {
    setSelectedComponent(component);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <>
      <Helmet>
        <title>UI Components Demo | MyDebugger</title>
        <meta name="description" content="Showcase of reusable UI components in the MyDebugger toolkit" />
      </Helmet>
      <ToolLayout tool={tool!}>
        <div className="mb-6">
          <Text size="xl" weight="medium">UI Components Library</Text>
          <Text className="text-gray-600 dark:text-gray-300">
            Browse and explore the reusable components available in the MyDebugger design system.
          </Text>
        </div>
        
        <Card className="mb-8">
          <div className="p-5">
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </Card>
        
        <Grid columns={3} gap="md" className="mb-8">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onViewDetails={handleViewDetails}
            />
          ))}
        </Grid>
        
        {components.length === 0 && (
          <Card className="p-8 text-center">
            <Text size="lg" className="text-gray-500 dark:text-gray-400">
              No components found matching your criteria.
            </Text>
          </Card>
        )}
        
        <ComponentDetails
          component={selectedComponent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </ToolLayout>
    </>
  );
};

export default ComponentsDemo;