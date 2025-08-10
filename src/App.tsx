import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
// Comment out the HelmetProvider since we're not using it
// import { HelmetProvider } from 'react-helmet-async';
import "./App.css";

import { ThemeProvider } from "./design-system/context/ThemeContext";
import { TranslationProvider } from "./context/TranslationContext";
import Header from "./layout/Header";
import { AppRoutes } from "./app/routes";
import Footer from "./layout/Footer";
import DynamicLinkProbeProvider from "./tools/dynamic-link-probe/components/DynamicLinkProbeProviderPanel";

function App() {
  return (
    // Remove HelmetProvider
    // <HelmetProvider>
    <ThemeProvider>
      <TranslationProvider>
        <Router>
          <DynamicLinkProbeProvider />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </TranslationProvider>
    </ThemeProvider>
    // </HelmetProvider>
  );
}

export default App;
