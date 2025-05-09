import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAllCategories, categories } from '../tools';
// Import components from design system instead of legacy components
import { ThemeToggle } from '../design-system/components/inputs';
import { useTheme } from '../design-system/context/ThemeContext';
import { getIcon } from '../design-system/icons';
import { useAuth } from '../features/auth/AuthContext';
import GoogleLoginButton from '../features/auth/GoogleLoginButton';
import UserProfile from '../features/auth/UserProfile';

const Header: React.FC = () => {
  const allCategories = getAllCategories();
  const { isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
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
  
  // Handle category selection
  const handleCategoryClick = (category: string) => {
    navigate(`/?category=${encodeURIComponent(category)}`);
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-lg hover:text-primary-700 dark:hover:text-primary-300 transition">
            <span className="text-xl">{getIcon('code')}</span>
            <span>MyDebugger</span>
          </Link>
          
          <div className="hidden md:flex md:items-center space-x-6">
            {allCategories.map((category) => {
              const CategoryIcon = categories[category].icon;
              // Fix the category path to use the category name for proper filtering
              const activeClass = location.search.includes(`category=${encodeURIComponent(category)}`)
                ? "text-primary-600 dark:text-primary-400" 
                : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400";
              
              return (
                <button 
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`flex items-center space-x-1 ${activeClass} transition focus:outline-none`}
                  aria-current={location.search.includes(`category=${encodeURIComponent(category)}`) ? 'page' : undefined}
                >
                  <CategoryIcon className="w-4 h-4" />
                  <span>{category}</span>
                </button>
              );
            })}
            <div className="h-5 border-l border-gray-300 dark:border-gray-600"></div>
            <Link 
              to="/"
              className={`flex items-center space-x-1 ${
                isActive('/') 
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
              className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
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
          
          {/* User Authentication */}
          <div className="flex items-center">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center focus:outline-none"
                >
                  <span className="sr-only">Open user menu</span>
                  {/* User avatar or icon */}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                    <UserProfile />
                  </div>
                )}
              </div>
            ) : (
              <GoogleLoginButton />
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {allCategories.map((category) => {
                const CategoryIcon = categories[category].icon;
                const activeClass = location.search.includes(`category=${encodeURIComponent(category)}`)
                  ? "bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
                
                return (
                  <button 
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`flex items-center space-x-2 px-2 py-2 rounded-md ${activeClass} transition w-full text-left`}
                    aria-current={location.search.includes(`category=${encodeURIComponent(category)}`) ? 'page' : undefined}
                  >
                    <CategoryIcon className="w-5 h-5" />
                    <span>{category}</span>
                  </button>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <Link 
                to="/"
                className={`flex items-center space-x-2 px-2 py-2 rounded-md ${
                  isActive('/') 
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