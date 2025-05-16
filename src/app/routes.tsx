import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Base64ImagePage from '../pages/Base64ImagePage';

// Simple Home and NotFound components
const Home = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold mb-6">Welcome to MyDebugger</h1>
    <p className="mb-4">
      This is a simplified version of the application. Some features may be missing.
    </p>
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Available Tools</h2>
      <ul className="list-disc pl-6">
        <li className="mb-2">
          <Link to="/base64-image" className="text-blue-500 hover:text-blue-700">
            Base64 Image Debugger
          </Link>
          <span className="ml-2 text-gray-600">- View and debug base64 encoded images</span>
        </li>
      </ul>
    </div>
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
      <Route path="/base64-image" element={<MainLayout><Base64ImagePage /></MainLayout>} />
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
};
