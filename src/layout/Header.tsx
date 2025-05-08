import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllCategories, categories } from '../tools';
// Import components from design system instead of legacy components
import { ThemeToggle } from '../design-system/components/inputs';
import { useTheme } from '../design-system/context/ThemeContext';
import { getIcon } from '../design-system/icons';

const Header: React.FC = () => {
  const allCategories = getAllCategories();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if a link is active based on current path
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md transition-colors duration-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-xl hover:text-primary-700 dark:hover:text-primary-300 transition">
            <span className="text-2xl">{getIcon('code')}</span>
            <span>MyDebugger</span>
          </Link>
          
          <div className="hidden md:flex md:items-center space-x-6">
            {allCategories.map((category) => {
              const CategoryIcon = categories[category].icon;
              const categoryPath = `/category/${category.toLowerCase()}`;
              const activeClass = isActive(categoryPath) 
                ? "text-primary-600 dark:text-primary-400" 
                : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400";
              
              return (
                <Link 
                  key={category}
                  to={categoryPath}
                  className={`flex items-center space-x-1 ${activeClass} transition`}
                  aria-current={isActive(categoryPath) ? 'page' : undefined}
                >
                  <CategoryIcon className="w-4 h-4" />
                  <span>{category}</span>
                </Link>
              );
            })}
            <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
            <Link 
              to="/tools"
              className={`flex items-center space-x-1 ${
                isActive('/tools') 
                  ? "text-primary-600 dark:text-primary-400" 
                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              } transition`}
            >
              <span className="w-4 h-4">{getIcon('tool')}</span>
              <span>All Tools</span>
            </Link>
            <ThemeToggle />
          </div>
          
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <span>{getIcon('close')}</span>
              ) : (
                <span>{getIcon('menu')}</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {allCategories.map((category) => {
                const CategoryIcon = categories[category].icon;
                const categoryPath = `/category/${category.toLowerCase()}`;
                const activeClass = isActive(categoryPath) 
                  ? "bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                
                return (
                  <Link 
                    key={category}
                    to={categoryPath}
                    className={`flex items-center space-x-2 px-2 py-2 rounded-md ${activeClass} transition`}
                    aria-current={isActive(categoryPath) ? 'page' : undefined}
                  >
                    <CategoryIcon className="w-5 h-5" />
                    <span>{category}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <Link 
                to="/tools"
                className={`flex items-center space-x-2 px-2 py-2 rounded-md ${
                  isActive('/tools') 
                    ? "bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } transition`}
              >
                <span className="w-5 h-5">{getIcon('tool')}</span>
                <span>All Tools</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;