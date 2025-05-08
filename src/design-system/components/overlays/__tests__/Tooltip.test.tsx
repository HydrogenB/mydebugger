import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Tooltip } from '../Tooltip';

// Mock timer functions
jest.useFakeTimers();

describe('Tooltip Component', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders a tooltip trigger', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    // Initially, tooltip should not be visible
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Tooltip content');
  });

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip content">
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.mouseLeave(screen.getByText('Hover me'));
    
    // Tooltip should be removed from the document
    act(() => {
      jest.runAllTimers(); // Run any pending timers for transitions
    });
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports different tooltip positions', () => {
    const { rerender } = render(
      <Tooltip content="Top Tooltip" position="top">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('bottom-full');
    
    rerender(
      <Tooltip content="Right Tooltip" position="right">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('left-full');
    
    rerender(
      <Tooltip content="Bottom Tooltip" position="bottom">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('top-full');
    
    rerender(
      <Tooltip content="Left Tooltip" position="left">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toHaveClass('right-full');
  });

  it('applies delay before showing tooltip', () => {
    render(
      <Tooltip content="Delayed Tooltip" showDelay={500}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Before delay, tooltip should not be visible
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    
    // Advance timer by delay amount
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // After delay, tooltip should be visible
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Delayed Tooltip');
  });

  it('applies hide delay before hiding tooltip', () => {
    render(
      <Tooltip content="Hide Delay Tooltip" hideDelay={300}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Show tooltip
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Try to hide tooltip
    fireEvent.mouseLeave(screen.getByText('Hover me'));
    
    // Before hide delay, tooltip should still be visible
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Advance timer by hide delay amount
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // After hide delay, tooltip should be gone
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show tooltip when disabled', () => {
    render(
      <Tooltip content="Disabled Tooltip" disabled={true}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders HTML content when allowHtml is true', () => {
    const htmlContent = '<span data-testid="html-content">HTML Content</span>';
    
    render(
      <Tooltip content={htmlContent} allowHtml={true}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip.innerHTML).toContain(htmlContent);
  });

  it('handles touch events when enableOnTouch is true', () => {
    render(
      <Tooltip content="Touch Tooltip" enableOnTouch={true}>
        <button>Touch me</button>
      </Tooltip>
    );
    
    // Mock preventDefault function
    const preventDefault = jest.fn();
    
    // Simulate touch event
    fireEvent.touchStart(screen.getByText('Touch me'), { preventDefault });
    
    // preventDefault should be called to stop normal touch behavior
    expect(preventDefault).toHaveBeenCalled();
    
    // Tooltip should be visible
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Touch Tooltip');
  });

  it('supports custom max width', () => {
    render(
      <Tooltip content="Custom Max Width Tooltip" maxWidth="200px">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveStyle('max-width: 200px');
  });

  it('allows customizing appearance with className', () => {
    render(
      <Tooltip content="Custom Class Tooltip" className="custom-tooltip-class">
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('custom-tooltip-class');
  });

  it('supports arrow customization', () => {
    const { rerender } = render(
      <Tooltip content="Arrow Tooltip" showArrow={false}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // No arrow element should be rendered
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.querySelector('[class*="border-"]')).not.toBeInTheDocument();
    
    rerender(
      <Tooltip content="Arrow Tooltip" showArrow={true}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    
    // Arrow element should be rendered
    const tooltipWithArrow = screen.getByRole('tooltip');
    expect(tooltipWithArrow.querySelector('[class*="border-"]')).toBeInTheDocument();
  });

  it('handles focus and blur events', () => {
    render(
      <Tooltip content="Focus Tooltip">
        <button>Focus me</button>
      </Tooltip>
    );
    
    // Show tooltip on focus
    fireEvent.focus(screen.getByText('Focus me'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Hide tooltip on blur
    fireEvent.blur(screen.getByText('Focus me'));
    
    act(() => {
      jest.runAllTimers(); // Run any pending timers for transitions
    });
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('supports controlled visibility mode', () => {
    const { rerender } = render(
      <Tooltip content="Controlled Tooltip" isOpen={true}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    // Tooltip should be visible even without hover
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Hover should not affect visibility
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    fireEvent.mouseLeave(screen.getByText('Hover me'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    
    // Changing isOpen to false should hide the tooltip
    rerender(
      <Tooltip content="Controlled Tooltip" isOpen={false}>
        <button>Hover me</button>
      </Tooltip>
    );
    
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('works with complex nested children', () => {
    render(
      <Tooltip content="Nested Content Tooltip">
        <div>
          <span>
            <button>
              <span>Complex</span> Button
            </button>
          </span>
        </div>
      </Tooltip>
    );
    
    // Find the button by text
    const button = screen.getByText((content, element) => {
      if (!element) return false;
      return element.textContent === 'Complex Button';
    }).closest('button');
    
    if (button) {
      fireEvent.mouseEnter(button);
      
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('tooltip')).toHaveTextContent('Nested Content Tooltip');
    }
  });
});