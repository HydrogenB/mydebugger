// jest.setup.js
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock the ThemeContext
jest.mock('@/components/layout/ThemeRegistry', () => ({
  useThemeContext: () => ({
    mode: 'light',
    toggleMode: jest.fn(),
  }),
  ThemeContext: {
    Provider: ({ children }) => children,
  },
}));
