import React from 'react';
import Head from 'next/head';
import { Card } from '../../src/design-system/components/layout';

export default function VCardEditorPage() {
  return (
    <>
      <Head>
        <title>Feature Disabled</title>
        <meta name="description" content="This feature has been disabled." />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">VCard Editor</h1>
          <p className="mb-6">
            The VCard editor feature has been disabled in this version of the application.
          </p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </a>
        </Card>
      </div>
    </>
  );
}
