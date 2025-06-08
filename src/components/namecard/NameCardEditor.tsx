import React from 'react';
import { Card, Button } from '@design-system'; // Assuming these are imported from the main design system entry

const NameCardEditor: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card isElevated className="mb-8">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Name Card Feature Disabled</h2>
          <p className="mb-6">
            The Name Card feature has been disabled in this version of the application.
          </p>
          <Button
            variant="primary"
            href="/"
          >
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NameCardEditor;
