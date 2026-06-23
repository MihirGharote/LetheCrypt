import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Alert,
  IconButton,
  useTheme,
  CircularProgress
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from './ThemeContext';

export default function Login() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
        // Ensure the browser accepts the Set-Cookie header from the response
        // Use 'include' if your API is on a different domain/subdomain
        credentials: 'same-origin',
      });

      if (response.status === 200) {
        // The backend has successfully set the httpOnly cookie.
        // The browser will now automatically attach it to future requests.
        window.location.href = '/passwords';
      } else if (response.status === 401) {
        // Handle 401 Unauthorized (Invalid credentials)
        const errorData = await response.json();
        setError(errorData.message || 'Invalid username or password.');
      } else if (response.status === 400) {
        // Handle 400 Bad Request
        const errorData = await response.json();
        setError(errorData.message || 'Invalid request. Please check your inputs.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        p: 2
      }}
    >
      {/* Theme Toggle Button */}
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="large">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }} color="primary">
          Welcome Back
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Access your LetheCrypt vault.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ mt: 4, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Box
                component="a"
                href="/signup"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign Up
              </Box>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}