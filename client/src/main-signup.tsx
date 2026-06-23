import React from 'react';
import ReactDOM from 'react-dom/client';
import Signup from './Signup';
import { AppThemeProvider } from './ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Signup />
    </AppThemeProvider>
  </React.StrictMode>
);