import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple Home and NotFound components
const Home = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Welcome to MyDebugger</h1>
    <p className="mb-4">
      This is a simplified version of the application. Some features may be missing.
    </p>
  </div>
);

const NotFound = () => (
  <div className="container mx-auto p-8 text-center">
    <h1 className="text-3xl font-bold mb-6">404 - Page Not Found</h1>
    <p className="mb-4">
      The page you are looking for does not exist.
    </p>
    <a href="/" className="text-blue-500 hover:text-blue-700">
      Return to Home
    </a>
  </div>
);

// Simple MainLayout for wrapping pages
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    <div className="container mx-auto py-6 px-4">
      {children}
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
};
