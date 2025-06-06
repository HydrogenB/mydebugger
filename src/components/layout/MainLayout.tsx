'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Header, AppFooter, Page } from '@/view/layout';

const links = [
  { href: '/#tools', label: 'Tools' },
  { href: '/about', label: 'About' },
];

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Page
      header={<Header links={links} />}
      footer={<AppFooter links={[{ href: '/about', label: 'About' }]} />}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </Page>
  );
}
