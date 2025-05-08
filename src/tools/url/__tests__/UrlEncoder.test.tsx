import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils/test-utils';
import UrlEncoder from '../UrlEncoder';

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
});

// Mock timers for copy button feedback
jest.useFakeTimers();

describe('UrlEncoder Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the URL encoder/decoder tool', () => {
    render(<UrlEncoder />);
    
    expect(screen.getByText('URL Encoder/Decoder')).toBeInTheDocument();
    expect(screen.getByLabelText(/Input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Output/i)).toBeInTheDocument();
    expect(screen.getByText('encodeURIComponent (recommended)')).toBeInTheDocument();
  });

  it('encodes text using encodeURIComponent by default', () => {
    render(<UrlEncoder />);
    
    const input = screen.getByLabelText(/Input/i);
    const testValue = 'Hello World! ?=&';
    
    fireEvent.change(input, { target: { value: testValue } });
    
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(encodeURIComponent(testValue));
  });

  it('switches between encode and decode modes', async () => {
    render(<UrlEncoder />);
    
    // Enter something to encode first
    const input = screen.getByLabelText(/Input/i);
    const testValue = 'Hello World!';
    const encodedValue = encodeURIComponent(testValue);
    
    fireEvent.change(input, { target: { value: testValue } });
    
    // Switch to decode mode - find the toggle button containing 'Encode'
    const toggleButton = screen.getByRole('button', { 
      name: (content) => content.includes('Encode') 
    });
    fireEvent.click(toggleButton);
    
    // Check that we now have a decode button
    expect(screen.getByRole('button', { 
      name: (content) => content.includes('Decode') 
    })).toBeInTheDocument();
    
    // Clear the input and put in encoded text to decode
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.change(input, { target: { value: encodedValue } });
    
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(testValue);
  });

  it('changes encoding method', () => {
    render(<UrlEncoder />);
    
    const input = screen.getByLabelText(/Input/i);
    const testValue = 'Hello World! ?=&';
    
    fireEvent.change(input, { target: { value: testValue } });
    
    // Select different encoding method
    const methodSelect = screen.getByLabelText(/Encoding Method/i);
    fireEvent.change(methodSelect, { target: { value: 'encodeURI' } });
    
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(encodeURI(testValue));
  });

  it('handles batch mode processing', () => {
    render(<UrlEncoder />);
    
    // Toggle batch mode on
    const batchCheckbox = screen.getByLabelText(/Batch Mode/i);
    fireEvent.click(batchCheckbox);
    
    // Enter multi-line input
    const input = screen.getByLabelText(/Input/i);
    const testValue = 'Line 1 with spaces\nLine 2 with ?&= chars';
    
    fireEvent.change(input, { target: { value: testValue } });
    
    // Check output has each line encoded separately
    const output = screen.getByLabelText(/Output/i);
    const expected = `${encodeURIComponent('Line 1 with spaces')}\n${encodeURIComponent('Line 2 with ?&= chars')}`;
    expect(output).toHaveValue(expected);
  });

  it('handles copy button click', async () => {
    render(<UrlEncoder />);
    
    // Enter text to encode
    const input = screen.getByLabelText(/Input/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Click copy button
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    // Verify clipboard API was called with encoded value
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(encodeURIComponent('test'));
    
    // Verify button text changes to "Copied!" temporarily
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    
    // Advance timers to verify it returns to "Copy"
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  it('handles reset button click', () => {
    render(<UrlEncoder />);
    
    // Enter text
    const input = screen.getByLabelText(/Input/i);
    fireEvent.change(input, { target: { value: 'test value' } });
    
    // Verify output is shown
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(encodeURIComponent('test value'));
    
    // Click reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Verify both inputs are cleared
    expect(input).toHaveValue('');
    expect(output).toHaveValue('');
  });

  it('shows error message for invalid decode input', () => {
    render(<UrlEncoder />);
    
    // Switch to decode mode - find the toggle button containing 'Encode'
    const toggleButton = screen.getByRole('button', { 
      name: (content) => content.includes('Encode') 
    });
    fireEvent.click(toggleButton);
    
    // Enter invalid encoded text (missing % character)
    const input = screen.getByLabelText(/Input/i);
    fireEvent.change(input, { target: { value: '%invalid20text' } });
    
    // Check for error message in output
    const output = screen.getByLabelText(/Output/i) as HTMLInputElement;
    expect(output.value).toMatch(/Error:/);
  });

  it('handles empty input correctly', () => {
    render(<UrlEncoder />);
    
    const input = screen.getByLabelText(/Input/i);
    fireEvent.change(input, { target: { value: '' } });
    
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue('');
  });

  it('handles special URL characters correctly', () => {
    render(<UrlEncoder />);
    
    const input = screen.getByLabelText(/Input/i);
    const specialChars = '!@#$%^&*()_+{}:"<>?[];\',./`~';
    
    fireEvent.change(input, { target: { value: specialChars } });
    
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(encodeURIComponent(specialChars));
  });

  it('handles international characters correctly', () => {
    render(<UrlEncoder />);
    
    const input = screen.getByLabelText(/Input/i);
    const internationalText = '你好 こんにちは 안녕하세요 مرحبا Привет';
    
    fireEvent.change(input, { target: { value: internationalText } });
    
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(encodeURIComponent(internationalText));
  });

  it('handles very long input strings', () => {
    render(<UrlEncoder />);
    
    const input = screen.getByLabelText(/Input/i);
    const longText = 'a'.repeat(5000);
    
    fireEvent.change(input, { target: { value: longText } });
    
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(encodeURIComponent(longText));
  });

  it('correctly decodes reserved URI characters', () => {
    render(<UrlEncoder />);
    
    // Switch to decode mode
    const toggleButton = screen.getByRole('button', { 
      name: (content) => content.includes('Encode') 
    });
    fireEvent.click(toggleButton);
    
    // Enter encoded reserved characters
    const input = screen.getByLabelText(/Input/i);
    const encodedReserved = '%3A%2F%3F%23%5B%5D%40%21%24%26%27%28%29%2A%2B%2C%3B%3D';
    
    fireEvent.change(input, { target: { value: encodedReserved } });
    
    // Check that it decodes to the correct reserved characters
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(':/?#[]@!$&\'()*+,;=');
  });

  it('gracefully handles malformed URL sequences when decoding', () => {
    render(<UrlEncoder />);
    
    // Switch to decode mode
    const toggleButton = screen.getByRole('button', { 
      name: (content) => content.includes('Encode') 
    });
    fireEvent.click(toggleButton);
    
    // Test cases of malformed sequences
    const testCases = [
      { input: '%', expected: /Error:/ },
      { input: '%2', expected: /Error:/ },
      { input: '%XX', expected: /Error:/ },
      { input: 'abc%', expected: /Error:/ },
      { input: 'test%2Gwrong', expected: /Error:/ }
    ];
    
    const input = screen.getByLabelText(/Input/i);
    const output = screen.getByLabelText(/Output/i);
    
    testCases.forEach(testCase => {
      fireEvent.change(input, { target: { value: testCase.input } });
      expect(output.value).toMatch(testCase.expected);
    });
  });

  it('handles switching encoding methods with existing input', () => {
    render(<UrlEncoder />);
    
    // Enter text to encode
    const input = screen.getByLabelText(/Input/i);
    const testValue = 'Hello World! ?=&+/';
    
    fireEvent.change(input, { target: { value: testValue } });
    
    // Check initial encoding with encodeURIComponent
    const output = screen.getByLabelText(/Output/i);
    expect(output).toHaveValue(encodeURIComponent(testValue));
    
    // Switch to encodeURI
    const methodSelect = screen.getByLabelText(/Encoding Method/i);
    fireEvent.change(methodSelect, { target: { value: 'encodeURI' } });
    
    // Check output is updated with new encoding method
    expect(output).toHaveValue(encodeURI(testValue));
    
    // Switch to escape
    fireEvent.change(methodSelect, { target: { value: 'escape' } });
    
    // Check output is updated with new encoding method
    expect(output).toHaveValue(escape(testValue));
  });

  it('handles batch mode with empty lines', () => {
    render(<UrlEncoder />);
    
    // Toggle batch mode on
    const batchCheckbox = screen.getByLabelText(/Batch Mode/i);
    fireEvent.click(batchCheckbox);
    
    // Enter multi-line input with empty lines
    const input = screen.getByLabelText(/Input/i);
    const testValue = 'Line 1\n\nLine 3';
    
    fireEvent.change(input, { target: { value: testValue } });
    
    // Check output has each line encoded separately, including empty line
    const output = screen.getByLabelText(/Output/i);
    const expected = `${encodeURIComponent('Line 1')}\n${encodeURIComponent('')}\n${encodeURIComponent('Line 3')}`;
    expect(output).toHaveValue(expected);
  });
});