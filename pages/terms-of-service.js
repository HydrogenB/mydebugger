import React from 'react';
import Head from 'next/head';
import TermsOfService from '../src/pages/TermsOfService';

export default function TermsOfServicePage() {
  return (
    <div>
      <Head>
        <title>Terms of Service - MyDebugger</title>
        <meta name="description" content="Terms of Service for MyDebugger" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className="container mx-auto py-6 px-4">
        <TermsOfService />
      </main>
    </div>
  );
}
