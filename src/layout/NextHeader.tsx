import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ThemeToggle } from '../design-system/components/inputs';
import { useTheme } from '../design-system/context/ThemeContext';
import { getAllCategories, categories as toolCategories } from '../tools';

// Helper function for icons
const getIconHelper = (name: string) => {
  const icons: Record<string, React.ReactNode> = {
    code: <span>💻</span>,
    tool: <span>🔧</span>,
    close: <span>✖</span>,
    menu: <span>☰</span>,
    search: <span>🔍</span>,
    github: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    )
  };
  return icons[name] || <span>📄</span>;
};

const Header: React.FC = () => {
  const allCategories = getAllCategories(); // Assuming this is still needed for some navigation
  const { isDarkMode, toggleDarkMode } = useTheme(); // Added toggleDarkMode
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if a link is active based on current path
  const isActive = (path: string) => {
    return router.pathname === path || (path !== '/' && router.pathname.startsWith(path));
  };
  
  // Handle category selection (if used in a dropdown or similar)
  const handleCategoryClick = (category: string) => {
    // Example: router.push(`/category/${category.toLowerCase()}`);
    setMobileMenuOpen(false); // Close menu after selection
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 py-3 md:py-2"> {/* Thinner padding */}
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" legacyBehavior>
          <a className="flex items-center space-x-2 text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {getIconHelper('code')} 
            <span>MyDebugger</span>
          </a>
        </Link>

        {/* Desktop Navigation - Simplified for a cleaner look, can be expanded */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/" legacyBehavior><a className={`px-3 py-1 rounded-md text-sm font-medium ${isActive('/') ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>Home</a></Link>
          {/* Add other primary navigation links here if needed */}
          {/* Example: <Link href="/all-tools"><a className={...}>All Tools</a></Link> */}
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <span>☀️</span> : <span>🌙</span>} { /* Simple sun/moon icons */}
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 mr-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <span>☀️</span> : <span>🌙</span>}
          </button>
          <button onClick={toggleMobileMenu} className="text-gray-600 dark:text-gray-300 focus:outline-none">
            {mobileMenuOpen ? getIconHelper('close') : getIconHelper('menu')}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Simplified */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg py-2">
          <nav className="flex flex-col space-y-1 px-4">
            <Link href="/" legacyBehavior><a className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Home</a></Link>
            {/* Add other mobile navigation links here */}
            {/* Example: <Link href="/all-tools"><a className={...}>All Tools</a></Link> */}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
