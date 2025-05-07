import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../design-system/components/inputs';
import { Card } from '../design-system/components/layout';
import { getIcon } from '../design-system/icons';

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card isElevated className="max-w-md text-center p-8">
        <div className="text-6xl font-bold text-gray-400 mb-4">{getIcon('error')}</div>
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, the page you are looking for might have been removed or doesn't exist.
        </p>
        <Link to="/">
          <Button 
            variant="primary"
            icon="home"
          >
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;