import React from 'react';
import ReactDOM from 'react-dom/client';
import Passwords from './Passwords';
import { AppThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Passwords />
    </AppThemeProvider>
  </React.StrictMode>
);