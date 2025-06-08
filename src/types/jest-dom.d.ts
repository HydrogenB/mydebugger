import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | string[] | number | null): R;
      toHaveStyle(css: string | Record<string, unknown>): R;
    }
  }
}

// This is necessary to make it a module
export {};