import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

interface ThemeToggleProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

/**
 * ThemeToggle - A button component that toggles between light and dark modes
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { isDark, toggleTheme } = useTheme();
  
  const icon = isDark ? 'sun' : 'moon';
  const label = isDark ? 'Light mode' : 'Dark mode';

  return (
    <Button
      variant="ghost"
      icon={icon}
      size={size}
      onClick={toggleTheme}
      aria-label={label}
      className={className}
    >
      {showLabel ? label : ''}
    </Button>
  );
};

export default ThemeToggle;