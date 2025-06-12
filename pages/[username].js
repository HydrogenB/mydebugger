import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { LoadingSpinner } from '../src/design-system/components/feedback';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';

export default function VCardPage() {
  const router = useRouter();
  const { username } = router.query;
  
  return (
    <>
      <Head>
        <title>Feature Disabled</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="container mx-auto px-4 py-12">
        <div className={`max-w-md mx-auto ${TOOL_PANEL_CLASS}`}>
          <h1 className="text-2xl font-bold mb-4">Feature Disabled</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The namecard and VCard features have been disabled in this version of the application.
          </p>
          <div className="flex justify-center">
            <a 
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Remove getServerSideProps to avoid requiring authentication
