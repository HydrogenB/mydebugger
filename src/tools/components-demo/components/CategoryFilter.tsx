import React from 'react';
import { Badge } from '../../../design-system/components/display';
import { TextInput } from '../../../design-system/components/inputs';
import { ComponentCategory } from '../types';
import { getCategoryDisplayName, getCategoryColor } from '../utils';

interface CategoryFilterProps {
  categories: ComponentCategory[];
  activeCategory: ComponentCategory | 'all';
  onSelectCategory: (category: ComponentCategory | 'all') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

/**
 * Component for filtering and searching through components
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            className={`cursor-pointer ${activeCategory === 'all' 
              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 ring-1 ring-primary-500' 
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
            onClick={() => onSelectCategory('all')}
          >
            All Components
          </Badge>
          
          {categories.map(category => (
            <Badge
              key={category}
              className={`cursor-pointer ${activeCategory === category 
                ? `${getCategoryColor(category)} ring-1 ring-${category === 'layout' ? 'blue' : category === 'display' ? 'purple' : category === 'input' ? 'green' : category === 'navigation' ? 'amber' : category === 'feedback' ? 'red' : 'teal'}-500` 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
              onClick={() => onSelectCategory(category)}
            >
              {getCategoryDisplayName(category)}
            </Badge>
          ))}
        </div>
        
        <div className="w-full sm:w-auto">          <TextInput
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search components..."
            className="w-full sm:w-64"
            startAdornment={
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            clearable
          />
        </div>
      </div>
    </div>
  );
};
