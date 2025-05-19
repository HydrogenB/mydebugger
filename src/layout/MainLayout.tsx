import React, { ReactNode } from 'react';
import Head from 'next/head';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title = 'MyDebugger',
  description = 'Web developer debugging toolkit'
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <header className="bg-blue-700 dark:bg-blue-900 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">MyDebugger</h1>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 py-4">
        <div className="container mx-auto px-4 text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} MyDebugger
        </div>
      </footer>
    </div>
  );
};
