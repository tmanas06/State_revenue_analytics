import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root element
const container = document.getElementById('root');

// Create a root and render the app
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable Hot Module Replacement (HMR) in development
if (import.meta.hot) {
  import.meta.hot.accept();
}
