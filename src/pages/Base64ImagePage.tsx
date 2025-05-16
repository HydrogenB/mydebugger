import React from 'react';
import { Link } from 'react-router-dom';
import Base64ImageDebugger from '../tools/base64-image/Base64ImageDebugger';

const Base64ImagePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Base64 Image Debugger</h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        This tool helps you debug and visualize base64-encoded images. 
        Paste your base64 string to see a preview and get detailed information about the image.
      </p>
      
      <div className="mb-8">
        <Base64ImageDebugger />
      </div>
    </div>
  );
};

export default Base64ImagePage;
