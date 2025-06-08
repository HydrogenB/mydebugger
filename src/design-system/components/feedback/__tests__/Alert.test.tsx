import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../../test-utils/test-utils';
import { Alert } from '../Alert';

// Mock timer for dismissal animation
jest.useFakeTimers();

describe('Alert Component', () => {
  it('renders default info alert', () => {
    render(<Alert>Information message</Alert>);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Information message');
    expect(alert).toHaveClass('bg-blue-50'); // Default info styling
  });

  it('renders with different types', () => {
    const { rerender } = render(<Alert type="success">Success message</Alert>);
    
    let alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-green-50');
    
    rerender(<Alert type="warning">Warning message</Alert>);
    alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-yellow-50');
    
    rerender(<Alert type="error">Error message</Alert>);
    alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-red-50');
  });

  it('renders with title', () => {
    render(
      <Alert title="Important Information">
        Some details about the information
      </Alert>
    );
    
    expect(screen.getByText('Important Information')).toBeInTheDocument();
    expect(screen.getByText('Some details about the information')).toBeInTheDocument();
  });

  it('can hide icons', () => {
    const { container } = render(
      <Alert showIcon={false}>No icon alert</Alert>
    );
    
    // The first SVG would be the icon if present
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders outlined style', () => {
    render(<Alert outlined>Outlined alert</Alert>);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-transparent');
    expect(alert).toHaveClass('border-blue-500');
  });
  
  it('can be dismissed', async () => {
    const mockDismiss = jest.fn();
    
    render(
      <Alert dismissible onDismiss={mockDismiss}>
        Dismissible alert
      </Alert>
    );
    
    // Find and click the close button
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    // Verify animation class is applied
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('animate-fade-out');
    
    // Fast-forward timers to complete animation
    jest.advanceTimersByTime(300);
    
    // Check if callback was called
    await waitFor(() => {
      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });
    
    // The alert should no longer be in the document after the animation
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders with action component', () => {
    const actionButton = <button>Action</button>;
    
    render(
      <Alert action={actionButton}>
        Alert with action
      </Alert>
    );
    
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});