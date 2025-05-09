import React from 'react';
// import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app'; // This might still cause issues if not a Next.js project.
                                    // For Vite, this structure is different.
                                    // This file might need to be removed or significantly changed.
import '../styles/globals.css'; // Adjust path if needed

// This _app.tsx structure is Next.js specific.
// For a Vite app, you typically have a main App component rendered by main.tsx.
// If this file is intended to be the root, it needs to be adapted.

function MyApp({ Component, pageProps }: { Component: React.ElementType; pageProps: any }) { // Basic types for Vite
  // const { session, ...restPageProps } = pageProps; // session might not exist
  return (
    // <SessionProvider session={session}>
      <Component {...pageProps} />
    // </SessionProvider>
  );
}

export default MyApp;