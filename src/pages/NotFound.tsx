import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Sorry, the page you are looking for might have been removed or doesn't exist.
      </p>
      <Link 
        to="/"
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;