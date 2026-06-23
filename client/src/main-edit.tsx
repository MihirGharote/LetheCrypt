import React from 'react';
import ReactDOM from 'react-dom/client';
import Edit from './Edit';
import { AppThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Edit />
    </AppThemeProvider>
  </React.StrictMode>
);