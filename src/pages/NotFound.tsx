import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../shared/design-system/components/inputs';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl mb-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button 
        variant="primary"
        href="/"
      >
        Return Home
      </Button>
    </div>
  );
};

export default NotFound;