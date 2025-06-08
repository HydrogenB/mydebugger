# MyDebugger - Testing Guide

This document outlines the testing strategy and guidelines for the MyDebugger project.

## Testing Setup

MyDebugger uses the following testing technologies:

- **Jest**: Testing framework
- **React Testing Library**: UI component testing utility
- **@testing-library/jest-dom**: Custom Jest matchers for asserting on DOM elements

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Test Structure

Tests are organized following these patterns:

1. **Component tests**: Located next to the component files in `__tests__` directories
2. **Utility tests**: Located in `__tests__` directories next to utility files

## Testing Guidelines

### Component Testing Best Practices

1. **Test behavior, not implementation**
   - Focus on what the user would see and do, not internal component details
   - Avoid testing component props and state directly

2. **Use data-testid sparingly**
   - Prefer using accessible queries (byRole, byLabelText, byText) over data-testid
   - Only use data-testid when no semantic element or text is available

3. **Isolate tests**
   - Each test should work independently and clean up after itself
   - Mock external dependencies and context providers

4. **Test edge cases**
   - Error states
   - Loading states
   - Empty states
   - Boundary conditions

### Example Component Test

```tsx
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils/test-utils';
import Button from '../Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Utility Function Testing

1. **Focus on input/output relationships**
   - Test various input combinations and expected outputs
   - Test boundary conditions and edge cases

2. **Mock dependencies**
   - Use Jest's mocking capabilities to isolate the function under test

### Example Utility Test

```ts
import { analyzeToken } from '../analyzer';

describe('JWT Analyzer', () => {
  it('should report no findings for a valid token', () => {
    const jwt = {
      header: { alg: 'RS256', typ: 'JWT' },
      payload: {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600
      },
      signature: 'valid-signature'
    };
    
    const findings = analyzeToken(jwt);
    expect(findings).toHaveLength(0);
  });

  it('should detect expired tokens', () => {
    const jwt = {
      header: { alg: 'RS256', typ: 'JWT' },
      payload: {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired
      },
      signature: 'valid-signature'
    };
    
    const findings = analyzeToken(jwt);
    expect(findings.some(f => f.id === 'JWT-EXPIRED')).toBe(true);
  });
});
```

## Mocking

### Mocking Modules

```tsx
// Mock the entire module
jest.mock('../path/to/module');

// Mock specific exports
jest.mock('../path/to/module', () => ({
  functionName: jest.fn(),
  ClassName: jest.fn(() => ({
    methodName: jest.fn()
  }))
}));
```

### Mocking Context

The project provides custom context mocks in `src/test-utils/` for commonly used contexts like ThemeContext:

```tsx
import { MockThemeProvider } from '../../test-utils/mockThemeContext';

it('respects theme context', () => {
  render(
    <MockThemeProvider initialTheme="dark">
      <ComponentUsingTheme />
    </MockThemeProvider>
  );
  
  // Component should now render with dark theme
});
```

### Mocking Browser APIs

```tsx
// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
});
```

## Code Coverage

The project aims to maintain test coverage above:
- 80% overall line coverage
- 100% coverage for critical utility functions
- 75% coverage for UI components

View the latest coverage report by running:
```
npm run test:coverage
```

## Testing Async Code

```tsx
it('fetches data on mount', async () => {
  render(<DataFetchingComponent />);
  
  // Wait for loading state to finish
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for data to appear
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Testing Web Workers

Web workers (like the crypto worker in JWT tools) should be mocked to run synchronously in tests:

```tsx
// Mock web worker
jest.mock('../cryptoWorker', () => ({
  createCryptoWorker: jest.fn().mockReturnValue({
    sign: jest.fn().mockResolvedValue('mock-signature'),
    verify: jest.fn().mockResolvedValue(true)
  })
}));
```