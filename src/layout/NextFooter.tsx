import React from 'react';
import Link from 'next/link';
import { getAllCategories } from '../tools';

// Helper function for icons
const getIconHelper = (name: string) => {
  const icons: Record<string, React.ReactNode> = {
    code: <span>💻</span>,
    twitter: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    linkedin: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
    github: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    )
  };
  return icons[name] || <span>📄</span>;
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const categories = getAllCategories();
    // Function to handle LinkedIn navigation
  const handleLinkedInNavigation = () => {
    window.open('https://www.linkedin.com/in/jirads/', '_blank', 'noopener noreferrer');
  };
  
  // Function to handle GitHub navigation
  const handleGitHubNavigation = () => {
    window.open('https://github.com/HydrogenB/mydebugger', '_blank', 'noopener noreferrer');
  };

  return (
    <footer className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-inner transition-colors duration-200 mt-auto pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company info */}
          <div>
            <div className="flex items-center mb-4">
              <span className="mr-2 text-lg">{getIconHelper('code')}</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">MyDebugger</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              A platform for debugging, encoding, decoding & demonstrating your technical work.
            </p>
            <div className="flex space-x-4 mt-4">              <a
                href="https://github.com/HydrogenB/mydebugger"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              >
                {getIconHelper('github')}
              </a>
              <button
                onClick={handleLinkedInNavigation}
                aria-label="LinkedIn"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              >
                {getIconHelper('linkedin')}
              </button>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
              >
                {getIconHelper('twitter')}
              </a>
            </div>
          </div>
          
          {/* Tool Categories */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Categories
            </h2>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category}>
                  <Link
                    href={`/?category=${encodeURIComponent(category)}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Resources
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/HydrogenB/mydebugger/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/HydrogenB/mydebugger/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/HydrogenB/mydebugger/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  Contributing
                </a>
              </li>
              <li>
                <Link
                  href="/components-demo"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  Components
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Developer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">              <button 
                onClick={handleLinkedInNavigation}
                className="text-primary-600 dark:text-primary-400 hover:underline transition"
              >
                Jirad Srirattana-arporn
              </button>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Product Owner (built with GenAI assistance)
            </p>            <a 
              href="https://github.com/HydrogenB/mydebugger"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1 h-4 w-4">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} MyDebugger. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/privacy-policy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
