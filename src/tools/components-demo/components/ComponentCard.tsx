import React from 'react';
import { Card } from '../../../design-system/components/layout';
import { Badge } from '../../../design-system/components/display';
import { Button } from '../../../design-system/components/inputs';
import { DemoComponent } from '../types';
import { getCategoryColor } from '../utils';

interface ComponentCardProps {
  component: DemoComponent;
  onViewDetails: (component: DemoComponent) => void;
}

/**
 * Card component for displaying a component demo
 */
export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onViewDetails
}) => {
  return (
    <Card isElevated className="h-full flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {component.name}
          </h3>
          <Badge className={getCategoryColor(component.category)}>
            {component.category}
          </Badge>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {component.description}
        </p>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">
          {component.path}
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <Button 
          variant="primary"
          onClick={() => onViewDetails(component)}
          className="w-full"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};
