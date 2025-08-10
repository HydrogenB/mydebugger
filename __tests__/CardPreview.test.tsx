/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardPreview from '../src/view/CardPreview';

// Debug: Log the component import
console.log('CardPreview component:', CardPreview);

describe('CardPreview Component', () => {
  const mockProps = {
    fullName: 'John Doe',
    title: 'Software Engineer',
    organization: 'Acme Inc',
    phone: '+1234567890',
    email: 'john.doe@example.com',
    website: 'https://example.com',
    address: '123 Main St, Anytown, USA',
    download: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with all props', () => {
    console.log('Rendering CardPreview with props:', mockProps);
    const { container } = render(<CardPreview {...mockProps} />);
    console.log('Rendered HTML:', container.innerHTML);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Anytown, USA')).toBeInTheDocument();
  });

  it('displays initials when fullName is provided', () => {
    render(<CardPreview {...mockProps} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('displays default values when optional props are not provided', () => {
    const { container } = render(
      <CardPreview 
        fullName="" 
        title="" 
        organization=""
        phone=""
        email=""
        website=""
        address=""
        download={mockProps.download}
      />
    );
    
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(container.querySelector('h2')?.textContent).toBe('Your Name');
  });

  it('calls download function when Save Contact button is clicked', () => {
    render(<CardPreview {...mockProps} />);
    const button = screen.getByText('Save Contact');
    fireEvent.click(button);
    expect(mockProps.download).toHaveBeenCalledTimes(1);
  });

  it('renders social media links', () => {
    render(<CardPreview {...mockProps} />);
    
    const githubLink = screen.getByLabelText('GitHub');
    const linkedinLink = screen.getByLabelText('LinkedIn');
    const facebookLink = screen.getByLabelText('Facebook');
    
    expect(githubLink).toHaveAttribute('href', 'https://github.com');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com');
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
  });

  it('renders contact action buttons', () => {
    render(<CardPreview {...mockProps} />);
    
    const callLink = screen.getByLabelText('Call');
    const emailLink = screen.getByLabelText('Email');
    const websiteLink = screen.getByLabelText('Website');
    const locationLink = screen.getByLabelText('Location');
    
    expect(callLink).toHaveAttribute('href', 'tel:+1234567890');
    expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
    expect(websiteLink).toHaveAttribute('href', 'https://example.com');
    expect(locationLink).toHaveAttribute(
      'href', 
      'https://maps.google.com/?q=123%20Main%20St%2C%20Anytown%2C%20USA'
    );
  });

  it('displays organization name in header', () => {
    render(<CardPreview {...mockProps} />);
    const header = screen.getByText('Acme Inc');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('bg-black', 'text-white');
  });
});
