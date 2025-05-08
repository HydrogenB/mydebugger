import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false, // Default to light mode
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component that consumes the theme context
const TestComponent = () => {
  const { theme, isDark, colorScheme, toggleTheme, setTheme, setColorScheme } = useTheme();
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="isDark">{isDark.toString()}</div>
      <div data-testid="colorScheme">{colorScheme}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>Toggle Theme</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Set Light</button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Set Dark</button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>Set System</button>
      <button data-testid="set-blue" onClick={() => setColorScheme('blue')}>Set Blue</button>
      <button data-testid="set-purple" onClick={() => setColorScheme('purple')}>Set Purple</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.removeAttribute('data-color-scheme');
  });

  test('uses default theme and color scheme when no localStorage values exist', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('blue');
  });

  test('loads theme from localStorage when available', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'ui-theme-mode') return 'dark';
      if (key === 'ui-theme-color') return 'purple';
      return null;
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('purple');
  });

  test('toggleTheme switches between light and dark modes', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');

    fireEvent.click(screen.getByTestId('toggle-theme'));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ui-theme-mode', 'dark');

    fireEvent.click(screen.getByTestId('toggle-theme'));

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ui-theme-mode', 'light');
  });

  test('setTheme changes the theme and updates DOM', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);

    fireEvent.click(screen.getByTestId('set-light'));
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  test('setColorScheme changes the color scheme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('colorScheme')).toHaveTextContent('blue');

    fireEvent.click(screen.getByTestId('set-purple'));
    expect(screen.getByTestId('colorScheme')).toHaveTextContent('purple');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ui-theme-color', 'purple');
    expect(document.documentElement.getAttribute('data-color-scheme')).toBe('purple');
  });

  test('handles system theme changes', () => {
    // Mock matchMedia to simulate system theme preference
    const mockMediaQueryList = {
      matches: true, // Start with dark mode
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };

    window.matchMedia = jest.fn().mockImplementation(() => mockMediaQueryList);

    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('isDark')).toHaveTextContent('true');

    // Simulate system theme change
    act(() => {
      mockMediaQueryList.matches = false; // Switch to light mode
      mockMediaQueryList.addEventListener.mock.calls[0][1](); // Call the event listener
    });

    expect(screen.getByTestId('isDark')).toHaveTextContent('false');
  });

  test('useTheme throws error when used outside ThemeProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleError.mockRestore();
  });
});