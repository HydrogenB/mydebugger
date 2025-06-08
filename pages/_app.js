// This file ensures Next.js API routes are properly handled on Vercel

import React from 'react';

// This is a shell component that won't be used for rendering
// since we're using React Router for client-side routing
const App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App;
