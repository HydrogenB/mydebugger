import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAllCategories, 
  getPopularTools, 
  getNewTools,
  getAllTools, 
  ToolCategory, 
  Tool, 
  categories,
  getToolById 
} from '../tools';

// Import components from design system instead of legacy components
import { Card } from '../design-system/components/layout';
import { Button } from '../design-system/components/inputs';
import { Badge } from '../design-system/components/display';
import { Tag } from '../design-system/components/display';
import { getIcon } from '../design-system/icons';

// Responsive container component (we can create this in the layout category if needed)
const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
}> = ({ children, maxWidth = "7xl", padding = "md" }) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth] || 'max-w-7xl';

  const paddingClass = {
    none: 'px-0',
    xs: 'px-2',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
  }[padding] || 'px-6';

  return (
    <div className={`${maxWidthClass} mx-auto w-full ${paddingClass}`}>
      {children}
    </div>
  );
};

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'new' | ToolCategory>('all');
  
  const allTools = getAllTools();
  const allCategories = getAllCategories();
  const popularTools = getPopularTools();
  const newTools = getNewTools();
  
  // Filter tools based on search query and active filter
  const filteredTools = allTools.filter(tool => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.metadata.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    // Category filter
    let matchesFilter = true;
    if (activeFilter === 'popular') {
      matchesFilter = tool.isPopular === true;
    } else if (activeFilter === 'new') {
      matchesFilter = tool.isNew === true;
    } else if (activeFilter !== 'all') {
      matchesFilter = tool.category === activeFilter;
    }
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <ResponsiveContainer maxWidth="7xl" padding="md">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 mb-12 shadow-lg text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Developer Tool Hub</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Powerful tools for developers to debug, encode, decode & test your applications
          </p>
          
          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Using the design system icon */}
              <span className="text-blue-300">{getIcon('search')}</span>
            </div>
            <input
              type="text"
              placeholder="Search for tools..."
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 bg-white bg-opacity-90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <FilterTab 
          label="All Tools" 
          isActive={activeFilter === 'all'} 
          onClick={() => setActiveFilter('all')} 
        />
        <FilterTab 
          label="Popular" 
          isActive={activeFilter === 'popular'} 
          onClick={() => setActiveFilter('popular')} 
          count={popularTools.length}
        />
        {newTools.length > 0 && (
          <FilterTab 
            label="New" 
            isActive={activeFilter === 'new'} 
            onClick={() => setActiveFilter('new')} 
            count={newTools.length}
            highlight
          />
        )}
        
        <div className="h-6 border-r border-gray-300 mx-2"></div>
        
        {allCategories.map((category) => {
          const CategoryIcon = categories[category].icon;
          return (
            <FilterTab 
              key={category} 
              label={category} 
              isActive={activeFilter === category} 
              onClick={() => setActiveFilter(category)} 
              icon={<CategoryIcon className="h-4 w-4 mr-1.5" />}
            />
          );
        })}
      </div>
      
      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No matching tools found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
          <Button
            variant="primary"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </ResponsiveContainer>
  );
};

// Filter Tab Component
interface FilterTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
  highlight?: boolean;
  icon?: React.ReactNode;
}

const FilterTab: React.FC<FilterTabProps> = ({ 
  label, 
  isActive, 
  onClick, 
  count, 
  highlight = false,
  icon
}) => {
  return (
    <Button
      onClick={onClick}
      variant={isActive ? "primary" : "ghost"}
      size="sm"
      icon={icon}
      className={`
        rounded-full
        ${highlight && !isActive ? 'ring-2 ring-green-400' : ''}
      `}
    >
      {label}
      {count !== undefined && (
        <Badge 
          variant={isActive ? "light" : "secondary"} 
          size="xs" 
          inline 
          pill
          className="ml-1.5"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
};

// Tool Card Component
interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { title, description, route, icon: Icon, isNew, isBeta } = tool;
  
  return (
    <Link to={route}>
      <Card 
        isElevated 
        isInteractive 
        className="h-full"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start mb-4">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 mr-4">
              <Icon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center flex-wrap">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
                {isNew && (
                  <Tag variant="success" size="xs" className="ml-2">NEW</Tag>
                )}
                {isBeta && (
                  <Tag variant="warning" size="xs" className="ml-2">BETA</Tag>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 flex-grow">{description}</p>
          
          <div className="mt-6 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {tool.category}
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center">
              Try now
              {getIcon('arrow-right')}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Home;