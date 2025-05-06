import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAllCategories, 
  getToolsByCategory, 
  getPopularTools, 
  getNewTools,
  getAllTools, 
  ToolCategory, 
  Tool, 
  categories 
} from '../tools';
import Card from '../tools/components/Card';

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
    <div className="container mx-auto px-4 py-8">
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
              <svg className="h-5 w-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
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
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
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
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full flex items-center text-sm font-medium transition-all
        ${isActive 
          ? 'bg-blue-500 text-white shadow-sm' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
        ${highlight && !isActive ? 'ring-2 ring-green-400' : ''}
      `}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={`
          ml-1.5 px-1.5 py-0.5 text-xs rounded-full
          ${isActive ? 'bg-white bg-opacity-30 text-white' : 'bg-gray-200 text-gray-700'}
        `}>
          {count}
        </span>
      )}
    </button>
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
      <Card isElevated isInteractive className="h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-start mb-4">
            <div className="p-2 rounded-lg bg-blue-50 mr-4">
              <Icon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {isNew && (
                  <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                    NEW
                  </span>
                )}
                {isBeta && (
                  <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                    BETA
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-600 flex-grow">{description}</p>
          
          <div className="mt-6 flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {tool.category}
            </span>
            <span className="text-blue-600 font-medium text-sm flex items-center">
              Try now
              <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Home;