import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../design-system/components/inputs';
import LanguageToggle from '../components/LanguageToggle';
import { useTranslation } from '../context/TranslationContext';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
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
    <header className="bg-white/70 dark:bg-gray-900/60 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md shadow-sm border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-lg hover:text-primary-700 dark:hover:text-primary-300 transition">
              <span className="text-xl">{getIconHelper('code')}</span>
              <span className="heading-gradient">MyDebugger</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main Navigation">
            <Link 
              to="/"
              className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                isActive('/') && !location.search.includes('category=')
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              } transition`}
              aria-current={isActive('/') && !location.search.includes('category=') ? 'page' : undefined}
              data-analytics-event="nav_all_tools"
              data-analytics-label="Header All Tools"
            >
              <span className="w-4 h-4">{getIconHelper('tool')}</span>
              <span>{t('header.nav.allTools', 'All Tools')}</span>
            </Link>
            
              <a
              href="https://github.com/HydrogenB/mydebugger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition"
              aria-label={t('header.nav.github', 'GitHub')}
              data-analytics-event="cta_github"
              data-analytics-label="Header GitHub"
            >
              <span className="sr-only">{t('header.nav.github', 'GitHub')}</span>
              <span className="w-5 h-5 block">{getIconHelper('github')}</span>
            </a>
            
            <LanguageToggle />
            <ThemeToggle />
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <LanguageToggle />
            <ThemeToggle />
            <button 
              onClick={toggleMobileMenu}
              className="ml-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
              aria-label={t('header.menu.toggleMobileMenu', 'Toggle mobile menu')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{mobileMenuOpen ? t('header.menu.close', 'Close menu') : t('header.menu.open', 'Open menu')}</span>
              {mobileMenuOpen ? (
                <span aria-hidden="true">{getIconHelper('close')}</span>
              ) : (
                <span aria-hidden="true">{getIconHelper('menu')}</span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
          <nav className="px-4 space-y-2" aria-label="Mobile Navigation">
            <Link 
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                isActive('/') && !location.search.includes('category=')
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              } transition w-full`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive('/') && !location.search.includes('category=') ? 'page' : undefined}
            >
              <span className="w-5 h-5">{getIconHelper('tool')}</span>
              <span>{t('header.nav.allTools', 'All Tools')}</span>
            </Link>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              <a
              href="https://github.com/HydrogenB/mydebugger"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="w-5 h-5">{getIconHelper('github')}</span>
              <span>{t('header.nav.github', 'GitHub')}</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;