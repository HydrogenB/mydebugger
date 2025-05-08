import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from '../Text';

describe('Text Component', () => {
  it('renders default paragraph element', () => {
    render(<Text>Hello World</Text>);
    
    const element = screen.getByText('Hello World');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('P');
    expect(element).toHaveClass('text-base'); // Default size
    expect(element).toHaveClass('font-normal'); // Default weight
    expect(element).toHaveClass('text-gray-800'); // Default color
  });

  it('renders with different semantic elements', () => {
    const { rerender } = render(<Text as="span">Span Text</Text>);
    expect(screen.getByText('Span Text').tagName).toBe('SPAN');
    
    rerender(<Text as="h1">Heading</Text>);
    expect(screen.getByText('Heading').tagName).toBe('H1');
    
    rerender(<Text as="div">Div Content</Text>);
    expect(screen.getByText('Div Content').tagName).toBe('DIV');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Text size="xs">Extra Small</Text>);
    expect(screen.getByText('Extra Small')).toHaveClass('text-xs');
    
    rerender(<Text size="lg">Large Text</Text>);
    expect(screen.getByText('Large Text')).toHaveClass('text-lg');
    
    rerender(<Text size="3xl">3XL Text</Text>);
    expect(screen.getByText('3XL Text')).toHaveClass('text-3xl');
  });

  it('renders with responsive sizes', () => {
    render(
      <Text size={{ 
        base: 'sm', 
        md: 'lg', 
        lg: 'xl' 
      }}>
        Responsive Text
      </Text>
    );
    
    const element = screen.getByText('Responsive Text');
    expect(element).toHaveClass('text-sm'); // base size
    expect(element).toHaveClass('md:text-lg'); // md breakpoint
    expect(element).toHaveClass('lg:text-xl'); // lg breakpoint
  });

  it('renders with different weights', () => {
    const { rerender } = render(<Text weight="bold">Bold Text</Text>);
    expect(screen.getByText('Bold Text')).toHaveClass('font-bold');
    
    rerender(<Text weight="light">Light Text</Text>);
    expect(screen.getByText('Light Text')).toHaveClass('font-light');
    
    rerender(<Text weight="semibold">Semibold Text</Text>);
    expect(screen.getByText('Semibold Text')).toHaveClass('font-semibold');
  });

  it('renders with text alignment', () => {
    const { rerender } = render(<Text align="center">Centered Text</Text>);
    expect(screen.getByText('Centered Text')).toHaveClass('text-center');
    
    rerender(<Text align="right">Right Text</Text>);
    expect(screen.getByText('Right Text')).toHaveClass('text-right');
    
    rerender(<Text align="justify">Justified Text</Text>);
    expect(screen.getByText('Justified Text')).toHaveClass('text-justify');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<Text color="primary">Primary Text</Text>);
    expect(screen.getByText('Primary Text')).toHaveClass('text-blue-600');
    
    rerender(<Text color="danger">Danger Text</Text>);
    expect(screen.getByText('Danger Text')).toHaveClass('text-red-600');
    
    rerender(<Text color="muted">Muted Text</Text>);
    expect(screen.getByText('Muted Text')).toHaveClass('text-gray-500');
  });

  it('renders with text transformations', () => {
    const { rerender } = render(<Text transform="uppercase">Uppercase Text</Text>);
    expect(screen.getByText('UPPERCASE TEXT')).toHaveClass('uppercase');
    
    rerender(<Text transform="lowercase">LOWERCASE TEXT</Text>);
    expect(screen.getByText('lowercase text')).toHaveClass('lowercase');
    
    rerender(<Text transform="capitalize">capitalize text</Text>);
    expect(screen.getByText('Capitalize Text')).toHaveClass('capitalize');
  });

  it('renders with truncation', () => {
    render(<Text truncate>Long text that should be truncated</Text>);
    expect(screen.getByText('Long text that should be truncated')).toHaveClass('truncate');
  });

  it('renders with specific character truncation', () => {
    render(<Text truncate={20}>Long text that should be truncated</Text>);
    const element = screen.getByText('Long text that should be truncated');
    expect(element).toHaveClass('overflow-hidden');
    expect(element).toHaveClass('text-ellipsis');
    expect(element).toHaveClass('whitespace-nowrap');
    expect(element.className).toContain('max-w-[20ch]');
  });

  it('renders with line clamp', () => {
    render(<Text lineClamp={3}>Multiple lines of text that should be clamped after three lines</Text>);
    expect(screen.getByText('Multiple lines of text that should be clamped after three lines')).toHaveClass('line-clamp-3');
  });

  it('renders with style variations', () => {
    const { rerender } = render(<Text italic>Italic Text</Text>);
    expect(screen.getByText('Italic Text')).toHaveClass('italic');
    
    rerender(<Text underline>Underlined Text</Text>);
    expect(screen.getByText('Underlined Text')).toHaveClass('underline');
    
    rerender(<Text lineThrough>Strikethrough Text</Text>);
    expect(screen.getByText('Strikethrough Text')).toHaveClass('line-through');
    
    // Combined styles
    rerender(<Text italic underline>Italic and Underlined</Text>);
    const element = screen.getByText('Italic and Underlined');
    expect(element).toHaveClass('italic');
    expect(element).toHaveClass('underline');
  });

  it('renders with adaptive leading based on size', () => {
    const { rerender } = render(<Text size="sm">Small text with normal leading</Text>);
    expect(screen.getByText('Small text with normal leading')).toHaveClass('leading-normal');
    
    rerender(<Text size="xl">Larger text with relaxed leading</Text>);
    expect(screen.getByText('Larger text with relaxed leading')).toHaveClass('leading-relaxed');
    
    rerender(<Text size="5xl">Very large text with tight leading</Text>);
    expect(screen.getByText('Very large text with tight leading')).toHaveClass('leading-tight');
    
    // Disable adaptive leading
    rerender(<Text size="sm" adaptiveLeading={false}>Small text without adaptive leading</Text>);
    expect(screen.getByText('Small text without adaptive leading')).not.toHaveClass('leading-normal');
  });

  it('combines custom className with default classes', () => {
    render(<Text className="custom-class">Text with custom class</Text>);
    
    const element = screen.getByText('Text with custom class');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('text-base'); // Still has default classes
  });
});