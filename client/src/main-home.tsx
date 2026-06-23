import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './Home';
import { AppThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Home />
    </AppThemeProvider>
  </React.StrictMode>
);