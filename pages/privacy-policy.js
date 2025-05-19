import React from 'react';
import Head from 'next/head';
import PrivacyPolicy from '../src/pages/PrivacyPolicy';

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Head>
        <title>Privacy Policy - MyDebugger</title>
        <meta name="description" content="Privacy Policy for MyDebugger" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="container mx-auto py-6 px-4">
        <PrivacyPolicy />
      </main>
    </div>
  );
}
