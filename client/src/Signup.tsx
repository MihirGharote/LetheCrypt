import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Paper,
    Alert,
    CircularProgress,
    Link,
    IconButton,
    useTheme
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from './ThemeContext';

export default function Signup() {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
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

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Frontend Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);

        try {
            // Send credentials securely in the JSON body, as defined by the OpenAPI spec
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (response.status === 201) {
                // Success! Redirect to dashboard
                window.location.href = '/passwords';
            } else if (response.status === 409) {
                // Handle 409 Conflict (e.g., username already exists)
                const errorData = await response.json();
                setError(errorData.message || 'This username is already taken. Please choose another.');
            } else if (response.status === 400) {
                // Handle 400 Bad Request
                const errorData = await response.json();
                setError(errorData.message || 'Invalid request. Please check your inputs.');
            } else if (response.status === 500) {
                // Handle 500 Internal Server Error
                const errorData = await response.json();
                setError(errorData.message || 'Internal server error. Please try again later.');
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
                p: 2,
            }}
        >
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
                    alignItems: 'center'
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Join LetheCrypt to secure your digital life.
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Account created successfully! <Link href="/login">Login here</Link>.
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        margin="normal"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={confirmPassword.length > 0 && password !== confirmPassword}
                        helperText={
                            confirmPassword.length > 0 && password !== confirmPassword
                                ? "Passwords do not match"
                                : ""
                        }
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={isLoading}
                        sx={{ mt: 4, mb: 2, py: 1.5, fontWeight: 'bold' }}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Link href="/login" underline="hover" color="primary.main">
                                Log in
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}