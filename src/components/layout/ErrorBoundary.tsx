'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/view/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and display errors gracefully
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="mx-auto my-8 max-w-2xl rounded-md border p-4 text-center">
          <div className="mb-4 text-5xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-semibold text-red-600">Something went wrong</h1>
          <p className="mb-4">We apologize for the inconvenience. The application encountered an unexpected error.</p>
          <pre className="mb-4 overflow-x-auto rounded bg-gray-100 p-2 text-left text-sm">
            {this.state.error?.toString() || 'Unknown error'}
          </pre>
          <div className="flex justify-center gap-2">
            <Button onClick={this.handleReset}>Try Again</Button>
            <Link href="/" className="rounded border border-blue-600 px-3 py-1 text-blue-600 hover:bg-blue-50">
              Go to Homepage
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
