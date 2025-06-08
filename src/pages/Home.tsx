/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Badge,
  Text,
  Tooltip
} from '../design-system';
import { getTools, getAllCategories, getToolsByCategory, getPopularTools, getNewTools, Tool, ToolCategory } from '../tools';
import './Home.css';

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [visibleTools, setVisibleTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [recentTools, setRecentTools] = useState<Tool[]>([]);
  const [isFeaturedExpanded, setIsFeaturedExpanded] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const allTools = useMemo(() => getTools(), []);
  const categories = useMemo(() => getAllCategories(), []);
  const popularTools = useMemo(() => getPopularTools(), []);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const toolsContainerRef = useRef<HTMLDivElement>(null);
  
  // Simulate loading and retrieve recent tools from localStorage
  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    // Get recently used tools from localStorage
    try {
      const recent = localStorage.getItem('recentTools');
      if (recent) {
        const recentIds = JSON.parse(recent) as string[];
        const recentToolsData = allTools.filter(tool => recentIds.includes(tool.id));
        setRecentTools(recentToolsData.slice(0, 3));
      }
    } catch (e) {
      console.error('Error loading recent tools:', e);
    }
    
    return () => clearTimeout(timer);
  }, [allTools]);

  // Handle scroll to show scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add intersection observer for card animations
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add animation class when card is visible
            entry.target.classList.add('animate');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    // Add observer to all tool cards
    setTimeout(() => {
      const cards = document.querySelectorAll('.tool-card');
      cards.forEach((card) => {
        observerRef.current?.observe(card);
      });
    }, 100);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [visibleTools]);
  
  // Update visible tools when search term or active tab changes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let filtered: Tool[];
      
      if (activeTab === 'all') {
        filtered = allTools;
      } else if (activeTab === 'popular') {
        filtered = popularTools;
      } else if (activeTab === 'new') {
        filtered = getNewTools();
      } else if (activeTab === 'recent') {
        filtered = recentTools;
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
      setIsLoading(false);
    }, 300);
  }, [searchTerm, activeTab, allTools, popularTools, recentTools]);
  
  const handleToolClick = useCallback((tool: Tool) => {
    // Save to recent tools in localStorage
    try {
      const recent = localStorage.getItem('recentTools');
      let recentIds: string[] = recent ? JSON.parse(recent) : [];
      
      // Remove if exists and add to front (most recent)
      recentIds = recentIds.filter(id => id !== tool.id);
      recentIds.unshift(tool.id);
      
      // Keep only the last 10
      recentIds = recentIds.slice(0, 10);
      
      localStorage.setItem('recentTools', JSON.stringify(recentIds));
    } catch (e) {
      console.error('Error saving recent tool:', e);
    }
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
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
        <section className="mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-transparent dark:from-gray-900 dark:to-gray-800 opacity-50 rounded-xl"></div>
          
          <div className="relative z-10 py-8 px-4 sm:px-8 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 hero-text-animation">
                  <span className="gradient-text">Developer Tools</span> Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-8 hero-text-animation" style={{ animationDelay: '0.2s' }}>
                  Access all the tools you need for web development, debugging, security testing, and more.
                  <br className="hidden md:block" />
                  <span className="font-medium">Optimized for productivity and enhanced with AI capabilities.</span>
                </p>
                
                <div className="flex flex-wrap gap-3 mb-8 hero-text-animation" style={{ animationDelay: '0.4s' }}>
                  <Badge color="primary" size="lg" className="category-badge">100+ Tools</Badge>
                  <Badge color="success" size="lg" className="category-badge">Modern UI</Badge>
                  <Badge color="warning" size="lg" className="category-badge">Dark Mode</Badge>
                  <Badge color="info" size="lg" className="category-badge">Responsive</Badge>
                  <Badge color="secondary" size="lg" className="category-badge">Open Source</Badge>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0 hero-text-animation" style={{ animationDelay: '0.6s' }}>
                <div className="p-1 bg-white dark:bg-gray-700 rounded-full shadow-lg">
                  <img 
                    src="/favicon.svg" 
                    alt="MyDebugger Logo" 
                    className="w-32 h-32 md:w-40 md:h-40 object-cover animate-pulse"
                  />
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto md:mx-0 mt-8 search-bar-animation">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tools, keywords, functionality..."
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full leading-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm hover:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search tools"
              />
              {searchTerm && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 search-bar-animation" style={{ animationDelay: '0.8s' }}>
              <div className="stats-card bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-primary-500">{allTools.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Tools</div>
              </div>
              <div className="stats-card bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-primary-500">{categories.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Categories</div>
              </div>
              <div className="stats-card bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-primary-500">{popularTools.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Popular Tools</div>
              </div>
              <div className="stats-card bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-primary-500">{getNewTools().length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">New Tools</div>
              </div>
            </div>
          </div>
        </section>
          {/* Category Tabs and Tools Header */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 gradient-text">
              Browse Tools
            </h2>
            
            <div className="flex items-center space-x-3 mt-3 md:mt-0">
              {/* Filter indicators */}
              {searchTerm && (
                <div className="flex items-center bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-primary-300 py-1 px-3 rounded-full text-sm">
                  <span>Search: {searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-200"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* View Mode toggle */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
                <button
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Categories as chips for mobile */}
          <div className="md:hidden mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`category-chip px-3 py-1 rounded-full text-sm ${activeTab === 'all' 
                ? 'bg-primary-500 text-white font-medium shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`category-chip px-3 py-1 rounded-full text-sm ${activeTab === 'popular' 
                ? 'bg-primary-500 text-white font-medium shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`category-chip px-3 py-1 rounded-full text-sm ${activeTab === 'new' 
                ? 'bg-primary-500 text-white font-medium shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              New
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`category-chip px-3 py-1 rounded-full text-sm ${activeTab === 'recent' 
                ? 'bg-primary-500 text-white font-medium shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              Recent
            </button>
            {categories.slice(0, 5).map(category => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`category-chip px-3 py-1 rounded-full text-sm ${activeTab === category 
                  ? 'bg-primary-500 text-white font-medium shadow-md' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                {category}
              </button>
            ))}
            {categories.length > 5 && (
              <button
                className="category-chip px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                onClick={() => {/* Show more categories modal */}}
              >
                +{categories.length - 5} more
              </button>
            )}
          </div>
          
          {/* Desktop tabs */}
          <div className="hidden md:block tab-animation">
            <TabGroup
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="underlined"
            >
              <Tab id="all">All Tools</Tab>
              <Tab id="popular">Popular</Tab>
              <Tab id="new">New</Tab>
              <Tab id="recent">Recently Used</Tab>
              {categories.map(category => (
                <Tab key={category} id={category}>{category}</Tab>
              ))}
            </TabGroup>
          </div>
        </section>
          {/* Featured Tool Section (only on first page load and not during search/filter) */}
        {!searchTerm && activeTab === 'all' && (
          <section className="mb-8">
            <div className="featured-section p-6 wave-bg">
              <div className="md:flex items-center">
                <div className="md:w-2/3 md:pr-8">
                  <Badge color="primary" className="mb-3">FEATURED TOOL</Badge>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">JWT Toolkit</h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
                    Comprehensive JSON Web Token debugging, decoding, and security analysis tool with support for all common algorithms.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge color="success">Updated</Badge>
                    <Badge>Security</Badge>
                    <Badge color="info">Authentication</Badge>
                  </div>
                  <Link to="/jwt">
                    <Button variant="primary" size="lg">
                      Try JWT Toolkit
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Button>
                  </Link>
                </div>
                <div className="md:w-1/3 mt-6 md:mt-0 text-center">
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-lg inline-block">
                    <svg className="w-24 h-24 mx-auto text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="mt-3 font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      eyJhbGciOiJIUzI1NiJ9...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Recently Used Tools (only show if there are recent tools and not searching) */}
        {!searchTerm && activeTab !== 'recent' && recentTools.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recently Used Tools</h2>
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => setActiveTab('recent')}
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentTools.map(tool => (
                <Link
                  key={`recent-${tool.id}`}
                  to={tool.route}
                  onClick={() => handleToolClick(tool)}
                  className="no-underline"
                >
                  <div className="flex items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                    <div className="mr-3 p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <tool.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{tool.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tool.category}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tools Grid */}
        <section className="mb-12" ref={toolsContainerRef}>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {visibleTools.length > 0 ? (
                <span>Showing {visibleTools.length} tool{visibleTools.length !== 1 ? 's' : ''}</span>
              ) : null}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => {setSearchTerm(''); setActiveTab('all');}}
                disabled={!searchTerm && activeTab === 'all'}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {isLoading ? (
            // Skeleton loading state
            <div className={viewMode === 'grid' ? 
              "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" : 
              "space-y-3"
            }>
              {Array.from({ length: 6 }).map((_, i) => (
                viewMode === 'grid' ? (
                  <div key={`skeleton-${i}`} className="rounded-lg overflow-hidden">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 skeleton"></div>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <div className="h-5 w-3/4 mb-2 bg-gray-200 dark:bg-gray-700 skeleton rounded"></div>
                      <div className="h-4 w-1/2 mb-4 bg-gray-200 dark:bg-gray-700 skeleton rounded"></div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 skeleton rounded"></div>
                    </div>
                  </div>
                ) : (
                  <div key={`skeleton-${i}`} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                    <div className="w-10 h-10 rounded mr-4 bg-gray-200 dark:bg-gray-700 skeleton"></div>
                    <div className="flex-grow">
                      <div className="h-5 w-1/2 mb-2 bg-gray-200 dark:bg-gray-700 skeleton rounded"></div>
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 skeleton rounded"></div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : visibleTools.length > 0 ? (
            viewMode === 'grid' ? (
              <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="md">
                {visibleTools.map(tool => (
                  <Link
                    key={tool.id}
                    to={tool.route}
                    onClick={() => handleToolClick(tool)}
                    className="no-underline tool-card"
                    aria-labelledby={`tool-title-${tool.id}`}
                  >
                    <Card
                      isInteractive
                      className="h-full hover:border-primary-300 dark:hover:border-primary-700 glass-card relative"
                    >
                      {/* Interactive elements overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-end justify-end p-3">
                        <Tooltip content="Quick preview">
                          <button className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg mr-2" aria-label="Preview tool">
                            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      
                      <div className="flex items-start mb-3">
                        <div className="mr-3 p-2.5 bg-primary-100 dark:bg-primary-900 rounded-lg tool-icon-container">
                          <tool.icon className="h-6 w-6 text-primary-600 dark:text-primary-400 tool-icon" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-1">
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
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                        {tool.description}
                      </p>
                      
                      {/* Usage indicator */}
                      <div className="mt-auto flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {tool.isPopular ? 'Popular choice' : 'Recently updated'}
                      </div>
                    </Card>
                  </Link>
                ))}
              </Grid>
            ) : (
              // List view
              <div className="space-y-2">
                {visibleTools.map(tool => (
                  <Link
                    key={`list-${tool.id}`}
                    to={tool.route}
                    onClick={() => handleToolClick(tool)}
                    className="no-underline block tool-card"
                  >
                    <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 rounded-lg flex items-center">
                      <div className="mr-4 p-2 bg-primary-100 dark:bg-primary-900 rounded-lg tool-icon-container">
                        <tool.icon className="h-5 w-5 text-primary-600 dark:text-primary-400 tool-icon" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 dark:text-white mr-2 truncate">
                            {tool.title}
                          </h3>
                          <div className="flex-shrink-0 flex space-x-1">
                            {tool.isNew && <Tag variant="success" size="sm">NEW</Tag>}
                            {tool.isBeta && <Tag variant="warning" size="sm">BETA</Tag>}
                            {tool.isPopular && <Tag size="sm">POPULAR</Tag>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {tool.description}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {tool.category}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No tools found</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                No tools found matching your search criteria.
              </p>
              <div className="mt-6">
                <Button 
                  onClick={() => {setSearchTerm(''); setActiveTab('all');}} 
                  variant="primary"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          )}
        </section>
          {/* Categories Navigation */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-5">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => (
              <div 
                key={`cat-${category}`}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveTab(category)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {getToolsByCategory(category as ToolCategory).length} tools
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-700/20 dark:from-primary-900/20 dark:to-gray-900/40 z-0"></div>
          
          <div className="md:flex md:items-center md:justify-between relative z-10">
            <div className="mb-6 md:mb-0 md:pr-12">
              <Badge color="primary" className="mb-2">OPEN SOURCE</Badge>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                Need a custom tool?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-6">
                Can't find what you're looking for? MyDebugger is open source and continually evolving. 
                Suggest new features, report bugs, or contribute directly to our GitHub repository.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/HydrogenB/mydebugger" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  Visit GitHub
                </a>
                <Button 
                  variant="secondary"
                  className="shadow-sm"
                >
                  <svg className="h-5 w-5 mr-2 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Request Feature
                </Button>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 md:flex-shrink-0">
              <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                  <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
                  <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre">
                  <div>$ npm install</div>                    <div>$ npm run dev</div>
                    <div className="text-primary-600 dark:text-primary-400 mt-2">
                      {"> ready in 1.2s"}
                    </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 dark:text-gray-300">Rate this project:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star}
                  className="text-gray-400 hover:text-yellow-500 focus:outline-none transition-colors"
                  aria-label={`Rate ${star} stars`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Newsletter Section */}
        <section className="mb-12 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stay Updated</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Subscribe to our newsletter for updates on new tools and features.
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </section>
      </ResponsiveContainer>
      
      {/* Scroll to top button */}
      <button
        className={`scroll-to-top p-3 bg-primary-600 text-white rounded-full shadow-lg ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </>
  );
};

export default Home;