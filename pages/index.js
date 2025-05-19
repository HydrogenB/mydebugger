import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { getTools, getAllCategories, getToolsByCategory, getPopularTools, getNewTools, categories as toolCategories } from '../src/tools';
import ToolCard from '../src/components/landing/ToolCard';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion'; // Assuming framer-motion is installed

// Helper to get a consistent icon for a category
const getCategoryIcon = (categoryName) => {
  const categoryDetails = toolCategories[categoryName];
  return categoryDetails ? categoryDetails.icon : null;
};

export default function HomePage() {
  const router = useRouter();
  const { category: urlCategory } = router.query;
  
  const allTools = getTools();
  const allCategories = getAllCategories();
  const popularTools = getPopularTools();
  const newTools = getNewTools();
  
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');
  const [filteredTools, setFilteredTools] = useState(allTools);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  // State for animations and UI interactions
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [visibleToolsCount, setVisibleToolsCount] = useState(9); // For "Load More" functionality
  const [activeSortOption, setActiveSortOption] = useState('popular');
  
  // Refs for UI elements
  const heroRef = useRef(null);
  const observerRef = useRef(null);
  const categoryListRef = useRef(null);
  const searchInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);
    // Effect to sync activeCategory with URL
  useEffect(() => {
    if (urlCategory && urlCategory !== activeCategory) {
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);
  
  // Handle click outside category dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and sort tools based on search term, active category and sort option
  const sortedAndFilteredTools = useMemo(() => {
    // First filter by category
    let result = allTools;
    if (activeCategory !== 'all') {
      result = getToolsByCategory(activeCategory);
    }
    
    // Then filter by search term
    if (searchTerm.trim() !== '') {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter((tool) => 
        tool.title.toLowerCase().includes(lowerCaseSearch) || 
        tool.description.toLowerCase().includes(lowerCaseSearch) ||
        (tool.metadata?.keywords && tool.metadata.keywords.some(keyword => 
          keyword.toLowerCase().includes(lowerCaseSearch)
        ))
      );
    }
    
    // Finally sort based on selected option
    return [...result].sort((a, b) => {
      if (activeSortOption === 'popular') {
        // Sort by popularity: popular items first
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      }
      if (activeSortOption === 'newest') {
        // Sort by newness: new items first
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      }
      if (activeSortOption === 'alphabetical') {
        // Sort alphabetically by title
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [searchTerm, activeCategory, allTools, activeSortOption]);
  
  // Update filtered tools when sortedAndFilteredTools changes
  useEffect(() => {
    setFilteredTools(sortedAndFilteredTools);
  }, [sortedAndFilteredTools]);
    // Scroll detection for UI effects
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    
    // Initialize intersection observer for animation
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    
    // Observe elements for animation
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
      observerRef.current.observe(card);
    });
    
    // Observe other sections
    const animatedSections = document.querySelectorAll('.animated-section');
    animatedSections.forEach(section => {
      observerRef.current.observe(section);
    });
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [filteredTools]);
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Handle "Load More" functionality
  const loadMoreTools = () => {
    setVisibleToolsCount(prevCount => Math.min(prevCount + 9, filteredTools.length));
  };
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setVisibleToolsCount(9); // Reset visible count when changing categories
    router.push({
      pathname: '/',
      query: category !== 'all' ? { category } : {}
    }, undefined, { shallow: true });
  };
  
  // Handle sort option change
  const handleSortChange = (option) => {
    setActiveSortOption(option);
  };
  
  // Calculate stats for hero section
  const totalTools = allTools.length;
  const categoriesCount = allCategories.length;
  
  // Get displayed tools (limited by visibleToolsCount)
  const displayedTools = useMemo(() => {
    return filteredTools.slice(0, visibleToolsCount);
  }, [filteredTools, visibleToolsCount]);

  return (
    <>
      <Head>
        <title>MyDebugger - Ultimate Debugging & Developer Toolkit</title>
        <meta
          name="description"
          content="Explore a comprehensive suite of debugging and developer tools. Base64, encoders, decoders, formatters, JWT toolkit, security testing, and more. Your ultimate development companion."
        />
        <meta name="keywords" content="developer tools, debugging, encoder, decoder, formatter, base64, json, jwt, security, testing, online tools, web development, mobile development, deeplink" />
        <meta property="og:title" content="MyDebugger - Ultimate Debugging & Developer Toolkit" />
        <meta property="og:description" content="Showcasing a wide array of powerful tools for developers. Your go-to platform for technical solutions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mydebugger.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MyDebugger - Ultimate Developer Toolkit" />
        <meta name="twitter:description" content="Powerful debugging and development tools at your fingertips." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="canonical" href="https://mydebugger.vercel.app/" />
      </Head>
      
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800" ref={heroRef}>
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6 animate-fade-in">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
                Ultimate Developer & Debugging Toolkit
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 animate-fade-in animation-delay-100">
              Powerful, reliable, and easy-to-use tools designed to streamline your workflow. <br className="hidden md:block" />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                If you can think it, <span className="font-bold">WE CAN DO IT.</span>
              </span>
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12 animate-fade-in animation-delay-200">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'ring-2 ring-indigo-500 scale-105' : ''}`}>
                <input
                  type="text"
                  ref={searchInputRef}
                  placeholder="Search tools, functions, features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full py-3 px-5 pr-12 rounded-full border-2 border-indigo-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-300 dark:focus:border-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                  aria-label="Search tools"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Tool Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-6 animate-fade-in animation-delay-300">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">{allTools.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tools</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="font-bold text-2xl text-green-600 dark:text-green-400">{allCategories.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="font-bold text-2xl text-blue-600 dark:text-blue-400">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Free to Use</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                <div className="font-bold text-2xl text-purple-600 dark:text-purple-400">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories Filter */}
      <div className="bg-white dark:bg-gray-800 sticky top-16 z-20 py-2 shadow-md">
        <div className="container mx-auto px-4">
          <div 
            className="flex overflow-x-auto py-2 no-scrollbar" 
            ref={categoryListRef}
          >
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 mx-1 rounded-full transition-colors ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Tools
            </button>
            
            {allCategories.map((category) => {
              const CategoryIcon = getCategoryIcon(category);
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex-shrink-0 flex items-center px-4 py-2 mx-1 rounded-full transition-colors ${
                    activeCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {CategoryIcon && <CategoryIcon className="w-4 h-4 mr-2" />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Featured Tools Section */}
        {activeCategory === 'all' && !searchTerm && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="mr-2">⭐</span> 
              <span>Featured Tools</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTools.slice(0, 3).map((tool) => (
                <ToolCard key={tool.id || tool.title} tool={tool} featured={true} />
              ))}
            </div>
          </section>
        )}

        {/* All Tools or Filtered Results */}
        <section className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
              {searchTerm ? 'Search Results' : activeCategory !== 'all' ? `${activeCategory} Tools` : 'All Tools'}
            </h2>
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} found
            </div>
          </div>
          
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 tool-cards-container">
              {filteredTools.map((tool) => (
                <div key={tool.id || tool.title} className="tool-card opacity-0 transition-all duration-500">
                  <ToolCard tool={tool} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-300 mb-2">No tools found</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Try a different search term or category</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
        
        {/* Call to Action Section */}
        <section className="my-16 py-12 px-6 md:px-12 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-800 dark:to-blue-900 rounded-2xl text-white text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need a Custom Tool?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Request a new tool or feature through our GitHub repository.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/HydrogenB/mydebugger/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-md hover:bg-indigo-50 transition-colors shadow-md"
            >
              Request a Tool
            </a>
            <Link href="/contact" legacyBehavior>
              <a className="px-6 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors">
                Contact Us
              </a>
            </Link>
          </div>
        </section>
      </div>
      
      {/* Scroll to top button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
        </button>
      )}
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animation-delay-100 {
          animation-delay: 0.1s;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .bg-grid-pattern {
          background-image: 
            radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 25px 25px;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
