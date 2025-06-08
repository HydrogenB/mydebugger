import { AppProps } from 'next/app'; // This might still cause issues if not a Next.js project.
                                    // For Vite, this structure is different.
                                    // This file might need to be removed or significantly changed.
import '../styles/globals.css'; // Adjust path if needed

// This _app.tsx structure is Next.js specific.
// For a Vite app, you typically have a main App component rendered by main.tsx.

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;