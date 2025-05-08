import React from 'react';
import { render, screen } from '@testing-library/react';
import { Grid } from '../Grid';

describe('Grid Component', () => {
  it('renders children correctly', () => {
    render(
      <Grid>
        <div data-testid="child-1">Item 1</div>
        <div data-testid="child-2">Item 2</div>
      </Grid>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('renders as specified element tag', () => {
    const { container } = render(
      <Grid as="section">
        <div>Grid Content</div>
      </Grid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement?.nodeName).toBe('SECTION');
  });

  it('renders with default classes', () => {
    const { container } = render(
      <Grid>
        <div>Item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid');
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('md:grid-cols-3');
    expect(gridElement).toHaveClass('gap-x-4');
    expect(gridElement).toHaveClass('gap-y-4');
    expect(gridElement).toHaveClass('justify-start');
    expect(gridElement).toHaveClass('items-stretch');
  });

  it('renders with custom number of columns', () => {
    const { container } = render(
      <Grid columns={4}>
        <div>Item</div>
      </Grid>
    );
    
    expect(container.firstChild).toHaveClass('grid-cols-4');
  });

  it('renders with responsive column configuration', () => {
    const { container } = render(
      <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}>
        <div>Item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid-cols-1');
    expect(gridElement).toHaveClass('sm:grid-cols-2');
    expect(gridElement).toHaveClass('md:grid-cols-3');
    expect(gridElement).toHaveClass('lg:grid-cols-4');
    expect(gridElement).toHaveClass('xl:grid-cols-5');
    expect(gridElement).toHaveClass('2xl:grid-cols-6');
  });

  it('renders with different gap sizes', () => {
    const { container: container1 } = render(
      <Grid gap="xs">
        <div>Item</div>
      </Grid>
    );
    
    expect(container1.firstChild).toHaveClass('gap-x-1');
    expect(container1.firstChild).toHaveClass('gap-y-1');
    
    const { container: container2 } = render(
      <Grid gap="lg">
        <div>Item</div>
      </Grid>
    );
    
    expect(container2.firstChild).toHaveClass('gap-x-6');
    expect(container2.firstChild).toHaveClass('gap-y-6');
  });

  it('renders with different x and y gaps', () => {
    const { container } = render(
      <Grid gap={{ x: 'xs', y: 'lg' }}>
        <div>Item</div>
      </Grid>
    );
    
    expect(container.firstChild).toHaveClass('gap-x-1');
    expect(container.firstChild).toHaveClass('gap-y-6');
  });

  it('applies rowGap when specified (legacy prop)', () => {
    const { container } = render(
      <Grid gap="xs" rowGap="xl">
        <div>Item</div>
      </Grid>
    );
    
    expect(container.firstChild).toHaveClass('gap-x-1');
    expect(container.firstChild).toHaveClass('gap-y-8');
  });

  it('renders with different justification values', () => {
    const justifyValues = ['start', 'end', 'center', 'between', 'around', 'evenly'] as const;
    
    justifyValues.forEach(justify => {
      const { container } = render(
        <Grid justify={justify}>
          <div>Item</div>
        </Grid>
      );
      
      expect(container.firstChild).toHaveClass(`justify-${justify}`);
    });
  });

  it('renders with different alignment values', () => {
    const alignValues = ['start', 'end', 'center', 'stretch', 'baseline'] as const;
    
    alignValues.forEach(align => {
      const { container } = render(
        <Grid align={align}>
          <div>Item</div>
        </Grid>
      );
      
      expect(container.firstChild).toHaveClass(`items-${align}`);
    });
  });

  it('renders with auto-fill columns', () => {
    const { container } = render(
      <Grid autoFill minChildWidth="250px">
        <div>Item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid-cols-[repeat(auto-fill,minmax(250px,1fr))]');
    // Should not have normal column classes when autoFill is true
    expect(gridElement).not.toHaveClass('grid-cols-1');
    expect(gridElement).not.toHaveClass('md:grid-cols-3');
  });

  it('renders with container responsive columns', () => {
    const { container } = render(
      <Grid containerResponsive>
        <div>Item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass('grid-cols-[repeat(auto-fit,minmax(0,1fr))]');
    // Should not have normal column classes when containerResponsive is true
    expect(gridElement).not.toHaveClass('grid-cols-1');
    expect(gridElement).not.toHaveClass('md:grid-cols-3');
  });

  it('renders with auto rows', () => {
    const { container } = render(
      <Grid autoRows>
        <div>Item</div>
      </Grid>
    );
    
    expect(container.firstChild).toHaveClass('grid-rows-[auto]');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Grid className="custom-grid-class">
        <div>Item</div>
      </Grid>
    );
    
    expect(container.firstChild).toHaveClass('custom-grid-class');
    // Should still have the default grid classes
    expect(container.firstChild).toHaveClass('grid');
  });

  it('skips gap classes when gap is "none"', () => {
    const { container } = render(
      <Grid gap="none">
        <div>Item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).not.toHaveClass('gap-x-');
    expect(gridElement).not.toHaveClass('gap-y-');
  });

  it('skips column classes when columns is "none"', () => {
    const { container } = render(
      <Grid columns="none">
        <div>Item</div>
      </Grid>
    );
    
    const gridElement = container.firstChild;
    expect(gridElement).not.toHaveClass('grid-cols-none');
    expect(gridElement).not.toHaveClass('grid-cols-1');
  });
});