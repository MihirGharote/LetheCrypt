import { useState, useContext, useEffect } from 'react';
import { Box, Button, Typography, IconButton, useTheme, Stack, CircularProgress } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from './ThemeContext';

export default function Home() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/isauthenticated', { 
          method: 'GET',
          credentials: 'same-origin' 
        });
        const isAuthenticated = await response.json();
        
        if (isAuthenticated === true) {
          window.location.href = '/passwords';
        } else {
          setIsCheckingAuth(false);
        }
      } catch (err) {
        // Fallback to letting the user attempt a login if the auth check fails
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

if (isCheckingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Theme Toggle Button */}
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="large">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      {/* App Logo */}
      <img 
        src="/logo.svg" 
        alt="LetheCrypt Logo" 
        width="150" 
        style={{ marginBottom: '24px' }} 
      />
      
      {/* App Title */}
      <Typography 
        variant="h2" 
        component="h1" 
        gutterBottom 
        color="text.primary"
      >
        LetheCrypt
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 5, fontStyle: 'italic' }}>
        Secure by design. Forgotten by you.
      </Typography>

      {/* Action Buttons with Direct URL Routing */}
      <Stack direction="row" spacing={3}>
        <Button 
          component="a"
          href="/login"
          variant="contained" 
          color="primary" 
          size="large"
          sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
        >
          Login
        </Button>
        <Button 
          component="a"
          href="/signup"
          variant="outlined" 
          color="primary" 
          size="large"
          sx={{ fontWeight: 'bold', px: 4, py: 1.5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
        >
          Signup
        </Button>
      </Stack>
    </Box>
  );
}