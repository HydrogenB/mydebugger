import React from     const { theme, isDarkMode, colorScheme, toggleTheme, setTheme, setColorScheme } = React.useContext(ThemeContext)!;react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeContext, { ThemeProvider, ThemeContextType } from '../ThemeContext';

describe('ThemeContext', () => {
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
    const { theme, isDarkMode, colorScheme, toggleTheme, setTheme, setColorScheme } = React.useContext(ThemeContext)!;
    
    return (
      <div>
        <div data-testid="theme">{theme}</div>
        <div data-testid="isDark">{isDarkMode.toString()}</div>
        <div data-testid="colorScheme">{colorScheme}</div>
        
        <button data-testid="toggle-theme" onClick={toggleTheme}>
          Toggle Theme
        </button>
        
        <button data-testid="set-light" onClick={() => setTheme('light')}>
          Set Light
        </button>
        
        <button data-testid="set-dark" onClick={() => setTheme('dark')}>
          Set Dark
        </button>
        
        <button data-testid="set-system" onClick={() => setTheme('system')}>
          Set System
        </button>
        
        <button data-testid="set-blue" onClick={() => setColorScheme('blue')}>
          Set Blue
        </button>
        
        <button data-testid="set-purple" onClick={() => setColorScheme('purple')}>
          Set Purple
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
    
    // Default theme should be dark based on the mock window.matchMedia
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('purple');
  });

  it('toggleTheme switches between light and dark modes', () => {
    // Mock localStorage for this test
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Initial theme is 'dark' based on our mock
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    
    fireEvent.click(screen.getByTestId('toggle-theme'));
    
    // After toggle, theme should be 'light'
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'light');
    
    fireEvent.click(screen.getByTestId('toggle-theme'));
    
    // After second toggle, theme should be 'dark' again
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
  });

  it('setTheme changes the theme directly', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Initial theme is 'dark' based on our mock
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    
    fireEvent.click(screen.getByTestId('set-light'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'light');
    
    fireEvent.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
    
    fireEvent.click(screen.getByTestId('set-system'));
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    // Since our mock window.matchMedia returns dark preference, isDark should be true
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'system');
  });

  it('setColorScheme changes the color scheme', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Default colorScheme in our provider is 'purple'
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('purple');
    
    fireEvent.click(screen.getByTestId('set-blue'));
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('blue');
    expect(setItemSpy).toHaveBeenCalledWith('colorScheme', 'blue');
    
    fireEvent.click(screen.getByTestId('set-purple'));
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('purple');
    expect(setItemSpy).toHaveBeenCalledWith('colorScheme', 'purple');
  });

  it('restores theme from localStorage', () => {
    // Mock localStorage to return a saved theme
    jest.spyOn(Storage.prototype, 'getItem')
      .mockImplementation((key) => {
        if (key === 'theme') return 'dark';
        if (key === 'colorScheme') return 'blue';
        return null;
      });
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Should restore values from localStorage
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('blue');
  });

  it('handles system theme changes', () => {
    // First mock system theme as dark
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: true, // System prefers dark mode
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    // Set theme to 'system'
    fireEvent.click(screen.getByTestId('set-system'));
    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true'); // System is dark

    // Simulate system theme change to light
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false, // System now prefers light mode
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Trigger a state update by clicking any button
    fireEvent.click(screen.getByTestId('set-system'));
    
    // isDark should now be false since system prefers light mode
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
  });
});