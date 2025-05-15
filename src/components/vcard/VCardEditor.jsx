import React, { useState } from 'react';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';

const VCardEditor = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <Card>
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">VCard Feature Disabled</h2>
          <p className="mb-6">
            The VCard feature has been disabled in this version of the application.
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

export default VCardEditor;
