import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabGroup, Tab, TabPanel } from '../TabGroup';

describe('TabGroup Component', () => {
  it('renders tabs and shows the first tab panel by default', () => {
    render(
      <TabGroup>
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('renders with a defaultTab', () => {
    render(
      <TabGroup defaultTab="tab2">
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled tabs when selecting the first tab', () => {
    render(
      <TabGroup>
        <Tab id="tab1" label="Tab 1" disabled />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
  });

  it('changes the active tab when clicked', () => {
    render(
      <TabGroup>
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    fireEvent.click(tab2);
    
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false');
  });

  it('does not change tab when a disabled tab is clicked', () => {
    render(
      <TabGroup>
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" disabled />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    fireEvent.click(tab2);
    
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <TabGroup variant="pills">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    let tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('rounded-md');
    
    rerender(
      <TabGroup variant="boxed">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).not.toHaveClass('rounded-md');
    expect(tab.closest('[role="tablist"]')).toHaveClass('border');
    
    rerender(
      <TabGroup variant="buttons">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('rounded-md');
    expect(tab).toHaveClass('border');
  });

  it('renders with different size classes', () => {
    const { rerender } = render(
      <TabGroup size="sm">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    let tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('text-sm py-1 px-2');
    
    rerender(
      <TabGroup size="lg">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('text-lg py-2 px-4');
  });

  it('renders with different alignments', () => {
    const { rerender } = render(
      <TabGroup alignment="center">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    let tabList = screen.getByRole('tablist');
    expect(tabList).toHaveClass('justify-center');
    
    rerender(
      <TabGroup alignment="right">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    tabList = screen.getByRole('tablist');
    expect(tabList).toHaveClass('justify-end');
    
    rerender(
      <TabGroup alignment="fullWidth">
        <Tab id="tab1" label="Tab 1" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    tabList = screen.getByRole('tablist');
    expect(tabList).toHaveClass('w-full');
    
    const tab = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab).toHaveClass('flex-1');
  });

  it('calls onChange when tab changes', () => {
    const handleChange = jest.fn();
    
    render(
      <TabGroup onChange={handleChange}>
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    fireEvent.click(tab2);
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });

  it('works as a controlled component', () => {
    const { rerender } = render(
      <TabGroup activeTab="tab1">
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    
    rerender(
      <TabGroup activeTab="tab2">
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });

  it('renders tabs with icons and badges', () => {
    const icon = <svg data-testid="test-icon" />;
    const badge = <span data-testid="test-badge">New</span>;
    
    render(
      <TabGroup>
        <Tab id="tab1" label="Tab 1" icon={icon} badge={badge} />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });

  it('renders tab with children instead of label when provided', () => {
    render(
      <TabGroup>
        <Tab id="tab1"><span data-testid="custom-tab-content">Custom Tab</span></Tab>
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    expect(screen.getByTestId('custom-tab-content')).toBeInTheDocument();
  });

  it('keeps tab panels mounted when keepMounted is true', () => {
    render(
      <TabGroup defaultTab="tab2">
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" />
        <TabPanel id="tab1" keepMounted>Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    // Initially tab2 is active, tab1 content should be in DOM but hidden
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    const tab1Panel = screen.getByText('Content 1').closest('[role="tabpanel"]');
    expect(tab1Panel).toHaveClass('hidden');
    
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    const tab2Panel = screen.getByText('Content 2').closest('[role="tabpanel"]');
    expect(tab2Panel).not.toHaveClass('hidden');
  });

  it('throws error when Tab is used outside TabGroup', () => {
    // Mock console.error to avoid error output in test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<Tab id="orphaned" label="Orphaned Tab" />);
    }).toThrow('Tab must be used within a TabGroup');
    
    // Restore console.error
    console.error = originalError;
  });

  it('throws error when TabPanel is used outside TabGroup', () => {
    // Mock console.error to avoid error output in test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TabPanel id="orphaned">Orphaned Content</TabPanel>);
    }).toThrow('TabPanel must be used within a TabGroup');
    
    // Restore console.error
    console.error = originalError;
  });

  it('supports custom onClick handlers in tabs', () => {
    const customOnClick = jest.fn();
    
    render(
      <TabGroup>
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" onClick={customOnClick} />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    fireEvent.click(tab2);
    
    expect(customOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom class names correctly', () => {
    render(
      <TabGroup className="custom-tabs-class">
        <Tab id="tab1" label="Tab 1" className="custom-tab-class" />
        <TabPanel id="tab1">Content 1</TabPanel>
      </TabGroup>
    );
    
    expect(screen.getByRole('tablist')).toHaveClass('custom-tabs-class');
    expect(screen.getByRole('tab')).toHaveClass('custom-tab-class');
  });

  it('supports tab with isActive prop', () => {
    render(
      <TabGroup>
        <Tab id="tab1" label="Tab 1" />
        <Tab id="tab2" label="Tab 2" isActive={true} />
        <TabPanel id="tab1">Content 1</TabPanel>
        <TabPanel id="tab2">Content 2</TabPanel>
      </TabGroup>
    );
    
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
  });
});