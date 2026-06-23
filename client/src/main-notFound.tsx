import React from 'react';
import ReactDOM from 'react-dom/client';
import NotFound from './NotFound';
import { AppThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <NotFound />
    </AppThemeProvider>
  </React.StrictMode>
);