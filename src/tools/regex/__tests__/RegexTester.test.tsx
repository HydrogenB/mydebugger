import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils/test-utils';
import RegexTester from '../RegexTester';
import { getToolByRoute } from '../../index';

// Mock the getToolByRoute function
jest.mock('../../index', () => ({
  getToolByRoute: jest.fn().mockReturnValue({
    icon: 'regex',
    description: 'Test and debug regular expressions'
  })
}));

// Mock Helmet to avoid issues in tests
jest.mock('react-helmet', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <div data-testid="helmet-mock">{children}</div>
}));

describe('RegexTester Component', () => {
  it('renders the regex tester tool', () => {
    render(<RegexTester />);
    
    expect(screen.getByLabelText(/Regular Expression/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Test String/i)).toBeInTheDocument();
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
  });

  it('highlights matches when a valid regex pattern is entered', () => {
    render(<RegexTester />);
    
    // Enter regex pattern
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: 'test' } });
    
    // Enter test string
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: 'this is a test string with test in it' } });
    
    // Check that it shows 2 matches
    expect(screen.getByText(/2 matches/i)).toBeInTheDocument();
  });

  it('handles regex pattern with capture groups', () => {
    render(<RegexTester />);
    
    // Enter regex pattern with capture group
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: '(\\w+)@(\\w+)\\.(\\w+)' } });
    
    // Enter test string with email
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: 'contact us at test@example.com' } });
    
    // Click to show debug info
    fireEvent.click(screen.getByText(/Show Details/i));
    
    // Check capture groups are displayed
    expect(screen.getByText(/Match 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Capture Groups/i)).toBeInTheDocument();
    expect(screen.getByText(/#1/i)).toBeInTheDocument();
  });

  it('shows error message for invalid regex', () => {
    render(<RegexTester />);
    
    // Enter invalid regex pattern
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: '(unclosed group' } });
    
    // Enter test string
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: 'test string' } });
    
    // Check that error message is displayed
    expect(screen.getByText(/Invalid regular expression/i)).toBeInTheDocument();
  });

  it('toggles regex flags when clicked', () => {
    render(<RegexTester />);
    
    // Initial state should have global flag
    const flagsInput = screen.getByPlaceholderText(/flags/i);
    expect(flagsInput).toHaveValue('g');
    
    // Toggle case-insensitive flag on
    const caseInsensitiveButton = screen.getByTitle(/Case-insensitive/i);
    fireEvent.click(caseInsensitiveButton);
    expect(flagsInput).toHaveValue('gi');
    
    // Toggle global flag off
    const globalButton = screen.getByTitle(/Find all matches/i);
    fireEvent.click(globalButton);
    expect(flagsInput).toHaveValue('i');
  });

  it('applies example when clicked', () => {
    render(<RegexTester />);
    
    // Find and click on email example
    const emailExample = screen.getByText(/Email validation/i).closest('div');
    fireEvent.click(emailExample!);
    
    // Check pattern and input are updated
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    expect(patternInput).not.toHaveValue('');
    
    const stringInput = screen.getByLabelText(/Test String/i);
    expect(stringInput).toHaveValue(expect.stringContaining('info@example.com'));
    
    // Check that matches are found
    expect(screen.getByText(/2 matches/i)).toBeInTheDocument();
  });

  // Edge case: test handling of empty matches
  it('handles regex patterns that match empty strings', () => {
    render(<RegexTester />);
    
    // Enter regex pattern that matches empty strings
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: 'a*' } });
    
    // Enter test string
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: 'ab' } });
    
    // This should find multiple matches including empty strings
    expect(screen.getByText(/matches/i)).toBeInTheDocument();
  });

  // Edge case: test handling of lookaheads/lookbehinds
  it('supports advanced regex features like lookaheads', () => {
    render(<RegexTester />);
    
    // Enter regex pattern with lookahead
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: '\\w+(?=ing)' } });
    
    // Enter test string
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: 'I enjoy coding, running, and swimming' } });
    
    // This should match "runn" and "swimm"
    expect(screen.getByText(/2 matches/i)).toBeInTheDocument();
  });

  // Edge case: test very large inputs
  it('handles large input strings', () => {
    render(<RegexTester />);
    
    // Create a large input string
    const largeInput = 'test '.repeat(1000);
    
    // Enter regex pattern
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: 'test' } });
    
    // Enter large test string
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: largeInput } });
    
    // This should find 1000 matches
    expect(screen.getByText(/1000 matches/i)).toBeInTheDocument();
  });

  // Edge case: test Unicode characters
  it('correctly handles Unicode characters with u flag', () => {
    render(<RegexTester />);
    
    // Enter regex pattern for emoji
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: '[\\u{1F600}-\\u{1F64F}]' } });
    
    // Toggle Unicode flag
    const unicodeButton = screen.getByTitle(/Unicode/i);
    fireEvent.click(unicodeButton);
    
    // Enter test string with emoji
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: 'I am happy 😊 and excited 😃' } });
    
    // This should find 2 emoji matches
    expect(screen.getByText(/2 matches/i)).toBeInTheDocument();
  });

  // Edge case: test sticky flag
  it('correctly uses the sticky flag', () => {
    render(<RegexTester />);
    
    // Enter pattern
    const patternInput = screen.getByLabelText(/Regular Expression/i);
    fireEvent.change(patternInput, { target: { value: '\\w+' } });
    
    // Remove global flag and add sticky flag
    const flagsInput = screen.getByPlaceholderText(/flags/i);
    fireEvent.change(flagsInput, { target: { value: 'y' } });
    
    // Enter test string
    const stringInput = screen.getByLabelText(/Test String/i);
    fireEvent.change(stringInput, { target: { value: 'test string' } });
    
    // With sticky flag, it should only match at position 0, so just one match
    expect(screen.getByText(/1 match/i)).toBeInTheDocument();
  });
});