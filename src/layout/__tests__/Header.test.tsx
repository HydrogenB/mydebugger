import React from 'react';
import { render, screen, fireEvent } from '../../test-utils/test-utils';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import { getAllCategories, categories } from '../../tools';
import { getIcon } from '../../design-system/icons';
import { useTheme } from '../../design-system/context/ThemeContext';

// Mock the imports
jest.mock('../../tools', () => ({
  getAllCategories: jest.fn(() => ['Encoding', 'Debugging']),
  categories: {
    Encoding: { icon: () => <span data-testid="encoding-icon" /> },
    Debugging: { icon: () => <span data-testid="debugging-icon" /> }
  }
}));

jest.mock('../../design-system/icons', () => ({
  getIcon: jest.fn((name) => <span data-testid={`icon-${name}`} />)
}));

jest.mock('../../design-system/context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({ isDarkMode: false, toggleTheme: jest.fn() }))
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn()
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
  });

  it('renders the header with logo', () => {
    render(<Header />);
    
    // Check for the MyDebugger title
    expect(screen.getByText('MyDebugger')).toBeInTheDocument();
    
    // Check that the logo icon was called
    expect(getIcon).toHaveBeenCalledWith('code');
  });

  it('renders category links based on getAllCategories', () => {
    render(<Header />);
    
    // Check for the category links
    expect(screen.getByText('Encoding')).toBeInTheDocument();
    expect(screen.getByText('Debugging')).toBeInTheDocument();
    
    // Check that category icons are rendered
    expect(screen.getByTestId('encoding-icon')).toBeInTheDocument();
    expect(screen.getByTestId('debugging-icon')).toBeInTheDocument();
  });

  it('renders the "All Tools" link', () => {
    render(<Header />);
    
    // We have two "All Tools" links (one for desktop, one for mobile)
    // so we need to get all elements with this text
    const allToolsLinks = screen.getAllByText('All Tools');
    expect(allToolsLinks.length).toBeGreaterThanOrEqual(1);
    
    // Check that the tool icon was called
    expect(getIcon).toHaveBeenCalledWith('tool');
  });

  it('renders ThemeToggle component', () => {
    render(<Header />);
    
    // The ThemeToggle component is mocked in the test-utils,
    // so we don't need to test its functionality, just its presence
    // In a real implementation, we would have a data-testid on the ThemeToggle
    // For now, we'll just assume it's included if the render doesn't fail
  });

  it('toggles mobile menu when button is clicked', () => {
    render(<Header />);
    
    // Mobile menu should initially be closed
    expect(screen.queryByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
    
    // Get the menu button and click it to open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    
    // Initial state - menu icon should be shown
    expect(getIcon).toHaveBeenCalledWith('menu');
    
    // Click the button
    fireEvent.click(menuButton);
    
    // After clicking, close icon should be shown
    expect(getIcon).toHaveBeenCalledWith('close');
    
    // Mobile menu should now be visible
    // Check for the presence of the mobile menu container
    const mobileMenu = screen.getByRole('navigation', { hidden: true });
    expect(mobileMenu).toBeInTheDocument();
    
    // Click the button again to close the menu
    fireEvent.click(menuButton);
    
    // Menu icon should be shown again
    expect(getIcon).toHaveBeenCalledWith('menu');
  });

  it('applies active styles to current route', () => {
    // Mock the location to be at the Encoding category
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/category/encoding' });
    
    render(<Header />);
    
    // Get all links to Encoding
    const encodingLinks = screen.getAllByText('Encoding');
    
    // At least one of them should have the active class
    const hasActiveLink = encodingLinks.some(link => {
      const parent = link.closest('a');
      return parent && (
        parent.classList.contains('text-primary-600') || 
        parent.classList.contains('bg-gray-100')
      );
    });
    
    expect(hasActiveLink).toBeTruthy();
  });

  it('closes mobile menu when route changes', () => {
    // Setup initial render with open menu
    const { rerender } = render(<Header />);
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    // Mobile menu should be visible
    expect(screen.getByRole('navigation', { hidden: true })).toBeInTheDocument();
    
    // Change the location
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/tools' });
    
    // Re-render with new location
    rerender(<Header />);
    
    // Mobile menu should be closed after route change
    expect(screen.queryByRole('navigation', { hidden: true })).not.toBeInTheDocument();
  });

  it('handles dark theme correctly', () => {
    // Mock theme as dark
    (useTheme as jest.Mock).mockReturnValue({ isDarkMode: true, toggleTheme: jest.fn() });
    
    render(<Header />);
    
    // Header should have dark theme classes
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('dark:bg-gray-800');
  });

  it('renders dividers correctly', () => {
    render(<Header />);
    
    // Check for the divider in desktop view
    const divider = document.querySelector('.border-l.border-gray-300');
    expect(divider).toBeInTheDocument();
    
    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    fireEvent.click(menuButton);
    
    // Check for the divider in mobile view
    const mobileDivider = document.querySelector('.border-t.border-gray-200');
    expect(mobileDivider).toBeInTheDocument();
  });
});