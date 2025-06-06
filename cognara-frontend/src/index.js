import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import App from './App';

// 1. Get the root element
const container = document.getElementById('root');

// 2. Create a root
const root = createRoot(container);

// 3. Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);