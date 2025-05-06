import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories, categories } from '../tools';
import ThemeToggle from '../tools/components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const allCategories = getAllCategories();
  const { /* isDarkMode removed */ } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-xl hover:text-primary-700 dark:hover:text-primary-300 transition">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>MyDebugger</span>
          </Link>
          
          <div className="hidden md:flex md:items-center space-x-6">
            {allCategories.map((category) => {
              const CategoryIcon = categories[category].icon;
              return (
                <Link 
                  key={category}
                  to={`/category/${category.toLowerCase()}`}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  <CategoryIcon className="w-4 h-4" />
                  <span>{category}</span>
                </Link>
              );
            })}
            <ThemeToggle />
          </div>
          
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
                return (
                  <Link 
                    key={category}
                    to={`/category/${category.toLowerCase()}`}
                    className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CategoryIcon className="w-5 h-5" />
                    <span>{category}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;