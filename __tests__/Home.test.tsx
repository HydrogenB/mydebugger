/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../src/pages/Home';
import { TranslationProvider } from '../src/context/TranslationContext';
// Stub CSS import for Jest
jest.mock('../src/pages/Home.css', () => ({}), { virtual: true });
// Simplify navigation components to avoid complex hooks in tests
jest.mock('../src/design-system', () => {
  const actual = jest.requireActual('../src/design-system');
  return {
    ...actual,
    TabGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Tab: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabPanel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('Home page', () => {
  it('renders hero heading', () => {
    render(
      <TranslationProvider>
        <Home />
      </TranslationProvider>
    );
    const heading = screen.getByRole('heading', { name: /developer tools/i });
    expect(heading).toBeInTheDocument();
  });
});
