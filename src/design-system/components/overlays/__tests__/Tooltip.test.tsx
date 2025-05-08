import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Tooltip } from '../Tooltip';
import { durations } from '../../../foundations/animations';

// Mock the animation durations to speed up tests
jest.mock('../../../foundations/animations', () => ({
  durations: {
    normal: 5, // Shortened for testing
  },
  easings: {
    emphasized: 'cubic-bezier(0.2, 0, 0, 1.0)',
  },
}));

describe('Tooltip Component', () => {
  // Mock timers for better control over animations and delays
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the trigger element', () => {
    render(
      <Tooltip content="Tooltip Content">
        <button data-testid="trigger">Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    render(
      <Tooltip content="Tooltip Content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Initially the tooltip is not visible
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
    
    // Hover over the trigger
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Tooltip should be visible
    expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveClass('opacity-100');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip Content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.mouseLeave(screen.getByText('Hover me'));
    
    // Tooltip should become invisible (opacity: 0)
    expect(screen.getByRole('tooltip')).toHaveClass('opacity-0');
    
    // After animation timeout, tooltip should be removed from DOM
    act(() => {
      jest.advanceTimersByTime(durations.normal + 10);
    });
    
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Tooltip Content">
        <button>Focus me</button>
      </Tooltip>
    );
    
    // Focus the trigger
    fireEvent.focus(screen.getByText('Focus me'));
    
    // Tooltip should be visible
    expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Tooltip Content">
        <button>Focus me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.focus(screen.getByText('Focus me'));
    expect(screen.getByText('Tooltip Content')).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.blur(screen.getByText('Focus me'));
    
    // After animation timeout, tooltip should be removed from DOM
    act(() => {
      jest.advanceTimersByTime(durations.normal + 10);
    });
    
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('applies delay before showing tooltip', () => {
    const delay = 500;
    
    render(
      <Tooltip content="Delayed Tooltip" delay={delay}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Hover over the trigger
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Before delay, tooltip should not be visible
    expect(screen.queryByText('Delayed Tooltip')).not.toBeInTheDocument();
    
    // Advance timer by delay amount
    act(() => {
      jest.advanceTimersByTime(delay);
    });
    
    // After delay, tooltip should be visible
    expect(screen.getByText('Delayed Tooltip')).toBeInTheDocument();
  });

  it('cancels delay timeout when mouse leaves before tooltip appears', () => {
    const delay = 500;
    
    render(
      <Tooltip content="Delayed Tooltip" delay={delay}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Hover over the trigger
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Leave before delay completes
    act(() => {
      jest.advanceTimersByTime(delay - 100);
    });
    fireEvent.mouseLeave(screen.getByText('Hover me'));
    
    // Complete the delay time
    act(() => {
      jest.advanceTimersByTime(100 + 10);
    });
    
    // Tooltip should not appear
    expect(screen.queryByText('Delayed Tooltip')).not.toBeInTheDocument();
  });

  it('renders disabled tooltip', () => {
    render(
      <Tooltip content="Tooltip Content" disabled>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Hover over the trigger
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Tooltip should not be visible
    expect(screen.queryByText('Tooltip Content')).not.toBeInTheDocument();
  });

  it('applies correct position classes', () => {
    const { rerender } = render(
      <Tooltip content="Top Tooltip" position="top">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('bottom-full');
    
    // Test right position
    rerender(
      <Tooltip content="Right Tooltip" position="right">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('tooltip')).toHaveClass('left-full');
    
    // Test bottom position
    rerender(
      <Tooltip content="Bottom Tooltip" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('tooltip')).toHaveClass('top-full');
    
    // Test left position
    rerender(
      <Tooltip content="Left Tooltip" position="left">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('tooltip')).toHaveClass('right-full');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(
      <Tooltip content="Small Tooltip" size="sm">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('px-2 py-1 text-xs');
    
    // Test medium size (default)
    rerender(
      <Tooltip content="Medium Tooltip" size="md">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('tooltip')).toHaveClass('px-2.5 py-1.5 text-sm');
    
    // Test large size
    rerender(
      <Tooltip content="Large Tooltip" size="lg">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByRole('tooltip')).toHaveClass('px-3 py-2 text-base');
  });

  it('applies max width', () => {
    render(
      <Tooltip content="Custom Width Tooltip" maxWidth="max-w-md">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('max-w-md');
  });

  it('renders arrow by default', () => {
    render(
      <Tooltip content="Tooltip with Arrow">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    const tooltip = screen.getByRole('tooltip');
    
    // Arrow should be present
    expect(tooltip.querySelector('.border-solid')).toBeInTheDocument();
  });

  it('hides arrow when showArrow is false', () => {
    render(
      <Tooltip content="Tooltip without Arrow" showArrow={false}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    const tooltip = screen.getByRole('tooltip');
    
    // Arrow should not be present
    expect(tooltip.querySelector('.border-solid')).not.toBeInTheDocument();
  });

  it('applies custom class name', () => {
    render(
      <Tooltip content="Custom Class Tooltip" className="custom-tooltip-class">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('custom-tooltip-class');
  });

  it('applies custom ID', () => {
    render(
      <Tooltip content="ID Tooltip" id="custom-tooltip-id">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveAttribute('id', 'custom-tooltip-id');
  });

  it('renders HTML content when allowHtml is true', () => {
    const htmlContent = '<span data-testid="html-content">HTML <strong>Content</strong></span>';
    
    render(
      <Tooltip content={htmlContent} allowHtml>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.innerHTML).toContain(htmlContent);
  });

  it('handles touch events when enableOnTouch is true', () => {
    render(
      <Tooltip content="Touch Tooltip" enableOnTouch>
        <button>Touch me</button>
      </Tooltip>
    );
    
    const preventDefault = jest.fn();
    
    // Simulate touch start
    fireEvent.touchStart(screen.getByText('Touch me'), { preventDefault });
    
    // preventDefault should be called to stop normal touch behavior
    expect(preventDefault).toHaveBeenCalled();
    
    // Tooltip should be visible
    expect(screen.getByText('Touch Tooltip')).toBeInTheDocument();
    
    // Touch end should hide tooltip
    fireEvent.touchEnd(screen.getByText('Touch me'));
    
    // After animation timeout, tooltip should be removed from DOM
    act(() => {
      jest.advanceTimersByTime(durations.normal + 10);
    });
    
    expect(screen.queryByText('Touch Tooltip')).not.toBeInTheDocument();
  });

  it('does not handle touch events when enableOnTouch is false', () => {
    render(
      <Tooltip content="Touch Tooltip" enableOnTouch={false}>
        <button>Touch me</button>
      </Tooltip>
    );
    
    const preventDefault = jest.fn();
    
    // Simulate touch start
    fireEvent.touchStart(screen.getByText('Touch me'), { preventDefault });
    
    // preventDefault should not be called
    expect(preventDefault).not.toHaveBeenCalled();
    
    // Tooltip should not be visible
    expect(screen.queryByText('Touch Tooltip')).not.toBeInTheDocument();
  });
});