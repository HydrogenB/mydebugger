import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@design-system'; // Assuming Card is exported from the main design system entry
import { getTools } from '../tools';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Welcome to MyDebugger</h1>
      <p>Select a tool from the navigation to get started.</p>
    </div>
  );
};

export default Home;