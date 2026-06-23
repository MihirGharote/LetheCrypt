import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const getInitialTheme = (): 'light' | 'dark' => {
  const savedMode = localStorage.getItem('lethecrypt_theme');
  if (savedMode === 'light' || savedMode === 'dark') {
    return savedMode;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(getInitialTheme);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  useEffect(() => {
    const savedMode = localStorage.getItem('lethecrypt_theme');
    if (!savedMode) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('lethecrypt_theme', newMode);
          // Also update the document element for the index.html background sync
          document.documentElement.setAttribute('data-theme', newMode);
          return newMode;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // Frost Palette
          primary: { main: '#88c0d0' },    // Nord 8 (Primary Accent)
          secondary: { main: '#81a1c1' },  // Nord 9 (Secondary Accent)
          info: { main: '#8fbcbb' },       // Nord 10 (Deep Blue Info)
          
          // Aurora Palette
          error: { main: '#bf616a' },      // Nord 11 (Red)
          warning: { main: '#ebcb8b' },    // Nord 13 (Yellow)
          success: { main: '#a3be8c' },    // Nord 14 (Green)
          
          background: {
            // Polar Night (Dark) & Snow Storm (Light) mappings
            default: mode === 'light' ? '#eceff4' : '#2e3440', // Nord 6 / Nord 0
            paper: mode === 'light' ? '#e5e9f0' : '#3b4252',   // Nord 5 / Nord 1
          },
          text: {
            primary: mode === 'light' ? '#2e3440' : '#eceff4', // Nord 0 / Nord 6
            secondary: mode === 'light' ? '#4c566a' : '#d8dee9', // Nord 3 / Nord 4
          }
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};