import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

interface ThemeToggleProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  variant?: 'icon' | 'switch' | 'button';
}

/**
 * ThemeToggle - A button component that toggles between light and dark modes
 * 
 * @param className - Additional CSS classes
 * @param size - Size of the toggle button
 * @param showLabel - Whether to show the text label
 * @param variant - Visual style: 'icon' (default), 'switch', or 'button'
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
  variant = 'icon',
}) => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const icon = isDarkMode ? 'sun' : 'moon';
  const label = isDarkMode ? 'Light mode' : 'Dark mode';

  // Switch-style theme toggle
  if (variant === 'switch') {
    const switchClasses = `
      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      ${isDarkMode ? 'bg-primary-600' : 'bg-gray-200'}
      ${className}
    `;
    
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDarkMode}
        onClick={toggleTheme}
        className={switchClasses}
        aria-label={label}
      >
        <span 
          className={`
            ${isDarkMode ? 'translate-x-6' : 'translate-x-1'} 
            inline-block h-4 w-4 transform rounded-full bg-white transition
            flex items-center justify-center overflow-hidden
          `}
        >
          {isDarkMode ? (
            <span className="text-yellow-500 scale-75">●</span>
          ) : (
            <span className="text-gray-400 scale-75">○</span>
          )}
        </span>
        {showLabel && (
          <span className="ml-3 text-sm">{label}</span>
        )}
      </button>
    );
  }
  
  // Button-style theme toggle
  if (variant === 'button') {
    return (
      <Button
        variant={isDarkMode ? 'outline-primary' : 'ghost'}
        size={size}
        onClick={toggleTheme}
        aria-label={label}
        className={`${className} transition-all`}
      >
        <div className="flex items-center gap-2">
          {isDarkMode ? (
            <span className="text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
              </svg>
            </span>
          ) : (
            <span className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </span>
          )}
          {showLabel && label}
        </div>
      </Button>
    );
  }

  // Default icon-style theme toggle
  return (
    <Button
      variant="ghost"
      icon={icon}
      size={size}
      onClick={toggleTheme}
      aria-label={label}
      className={`${className} ${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-700 hover:text-gray-900'}`}
    >
      {showLabel ? label : ''}
    </Button>
  );
};

export default ThemeToggle;