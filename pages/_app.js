import React from 'react';
import { ThemeProvider } from '../src/app/providers/ThemeProvider';
import '../src/index.css';
import '../src/root-styles.css';
import '../src/design-system/styles/darkMode.css';
import '../src/design-system/styles/components/searchBar.css';
import '../src/design-system/styles/components/toolCard.css';
import '../src/App.css';
import Header from '../src/layout/NextHeader';
import Footer from '../src/layout/NextFooter';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;
