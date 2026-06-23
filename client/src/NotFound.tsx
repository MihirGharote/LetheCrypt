import { useContext } from 'react';
import { Box, Button, Typography, IconButton, useTheme, Paper } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from './ThemeContext';

export default function NotFound() {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                position: 'relative',
                p: 2,
            }}
        >
            {/* Theme Toggle Button */}
            <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="large">
                    {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: 'transparent', // Blends with the background
                    textAlign: 'center'
                }}
            >
                <Typography
                    variant="h1"
                    component="h1"
                    color="primary"
                    sx={{ fontSize: { xs: '6rem', md: '10rem' }, lineHeight: 1, fontWeight: "bold" }}
                >
                    404
                </Typography>

                <Typography variant="h5" component="h2" gutterBottom sx={{fontWeight: "bold"}} color="text.primary">
                    Memory Not Found
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '400px' }}>
                    It looks like this page slipped into the River Lethe. The link you followed might be broken, or the page may have been removed.
                </Typography>

                <Button
                    component="a"
                    href="/"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
                >
                    Return to Safe Harbor
                </Button>
            </Paper>
        </Box>
    );
}