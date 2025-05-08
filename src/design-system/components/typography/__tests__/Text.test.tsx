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
    expect(screen.getByText('Uppercase Text')).toHaveClass('uppercase');
    
    rerender(<Text transform="lowercase">LOWERCASE TEXT</Text>);
    expect(screen.getByText('LOWERCASE TEXT')).toHaveClass('lowercase');
    
    rerender(<Text transform="capitalize">capitalize text</Text>);
    expect(screen.getByText('capitalize text')).toHaveClass('capitalize');
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

  it('renders children correctly', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Text variant="h1">Heading 1</Text>);
    expect(screen.getByText('Heading 1').tagName).toBe('H1');
    
    rerender(<Text variant="h2">Heading 2</Text>);
    expect(screen.getByText('Heading 2').tagName).toBe('H2');
    
    rerender(<Text variant="h3">Heading 3</Text>);
    expect(screen.getByText('Heading 3').tagName).toBe('H3');
    
    rerender(<Text variant="h4">Heading 4</Text>);
    expect(screen.getByText('Heading 4').tagName).toBe('H4');
    
    rerender(<Text variant="h5">Heading 5</Text>);
    expect(screen.getByText('Heading 5').tagName).toBe('H5');
    
    rerender(<Text variant="h6">Heading 6</Text>);
    expect(screen.getByText('Heading 6').tagName).toBe('H6');
    
    rerender(<Text variant="p">Paragraph</Text>);
    expect(screen.getByText('Paragraph').tagName).toBe('P');
    
    rerender(<Text variant="span">Span</Text>);
    expect(screen.getByText('Span').tagName).toBe('SPAN');
  });

  it('renders with different font weights', () => {
    const { rerender } = render(<Text weight="normal">Normal Text</Text>);
    expect(screen.getByText('Normal Text')).toHaveClass('font-normal');
    
    rerender(<Text weight="medium">Medium Text</Text>);
    expect(screen.getByText('Medium Text')).toHaveClass('font-medium');
    
    rerender(<Text weight="semibold">Semibold Text</Text>);
    expect(screen.getByText('Semibold Text')).toHaveClass('font-semibold');
    
    rerender(<Text weight="bold">Bold Text</Text>);
    expect(screen.getByText('Bold Text')).toHaveClass('font-bold');
  });

  it('renders with different font sizes', () => {
    const { rerender } = render(<Text size="xs">Extra Small</Text>);
    expect(screen.getByText('Extra Small')).toHaveClass('text-xs');
    
    rerender(<Text size="sm">Small</Text>);
    expect(screen.getByText('Small')).toHaveClass('text-sm');
    
    rerender(<Text size="base">Base</Text>);
    expect(screen.getByText('Base')).toHaveClass('text-base');
    
    rerender(<Text size="lg">Large</Text>);
    expect(screen.getByText('Large')).toHaveClass('text-lg');
    
    rerender(<Text size="xl">Extra Large</Text>);
    expect(screen.getByText('Extra Large')).toHaveClass('text-xl');
    
    rerender(<Text size="2xl">2XL</Text>);
    expect(screen.getByText('2XL')).toHaveClass('text-2xl');
    
    rerender(<Text size="3xl">3XL</Text>);
    expect(screen.getByText('3XL')).toHaveClass('text-3xl');
    
    rerender(<Text size="4xl">4XL</Text>);
    expect(screen.getByText('4XL')).toHaveClass('text-4xl');
  });

  it('renders with custom colors', () => {
    const { rerender } = render(<Text color="primary">Primary</Text>);
    expect(screen.getByText('Primary')).toHaveClass('text-primary-600');
    
    rerender(<Text color="secondary">Secondary</Text>);
    expect(screen.getByText('Secondary')).toHaveClass('text-secondary-600');
    
    rerender(<Text color="success">Success</Text>);
    expect(screen.getByText('Success')).toHaveClass('text-green-600');
    
    rerender(<Text color="warning">Warning</Text>);
    expect(screen.getByText('Warning')).toHaveClass('text-yellow-600');
    
    rerender(<Text color="error">Error</Text>);
    expect(screen.getByText('Error')).toHaveClass('text-red-600');
    
    rerender(<Text color="info">Info</Text>);
    expect(screen.getByText('Info')).toHaveClass('text-blue-600');
  });

  it('renders with different alignments', () => {
    const { rerender } = render(<Text align="left">Left</Text>);
    expect(screen.getByText('Left')).toHaveClass('text-left');
    
    rerender(<Text align="center">Center</Text>);
    expect(screen.getByText('Center')).toHaveClass('text-center');
    
    rerender(<Text align="right">Right</Text>);
    expect(screen.getByText('Right')).toHaveClass('text-right');
    
    rerender(<Text align="justify">Justify</Text>);
    expect(screen.getByText('Justify')).toHaveClass('text-justify');
  });

  it('renders with truncation and line clamp', () => {
    render(<Text truncate>Truncated text that should not wrap</Text>);
    expect(screen.getByText(/Truncated text/)).toHaveClass('truncate');
    
    render(<Text lineClamp={2}>Text with line clamp</Text>);
    expect(screen.getByText('Text with line clamp')).toHaveClass('line-clamp-2');
  });

  it('applies custom className', () => {
    render(<Text className="custom-class">Custom Class</Text>);
    expect(screen.getByText('Custom Class')).toHaveClass('custom-class');
  });

  it('applies custom inline style', () => {
    render(<Text style={{ marginTop: '10px' }}>Custom Style</Text>);
    expect(screen.getByText('Custom Style')).toHaveStyle('margin-top: 10px');
  });

  it('renders as another element with "as" prop', () => {
    render(<Text as="label">Label Text</Text>);
    expect(screen.getByText('Label Text').tagName).toBe('LABEL');
  });

  it('applies spacing props', () => {
    render(<Text mb={4} mt={2} mx={3}>Spacing Text</Text>);
    const textElement = screen.getByText('Spacing Text');
    expect(textElement).toHaveClass('mb-4');
    expect(textElement).toHaveClass('mt-2');
    expect(textElement).toHaveClass('mx-3');
  });

  it('handles line height options', () => {
    const { rerender } = render(<Text lineHeight="tight">Tight</Text>);
    expect(screen.getByText('Tight')).toHaveClass('leading-tight');
    
    rerender(<Text lineHeight="normal">Normal</Text>);
    expect(screen.getByText('Normal')).toHaveClass('leading-normal');
    
    rerender(<Text lineHeight="loose">Loose</Text>);
    expect(screen.getByText('Loose')).toHaveClass('leading-loose');
  });

  it('applies responsive size classes', () => {
    render(<Text size={{ base: 'xs', md: 'lg', lg: '2xl' }}>Responsive Text</Text>);
    const textElement = screen.getByText('Responsive Text');
    expect(textElement).toHaveClass('text-xs');
    expect(textElement).toHaveClass('md:text-lg');
    expect(textElement).toHaveClass('lg:text-2xl');
  });

  it('supports numeric spacing values', () => {
    render(<Text m={3} p={4}>Numeric Spacing</Text>);
    const textElement = screen.getByText('Numeric Spacing');
    expect(textElement).toHaveClass('m-3');
    expect(textElement).toHaveClass('p-4');
  });
});