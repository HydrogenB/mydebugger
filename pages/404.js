import React from 'react';
import NotFound from '../src/components/NotFound';
import Head from 'next/head';

export default function Custom404() {
  return (
    <div>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="description" content="Page not found" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <NotFound />
    </div>
  );
}
