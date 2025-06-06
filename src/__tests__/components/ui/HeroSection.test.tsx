import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroSection from '@/components/ui/HeroSection';
import '@testing-library/jest-dom';

describe('HeroSection', () => {
  it('renders the hero title', () => {
    render(
      <HeroSection
        searchQuery=""
        onSearchChange={() => {}}
      />
    );
    
    const titleElement = screen.getByText(/MyDebugger/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders the search box with correct placeholder', () => {
    render(
      <HeroSection
        searchQuery=""
        onSearchChange={() => {}}
      />
    );
    
    const searchBox = screen.getByPlaceholderText(/Search tools.../i);
    expect(searchBox).toBeInTheDocument();
  });

  it('calls the onSearchChange handler when typing in the search box', () => {
    const mockOnSearchChange = jest.fn();
    
    render(
      <HeroSection
        searchQuery=""
        onSearchChange={mockOnSearchChange}
      />
    );
    
    const searchBox = screen.getByPlaceholderText(/Search tools.../i);
    searchBox.focus();
    searchBox.value = 'jwt';
    searchBox.dispatchEvent(new Event('input', { bubbles: true }));
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('jwt');
  });
});
