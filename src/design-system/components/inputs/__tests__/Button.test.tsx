import React from 'react';
import { render, screen, fireEvent } from '../../../../test-utils/test-utils';
import Button from '../Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600'); // Primary variant by default
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="success">Success</Button>);
    let button = screen.getByRole('button', { name: /success/i });
    expect(button).toHaveClass('bg-green-600');

    rerender(<Button variant="danger">Danger</Button>);
    button = screen.getByRole('button', { name: /danger/i });
    expect(button).toHaveClass('bg-red-600');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading state correctly', () => {
    render(<Button isLoading loadingText="Loading...">Submit</Button>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('applies fullWidth prop correctly', () => {
    render(<Button fullWidth>Full width</Button>);
    const button = screen.getByRole('button', { name: /full width/i });
    expect(button).toHaveClass('w-full');
  });

  it('renders with icons', () => {
    render(<Button icon="check">With icon</Button>);
    const button = screen.getByRole('button', { name: /with icon/i });
    expect(button.firstChild).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="xs">Extra Small</Button>);
    let button = screen.getByRole('button', { name: /extra small/i });
    expect(button).toHaveClass('px-2 py-1 text-xs');
    
    rerender(<Button size="xl">Extra Large</Button>);
    button = screen.getByRole('button', { name: /extra large/i });
    expect(button).toHaveClass('px-6 py-3 text-xl');
  });
});