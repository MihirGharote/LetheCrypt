import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login';
import { AppThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Login />
    </AppThemeProvider>
  </React.StrictMode>
);