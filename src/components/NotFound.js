import React from 'react';
import Link from 'next/link';

const NotFound = () => (
  <div className="container mx-auto p-8 text-center">
    <h1 className="text-3xl font-bold mb-6">404 - Page Not Found</h1>
    <p className="mb-4">
      The page you are looking for does not exist.
    </p>
    <Link href="/" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500">
      Return to Home
    </Link>
  </div>
);

export default NotFound;
