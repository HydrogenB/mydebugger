import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
// Import the enhanced dark mode styles
import './design-system/styles/darkMode.css';
// Import enhanced component styles
import './design-system/styles/components/searchBar.css';
import './design-system/styles/components/toolCard.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);