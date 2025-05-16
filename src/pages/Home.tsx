import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  Grid,
  ResponsiveContainer,
  Button,
  TabGroup,
  Tab,
  TabPanel,
  Tag,
  Badge
} from '../design-system';
import { getTools, getAllCategories, getToolsByCategory, getPopularTools, getNewTools, Tool, ToolCategory } from '../tools';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [visibleTools, setVisibleTools] = useState<Tool[]>([]);
  const allTools = getTools();
  const categories = getAllCategories();
  const popularTools = getPopularTools();
  
  // Update visible tools when search term or active tab changes
  useEffect(() => {
    let filtered: Tool[];
    
    if (activeTab === 'all') {
      filtered = allTools;
    } else if (activeTab === 'popular') {
      filtered = popularTools;
    } else if (activeTab === 'new') {
      filtered = getNewTools();
    } else {
      filtered = getToolsByCategory(activeTab as ToolCategory);
    }
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.title.toLowerCase().includes(lowerSearch) || 
        tool.description.toLowerCase().includes(lowerSearch) ||
        tool.metadata.keywords.some(keyword => keyword.toLowerCase().includes(lowerSearch))
      );
    }
    
    setVisibleTools(filtered);
  }, [searchTerm, activeTab, allTools, popularTools]);
  
  return (
    <>
      <Helmet>
        <title>MyDebugger - Web Developer Tools Dashboard</title>
        <meta name="description" content="Collection of essential web developer tools for debugging, encoding, formatting, testing, and more." />
        <meta name="keywords" content="developer tools, web debugging, jwt toolkit, qr code generator, url encoder, regex tester" />
        <meta property="og:title" content="MyDebugger - Web Developer Tools" />
        <meta property="og:description" content="Essential developer toolkit for modern web development" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="MyDebugger - Web Developer Tools" />
        <meta name="twitter:description" content="Essential developer toolkit for modern web development" />
      </Helmet>
      
      <ResponsiveContainer maxWidth="7xl" className="py-6 px-4 sm:px-6">
        {/* Hero Section */}
        <section className="mb-10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Developer Tools Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-8">
              Access all the tools you need for web development, debugging, security testing, and more. Optimized for productivity and accessibility.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto md:mx-0 mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tools, keywords, functionality..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search tools"
              />
            </div>
          </div>
        </section>
        
        {/* Category Tabs */}
        <section className="mb-8">          <TabGroup
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underlined"
          >
            <Tab id="all">All Tools</Tab>
            <Tab id="popular">Popular</Tab>
            <Tab id="new">New</Tab>
            {categories.map(category => (
              <Tab key={category} id={category}>{category}</Tab>
            ))}
          </TabGroup>
        </section>
        
        {/* Tools Grid */}
        <section className="mb-12">
          {visibleTools.length > 0 ? (
            <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="md">
              {visibleTools.map(tool => (
                <Link
                  key={tool.id}
                  to={tool.route}
                  className="no-underline"
                  aria-labelledby={`tool-title-${tool.id}`}
                >
                  <Card
                    isInteractive
                    className="h-full"
                  >
                    <div className="flex items-start mb-2">
                      <div className="mr-3 p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                        <tool.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h2 id={`tool-title-${tool.id}`} className="text-lg font-medium text-gray-900 dark:text-white mr-2">
                            {tool.title}
                          </h2>
                          <div className="flex space-x-1">
                            {tool.isNew && <Tag variant="success" size="sm">NEW</Tag>}
                            {tool.isBeta && <Tag variant="warning" size="sm">BETA</Tag>}
                            {tool.isPopular && <Tag size="sm">POPULAR</Tag>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {tool.category}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {tool.description}
                    </p>
                  </Card>
                </Link>
              ))}
            </Grid>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                No tools found matching your search criteria.
              </p>
              <Button 
                onClick={() => {setSearchTerm(''); setActiveTab('all');}} 
                variant="secondary"
                className="mt-4"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </section>
        
        {/* Footer CTA */}
        <section className="bg-primary-50 dark:bg-gray-800 rounded-xl p-6 md:p-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Need a custom tool?</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl">
                Can't find what you're looking for? Let us know and we might add it to our collection.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <a                href="https://github.com/HydrogenB/mydebugger" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
              >
                Visit GitHub
                <svg className="ml-2 -mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </ResponsiveContainer>
    </>
  );
};

export default Home;