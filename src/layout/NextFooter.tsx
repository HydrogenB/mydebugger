import React from 'react';
import Link from 'next/link';
import { getAllCategories, getPopularTools } from '../tools';

// Modern Footer Icons
const FooterIcons = {
  logo: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  linkedin: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  mail: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  code: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  tool: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const popularTools = getPopularTools().slice(0, 3); // Get top 3 popular tools

  // Social links with SEO-friendly approach
  const socialLinks = {
    linkedin: 'https://www.linkedin.com/in/jirads/',
    github: 'https://github.com/HydrogenB/mydebugger',
    requestTool: 'https://github.com/HydrogenB/mydebugger/issues/new?assignees=&labels=enhancement,new-tool&template=feature_request.md&title=Tool+Request%3A+'
  };

  return (
    <footer className="bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-700 dark:text-gray-300 pt-10 pb-6 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1 - About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
                <div className="text-white">{FooterIcons.logo}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">MyDebugger</h3>
            </div>
            <p className="text-sm leading-relaxed">
              Your comprehensive toolkit for developers. Built with precision and passion for solving technical challenges.
            </p>
            <div className="pt-2 flex space-x-3">
              <a 
                href={socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                aria-label="LinkedIn Profile"
              >
                {FooterIcons.linkedin}
              </a>
              <a 
                href={socialLinks.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                aria-label="GitHub Repository"
              >
                {FooterIcons.github}
              </a>
              <a 
                href="mailto:contact@mydebugger.dev" 
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                aria-label="Contact Email"
              >
                {FooterIcons.mail}
              </a>
            </div>
          </div>

          {/* Column 2 - Popular Tools */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Tools</h3>
            <ul className="space-y-3">
              {popularTools.map(tool => (
                <li key={tool.id}>
                  <Link href={tool.route} legacyBehavior>
                    <a className="flex items-center group">
                      <div className="p-1.5 mr-3 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors duration-200">
                        <tool.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                      </div>
                      <span className="text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">{tool.title}</span>
                    </a>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/" legacyBehavior>
                  <a className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200">
                    <span>View all tools</span>
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms-of-service" legacyBehavior>
                  <a className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">Terms of Service</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" legacyBehavior>
                  <a className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <a 
                  href={socialLinks.github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a 
                  href={socialLinks.requestTool} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                >
                  Request a Tool
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter/Request Tool */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request a Tool</h3>
            <p className="text-sm mb-4">Need a specific tool? Let us know and we'll build it.</p>
            <a 
              href={socialLinks.requestTool}
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="mr-2">{FooterIcons.tool}</span>
              Request New Tool
            </a>
          </div>
        </div>

        {/* Bottom Area with Credits */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-2">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>&copy; {currentYear} MyDebugger. All rights reserved. Built with ❤️ by Jirad S.</p>
            </div>
            <div className="flex items-center space-x-2">
              <a 
                href={socialLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-200 flex items-center"
                aria-label="Jirad S. LinkedIn Profile"
              >
                {FooterIcons.linkedin}
                <span className="ml-1.5">LinkedIn</span>
              </a>
              <span className="text-gray-400 dark:text-gray-600">|</span>
              <a 
                href={socialLinks.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors duration-200 flex items-center"
                aria-label="MyDebugger GitHub Repository"
              >
                {FooterIcons.github}
                <span className="ml-1.5">GitHub</span>
              </a>
               <span className="text-gray-400 dark:text-gray-600">|</span>
              <a 
                href={socialLinks.requestTool} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-200 flex items-center"
                aria-label="Request a new tool on GitHub"
              >
                {FooterIcons.tool} 
                <span className="ml-1.5">Request a Tool</span>
              </a>
            </div>
          </div>
          <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-500">
            <p>Optimized for search engines and built with modern web technologies.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
