import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../features/auth/AuthContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp;