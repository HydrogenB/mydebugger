import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../Card';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(
      <Card>
        <div data-testid="content">Card Content</div>
      </Card>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toHaveTextContent('Card Content');
    
    // Default class values
    const cardElement = screen.getByTestId('content').parentElement?.parentElement;
    expect(cardElement).toHaveClass('bg-white');
    expect(cardElement).toHaveClass('border');
    expect(cardElement).toHaveClass('shadow-sm');
  });

  it('renders with title and subtitle', () => {
    render(
      <Card title="Test Title" subtitle="Test Subtitle">
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('renders with actions', () => {
    const actionButton = <button data-testid="action-button">Action</button>;
    
    render(
      <Card 
        title="Test Title" 
        actions={actionButton}
      >
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.getByTestId('action-button')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(
      <Card 
        footer={<span data-testid="footer-content">Footer Content</span>}
      >
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer-content')).toHaveTextContent('Footer Content');
  });

  it('renders image when provided', () => {
    render(
      <Card 
        image={{ src: '/test-image.jpg', alt: 'Test Image' }}
      >
        <div>Card Content</div>
      </Card>
    );
    
    const imageElement = screen.getByAltText('Test Image');
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', '/test-image.jpg');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    
    render(
      <Card onClick={handleClick}>
        <div>Card Content</div>
      </Card>
    );
    
    const cardElement = screen.getByText('Card Content').parentElement?.parentElement;
    expect(cardElement).toHaveAttribute('role', 'button');
    
    fireEvent.click(cardElement as HTMLElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as an anchor when href is provided', () => {
    render(
      <Card href="https://example.com">
        <div>Card Content</div>
      </Card>
    );
    
    const anchorElement = screen.getByText('Card Content').parentElement?.parentElement;
    expect(anchorElement?.tagName.toLowerCase()).toBe('a');
    expect(anchorElement).toHaveAttribute('href', 'https://example.com');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Card variant="primary" data-testid="card">
        <div>Card Content</div>
      </Card>
    );
    
    let cardElement = screen.getByText('Card Content').parentElement?.parentElement;
    expect(cardElement).toHaveClass('bg-primary-50');
    
    rerender(
      <Card variant="danger" data-testid="card">
        <div>Card Content</div>
      </Card>
    );
    
    cardElement = screen.getByText('Card Content').parentElement?.parentElement;
    expect(cardElement).toHaveClass('bg-red-50');
  });

  it('renders loading state', () => {
    render(
      <Card loading>
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.queryByText('Card Content')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders elevated style', () => {
    render(
      <Card isElevated>
        <div>Card Content</div>
      </Card>
    );
    
    const cardElement = screen.getByText('Card Content').parentElement?.parentElement;
    expect(cardElement).toHaveClass('shadow-md');
  });

  it('renders interactive style', () => {
    render(
      <Card isInteractive>
        <div>Card Content</div>
      </Card>
    );
    
    const cardElement = screen.getByText('Card Content').parentElement?.parentElement;
    expect(cardElement).toHaveClass('transform');
    expect(cardElement).toHaveClass('hover:-translate-y-1');
  });

  it('renders Card.Header subcomponent', () => {
    render(
      <Card>
        <Card.Header title="Header Title" subtitle="Header Subtitle" />
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.getByText('Header Title')).toBeInTheDocument();
    expect(screen.getByText('Header Subtitle')).toBeInTheDocument();
  });

  it('renders Card.Body subcomponent', () => {
    render(
      <Card>
        <Card.Body>
          <div data-testid="body-content">Body Content</div>
        </Card.Body>
      </Card>
    );
    
    expect(screen.getByTestId('body-content')).toBeInTheDocument();
    expect(screen.getByTestId('body-content').parentElement).toHaveClass('p-4');
  });

  it('renders Card.Body without padding when padded=false', () => {
    render(
      <Card>
        <Card.Body padded={false}>
          <div data-testid="body-content">Body Content</div>
        </Card.Body>
      </Card>
    );
    
    expect(screen.getByTestId('body-content').parentElement).not.toHaveClass('p-4');
  });

  it('renders Card.Footer subcomponent', () => {
    render(
      <Card>
        <div>Card Content</div>
        <Card.Footer>
          <div data-testid="footer-content">Footer Content</div>
        </Card.Footer>
      </Card>
    );
    
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer-content').parentElement).toHaveClass('border-t');
  });

  it('renders Card.Footer with different alignment', () => {
    render(
      <Card>
        <div>Card Content</div>
        <Card.Footer align="center">
          <div data-testid="footer-content">Footer Content</div>
        </Card.Footer>
      </Card>
    );
    
    expect(screen.getByTestId('footer-content').parentElement).toHaveClass('justify-center');
  });

  it('combines custom className with default classes', () => {
    render(
      <Card className="custom-class">
        <div>Card Content</div>
      </Card>
    );
    
    const cardElement = screen.getByText('Card Content').parentElement?.parentElement;
    expect(cardElement).toHaveClass('custom-class');
    expect(cardElement).toHaveClass('bg-white'); // Still has default classes
  });
});