import React from 'react';
import { render, screen } from '../../test-utils/test-utils';
import Footer from '../Footer';
import { getIcon } from '../../design-system/icons';

// Mock the getIcon function
jest.mock('../../design-system/icons', () => ({
  getIcon: jest.fn(() => <span data-testid="mocked-icon" />)
}));

describe('Footer Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock the window.open function
    window.open = jest.fn();
    
    // Set a fixed date for testing
    const mockDate = new Date('2025-01-01');
    global.Date = jest.fn(() => mockDate) as any;
    (global.Date as any).getFullYear = mockDate.getFullYear;
  });

  it('renders the footer with logo and tagline', () => {
    render(<Footer />);
    
    // Check for the MyDebugger title
    expect(screen.getByText('MyDebugger')).toBeInTheDocument();
    
    // Check for the tagline
    expect(
      screen.getByText(/A platform for debugging, encoding, decoding & demonstrating your technical work./)
    ).toBeInTheDocument();
    
    // Check that the logo icon was called
    expect(getIcon).toHaveBeenCalledWith('code');
  });

  it('renders all navigation links correctly', () => {
    render(<Footer />);
    
    // Check internal links
    const homeLink = screen.getByText('Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    
    const toolsLink = screen.getByText('Tools');
    expect(toolsLink).toBeInTheDocument();
    expect(toolsLink.closest('a')).toHaveAttribute('href', '/tools');
    
    const debugLink = screen.getByText('Debug');
    expect(debugLink).toBeInTheDocument();
    expect(debugLink.closest('a')).toHaveAttribute('href', '/debug');
    
    // Check external GitHub link
    const githubLink = screen.getByText('GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/jiradeto/mydebugger');
    expect(githubLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(githubLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    
    // Check that icons were called for each link
    expect(getIcon).toHaveBeenCalledWith('home');
    expect(getIcon).toHaveBeenCalledWith('link');
    expect(getIcon).toHaveBeenCalledWith('tool');
    expect(getIcon).toHaveBeenCalledWith('bug');
  });

  it('renders social media sharing options', () => {
    render(<Footer />);
    
    // Check that we have social media links
    const twitterLink = screen.getByLabelText('Share on Twitter');
    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute('href', expect.stringContaining('twitter.com/intent/tweet'));
    expect(twitterLink).toHaveAttribute('target', '_blank');
    expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    const linkedinLink = screen.getByLabelText('Share on LinkedIn');
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', expect.stringContaining('linkedin.com/sharing'));
    expect(linkedinLink).toHaveAttribute('target', '_blank');
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    const githubRepoLink = screen.getByLabelText('GitHub Repository');
    expect(githubRepoLink).toBeInTheDocument();
    expect(githubRepoLink).toHaveAttribute('href', 'https://github.com/jiradeto/mydebugger');
    expect(githubRepoLink).toHaveAttribute('target', '_blank');
    expect(githubRepoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the copyright notice with correct year', () => {
    render(<Footer />);
    
    // Check for the copyright text with the current year (mocked to 2025)
    expect(screen.getByText('© 2025 MyDebugger. All rights reserved.')).toBeInTheDocument();
  });

  it('renders social icons with correct SVG paths', () => {
    render(<Footer />);
    
    // Check that all social SVG icons are present
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(3); // At least 3 SVG icons (Twitter, LinkedIn, GitHub)
    
    // Test for specific SVG paths - Twitter
    const twitterSvgPath = document.querySelector('a[aria-label="Share on Twitter"] svg path');
    expect(twitterSvgPath).toBeInTheDocument();
    expect(twitterSvgPath).toHaveAttribute('d', expect.stringContaining('23.953 4.57'));
    
    // LinkedIn
    const linkedinSvgPath = document.querySelector('a[aria-label="Share on LinkedIn"] svg path');
    expect(linkedinSvgPath).toBeInTheDocument();
    expect(linkedinSvgPath).toHaveAttribute('d', expect.stringContaining('20.447 20.452'));
    
    // GitHub
    const githubSvgPath = document.querySelector('a[aria-label="GitHub Repository"] svg path');
    expect(githubSvgPath).toBeInTheDocument();
    expect(githubSvgPath).toHaveAttribute('d', expect.stringContaining('M12 0c-6.626'));
  });

  it('renders all Card components correctly', () => {
    render(<Footer />);
    
    // Get all Card elements (used for social media icons)
    const cards = document.querySelectorAll('.transform.hover\\:-translate-y-1');
    expect(cards.length).toBe(3); // Three cards for social media icons
  });

  it('has correct darkmode classes for theming', () => {
    render(<Footer />);
    
    // Check that the footer has dark mode classes
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-white');
    expect(footer).toHaveClass('dark:bg-gray-800');
    expect(footer).toHaveClass('text-gray-700');
    expect(footer).toHaveClass('dark:text-gray-300');
  });

  it('has accessible navigation', () => {
    render(<Footer />);
    
    // Check that section headings are properly labeled
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
    
    // Check that links have accessible names
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      expect(link).toHaveAccessibleName();
    });
  });
});