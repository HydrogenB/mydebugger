import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ThemeToggle } from '../design-system/components/inputs';
import { useTheme } from '../design-system/context/ThemeContext';
import { getAllCategories, categories as toolCategories, getToolsByCategory } from '../tools';

// Enhanced icons with modern SVG components
const HeaderIcons = {
  logo: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  sun: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  menu: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  tools: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
};

const Header: React.FC = () => {
  const allCategories = getAllCategories();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const router = useRouter();
  
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  
  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoryMenuOpen(false);
  }, [router.pathname]);
  
  // Close category menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryMenuRef.current && 
        categoryButtonRef.current && 
        !categoryMenuRef.current.contains(event.target as Node) &&
        !categoryButtonRef.current.contains(event.target as Node)
      ) {
        setCategoryMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setCategoryMenuOpen(false);
  };
  
  const toggleCategoryMenu = () => {
    setCategoryMenuOpen(!categoryMenuOpen);
  };

  // Check if a link is active based on current path
  const isActive = (path: string) => {
    return router.pathname === path || (path !== '/' && router.pathname.startsWith(path));
  };
  
  // Handle category selection
  const handleCategoryClick = (category: string) => {
    router.push({
      pathname: '/',
      query: { category: category.toLowerCase() }
    });
    setCategoryMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 h-14">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        {/* Logo with animated gradient effect on hover */}
        <Link href="/" legacyBehavior>
          <a className="group flex items-center space-x-2 text-lg font-bold text-gray-900 dark:text-white">
            <div className="relative overflow-hidden rounded-lg p-1.5 transition-colors duration-300 
                           bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:from-indigo-600 group-hover:to-blue-600">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-white">{HeaderIcons.logo}</div>
            </div>
            <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-blue-500 transition-all duration-300">
              MyDebugger
            </span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" legacyBehavior>
            <a className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
              isActive('/') 
                ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-gray-800' 
                : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}>
              Home
            </a>
          </Link>
          
          {/* Tools Dropdown */}
          <div className="relative">
            <button
              ref={categoryButtonRef}
              onClick={toggleCategoryMenu}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                categoryMenuOpen
                  ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-gray-800'
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              aria-expanded={categoryMenuOpen}
              aria-haspopup="true"
            >
              <span className="mr-1.5">{HeaderIcons.tools}</span>
              <span>Tools</span>
              <svg className={`ml-1.5 w-4 h-4 transition-transform duration-200 ${categoryMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Category Dropdown Menu */}
            {categoryMenuOpen && (
              <div
                ref={categoryMenuRef}
                className="absolute right-0 mt-1 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none py-1"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  Categories
                </div>
                <button
                  onClick={() => handleCategoryClick('all')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  role="menuitem"
                >
                  All Tools
                </button>
                {allCategories.map((category) => {
                  const CategoryIcon = toolCategories[category].icon;
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category)}
                      className="w-full text-left px-4 py-2 flex items-center text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                      role="menuitem"
                    >
                      <CategoryIcon className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                      {category}
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {getToolsByCategory(category).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* GitHub Link */}
          <a 
            href="https://github.com/HydrogenB/mydebugger"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center"
            aria-label="GitHub Repository"
          >
            <span className="mr-1.5">{HeaderIcons.github}</span>
            <span>GitHub</span>
          </a>
            {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? HeaderIcons.sun : HeaderIcons.moon}
          </button>
        </nav>        {/* Mobile Menu Controls */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleTheme} 
            className="p-2 mr-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? HeaderIcons.sun : HeaderIcons.moon}
          </button>
          <button 
            onClick={toggleMobileMenu} 
            className="p-2 ml-1 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? HeaderIcons.close : HeaderIcons.menu}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" legacyBehavior>
              <a className={`block px-3 py-2 rounded-md font-medium ${
                isActive('/') 
                  ? 'bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}>
                Home
              </a>
            </Link>
            
            <a 
              href="https://github.com/HydrogenB/mydebugger"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <span className="mr-2">{HeaderIcons.github}</span>
              GitHub Repository
            </a>
            
            <div className="pt-2 pb-1">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Tool Categories
              </div>
            </div>
            
            <button
              onClick={() => handleCategoryClick('all')}
              className="w-full text-left block px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              All Tools
            </button>
            
            {allCategories.map((category) => {
              const CategoryIcon = toolCategories[category].icon;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full text-left flex items-center px-3 py-2 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <CategoryIcon className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                  {category}
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {getToolsByCategory(category).length}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
