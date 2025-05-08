import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from '../TextInput';

describe('TextInput Component', () => {
  it('renders a basic input element', () => {
    render(<TextInput id="test-input" data-testid="input" />);
    
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveClass('bg-white');
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(
      <TextInput 
        id="name-input"
        label="Your Name" 
      />
    );
    
    const label = screen.getByText('Your Name');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'name-input');
  });

  it('shows required indicator when required prop is true', () => {
    render(
      <TextInput 
        id="required-input"
        label="Required Field" 
        required
      />
    );
    
    const label = screen.getByText('Required Field');
    expect(label.innerHTML).toContain('*');
    expect(label.querySelector('span')).toHaveClass('text-red-600');
  });

  it('renders helper text', () => {
    render(
      <TextInput 
        id="helper-input"
        helperText="This is a helpful message" 
      />
    );
    
    expect(screen.getByText('This is a helpful message')).toBeInTheDocument();
    expect(screen.getByText('This is a helpful message')).toHaveClass('text-gray-500');
  });

  it('renders error message and changes input styling', () => {
    render(
      <TextInput 
        id="error-input"
        error="This field is required" 
      />
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('This field is required')).toHaveClass('text-red-600');
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders success state', () => {
    render(
      <TextInput 
        id="success-input"
        success
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-green-500');
  });

  it('renders disabled state', () => {
    render(
      <TextInput 
        id="disabled-input"
        disabled
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-60');
    expect(input).toHaveClass('cursor-not-allowed');
  });

  it('renders different sizes', () => {
    const { rerender } = render(
      <TextInput 
        id="size-input"
        size="sm"
        data-testid="size-input"
      />
    );
    
    expect(screen.getByTestId('size-input')).toHaveClass('py-1 px-2 text-sm');
    
    rerender(
      <TextInput 
        id="size-input"
        size="lg"
        data-testid="size-input"
      />
    );
    
    expect(screen.getByTestId('size-input')).toHaveClass('py-2.5 px-4 text-lg');
  });

  it('renders different variants', () => {
    const { rerender } = render(
      <TextInput 
        id="variant-input"
        variant="filled"
        data-testid="variant-input"
      />
    );
    
    expect(screen.getByTestId('variant-input')).toHaveClass('bg-gray-100');
    expect(screen.getByTestId('variant-input')).toHaveClass('border-transparent');
    
    rerender(
      <TextInput 
        id="variant-input"
        variant="outlined"
        data-testid="variant-input"
      />
    );
    
    expect(screen.getByTestId('variant-input')).toHaveClass('bg-transparent');
    
    rerender(
      <TextInput 
        id="variant-input"
        variant="underlined"
        data-testid="variant-input"
      />
    );
    
    expect(screen.getByTestId('variant-input')).toHaveClass('border-b-2');
    expect(screen.getByTestId('variant-input')).toHaveClass('rounded-none');
  });

  it('supports full width styling', () => {
    render(
      <TextInput 
        id="fullwidth-input"
        fullWidth
        data-testid="input-container" 
      />
    );
    
    expect(screen.getByTestId('input-container')).toHaveClass('w-full');
  });

  it('renders with start adornment', () => {
    render(
      <TextInput 
        id="adornment-input"
        startAdornment={<span data-testid="start-adornment">$</span>}
      />
    );
    
    expect(screen.getByTestId('start-adornment')).toBeInTheDocument();
    expect(screen.getByRole('textbox').parentElement).toHaveClass('pl-9');
  });

  it('renders with end adornment', () => {
    render(
      <TextInput 
        id="adornment-input"
        endAdornment={<span data-testid="end-adornment">%</span>}
      />
    );
    
    expect(screen.getByTestId('end-adornment')).toBeInTheDocument();
    expect(screen.getByRole('textbox').parentElement).toHaveClass('pr-9');
  });

  it('renders clearable input and clears value when clicked', () => {
    const handleChange = jest.fn();
    
    render(
      <TextInput 
        id="clearable-input"
        clearable
        value="test value"
        onChange={handleChange}
      />
    );
    
    // Clear button should exist
    const clearButton = screen.getByRole('textbox').nextSibling;
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveClass('cursor-pointer');
    
    // Click clear button
    fireEvent.click(clearButton as HTMLElement);
    
    // onChange should be called with empty value
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].target.value).toBe('');
  });

  it('tracks input values correctly', () => {
    const handleChange = jest.fn();
    
    render(
      <TextInput 
        id="value-input"
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    // Input a value
    fireEvent.change(input, { target: { value: 'New value' } });
    
    // onChange should be called with new value
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange.mock.calls[0][0].target.value).toBe('New value');
  });

  it('shows character count when specified', () => {
    render(
      <TextInput 
        id="char-count-input"
        showCharCount
        maxLength={100}
        value="Hello"
      />
    );
    
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('handles custom className props', () => {
    render(
      <TextInput 
        id="custom-class-input"
        className="custom-input-class"
        containerClassName="custom-container-class"
        labelClassName="custom-label-class"
        label="Custom Label"
        data-testid="custom-input"
      />
    );
    
    expect(screen.getByTestId('custom-input')).toHaveClass('custom-input-class');
    expect(screen.getByTestId('custom-input').closest('div')?.parentElement).toHaveClass('custom-container-class');
    expect(screen.getByText('Custom Label')).toHaveClass('custom-label-class');
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    
    render(
      <TextInput 
        id="ref-input"
        ref={ref}
        data-testid="ref-test"
      />
    );
    
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBe(screen.getByTestId('ref-test'));
  });

  it('works with controlled input pattern', () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('initial');
      
      return (
        <TextInput 
          id="controlled-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="controlled-input"
        />
      );
    };
    
    render(<TestComponent />);
    
    const input = screen.getByTestId('controlled-input');
    expect(input).toHaveValue('initial');
    
    fireEvent.change(input, { target: { value: 'changed' } });
    expect(input).toHaveValue('changed');
  });

  it('calls onClear callback when clear button is clicked', () => {
    const handleClear = jest.fn();
    
    render(
      <TextInput 
        id="clear-callback-input"
        clearable
        value="test value"
        onClear={handleClear}
      />
    );
    
    const clearButton = screen.getByRole('textbox').nextSibling;
    fireEvent.click(clearButton as HTMLElement);
    
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});