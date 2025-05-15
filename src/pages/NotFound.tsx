import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold mb-4">404 - Not Found</h1>
      <p className="mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-blue-600 hover:underline">
        Return to Home
      </a>
    </div>
  );
};

export default NotFound;