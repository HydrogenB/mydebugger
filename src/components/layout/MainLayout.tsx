'use client';

import NavBar from './NavBar';
import Footer from './Footer';
import ErrorBoundary from './ErrorBoundary';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-grow py-4 px-2 md:px-4">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
