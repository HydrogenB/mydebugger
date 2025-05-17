import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeContext, ThemeProvider } from '../ThemeProvider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorage.clear();
    
    // Mock localStorage.getItem to return null initially
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  // Simple test component to display theme context values
  const TestComponent = () => {
    const { theme, isDarkMode, setTheme } = React.useContext(ThemeContext)!;
    
    return (
      <div>
        <div data-testid="theme">{theme}</div>
        <div data-testid="isDark">{isDarkMode.toString()}</div>
        
        <button data-testid="toggle-light" onClick={() => setTheme('light')}>
          Set Light
        </button>
        
        <button data-testid="toggle-dark" onClick={() => setTheme('dark')}>
          Set Dark
        </button>
        
        <button data-testid="toggle-system" onClick={() => setTheme('system')}>
          Set System
        </button>
      </div>
    );
  };

  it('provides default values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
  });

  it('allows changing theme to light mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByTestId('toggle-light'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('allows changing theme to dark mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByTestId('toggle-dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('loads theme from localStorage', () => {
    // Setup localStorage to return 'dark'
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => 'dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
  });
});
