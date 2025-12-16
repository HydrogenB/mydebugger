import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
// Comment out the HelmetProvider since we're not using it
// import { HelmetProvider } from 'react-helmet-async';
import "./App.css";

import { ThemeProvider } from "./design-system/context/ThemeContext";
import { TranslationProvider } from "./context/TranslationContext";
import Header from "./layout/Header";
import { AppRoutes } from "./app/routes";
import Footer from "./layout/Footer";
import DynamicLinkProbeProvider from "./tools/dynamic-link-probe/components/DynamicLinkProbeProviderPanel";
import AnalyticsBridge from "./pages/_app";

function App() {
  return (
    // Remove HelmetProvider
    // <HelmetProvider>
    <ThemeProvider>
      <TranslationProvider>
        <Router>
          <AnalyticsBridge />
          <DynamicLinkProbeProvider />
          <div className="app-ambient-bg flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
          </div>
          <SpeedInsights />
        </Router>
      </TranslationProvider>
    </ThemeProvider>
    // </HelmetProvider>
  );
}

export default App;
