import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock the Button component to simplify testing
jest.mock('../Button', () => ({
  Button: ({ children, onClick, icon, 'aria-label': ariaLabel, className, size }) => (
    <button 
      onClick={onClick} 
      data-testid="theme-toggle-button" 
      data-icon={icon}
      aria-label={ariaLabel}
      className={className}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

describe('ThemeToggle', () => {
  it('renders with default props in light mode', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-toggle-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-icon', 'moon');
    expect(button).toHaveAttribute('aria-label', 'Dark mode');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveTextContent('');
  });

  it('renders with default props in dark mode', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-toggle-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-icon', 'sun');
    expect(button).toHaveAttribute('aria-label', 'Light mode');
  });

  it('renders with custom size', () => {
    render(
      <ThemeProvider>
        <ThemeToggle size="xs" />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-toggle-button');
    expect(button).toHaveAttribute('data-size', 'xs');
  });

  it('displays label when showLabel is true', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle showLabel />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-toggle-button');
    expect(button).toHaveTextContent('Dark mode');
  });

  it('applies custom className', () => {
    render(
      <ThemeProvider>
        <ThemeToggle className="custom-class" />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-toggle-button');
    expect(button).toHaveAttribute('class', 'custom-class');
  });

  it('toggles theme when clicked', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByTestId('theme-toggle-button');
    expect(button).toHaveAttribute('data-icon', 'moon');
    
    // Click to toggle theme
    fireEvent.click(button);
    
    // Should now be in dark mode
    expect(button).toHaveAttribute('data-icon', 'sun');
    expect(button).toHaveAttribute('aria-label', 'Light mode');
    
    // Click to toggle back to light mode
    fireEvent.click(button);
    
    // Should now be back in light mode
    expect(button).toHaveAttribute('data-icon', 'moon');
    expect(button).toHaveAttribute('aria-label', 'Dark mode');
  });
});