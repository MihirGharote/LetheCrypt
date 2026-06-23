import { useState, useEffect, useContext, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  type SelectChangeEvent
} from '@mui/material';
import LockPersonOutlinedIcon from '@mui/icons-material/LockPersonOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import ShareIcon from '@mui/icons-material/Share';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CasinoIcon from '@mui/icons-material/Casino'; // Dice icon for password generation
import { ColorModeContext } from './ThemeContext';

interface PasswordFile {
  passwordID: number;
  name: string;
  author: string;
  content: string;
  createdTimestamp: string;
}

type SortField = 'name' | 'author' | 'createdTimestamp';

export default function Passwords() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [files, setFiles] = useState<PasswordFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sharing Dialog State
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sharingFileId, setSharingFileId] = useState<number | null>(null);
  const [receiver, setReceiver] = useState('');
  const [isSharingLoading, setIsSharingLoading] = useState(false);

  // Add Password Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAddLoading, setIsAddLoading] = useState(false);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/pass', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else {
        setError('Failed to load your vault. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'same-origin'
      });

      if (response.ok || response.status === 401) {
        window.location.href = '/login';
      } else {
        setError('Failed to log out safely. Please try again.');
      }
    } catch (err) {
      setError('Network error during logout operation.');
    }
  };

  const handleDelete = async (passwordID: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this password file?')) {
      return;
    }

    setError('');
    try {
      const response = await fetch(`/api/pass/${passwordID}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      if (response.status === 204) {
        setFiles(prev => prev.filter(file => file.passwordID !== passwordID));
      } else {
        setError('Failed to delete the selected password record.');
      }
    } catch (err) {
      setError('A connection issue prevented deletion.');
    }
  };

  const handleOpenShareDialog = (passwordID: number) => {
    setSharingFileId(passwordID);
    setIsShareDialogOpen(true);
    setError('');
  };

  const handleCloseShareDialog = () => {
    setIsShareDialogOpen(false);
    setSharingFileId(null);
    setReceiver('');
  };

  const handleShareSubmit = async () => {
    if (sharingFileId === null || !receiver.trim()) return;

    setIsSharingLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/copy/${sharingFileId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ receiver: receiver.trim() }),
      });

      if (response.status === 201) {
        handleCloseShareDialog();
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else {
        setError('Failed to share password file. Verify the recipient exists.');
        setIsShareDialogOpen(false);
      }
    } catch (err) {
      setError('A network error occurred while attempting to share.');
      setIsShareDialogOpen(false);
    } finally {
      setIsSharingLoading(false);
    }
  };

  const handleAdd = () => {
    setNewName('');
    setNewContent('');
    setError('');
    setIsAddDialogOpen(true);
  };

  // New Password Generator Function
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><,./-=';
    let generated = '';
    for (let i = 0; i < 16; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewContent(generated);
  };

  const handleAddSubmit = async () => {
    if (!newName.trim() || !newContent.trim()) return;

    setIsAddLoading(true);
    setError('');
    try {
      const response = await fetch('/api/pass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: newName.trim(),
          content: newContent.trim(),
        }),
      });

      if (response.status === 201) {
        setIsAddDialogOpen(false);
        fetchPasswords();
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else if (response.status === 409) {
        setError('A secret record item with that unique name identifier already exists inside your vault.');
        setIsAddDialogOpen(false);
      } else {
        setError('Could not process and save vault key creation parameters.');
        setIsAddDialogOpen(false);
      }
    } catch (err) {
      setError('Network infrastructure fault terminated database save loop operations.');
      setIsAddDialogOpen(false);
    } finally {
      setIsAddLoading(false);
    }
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as SortField);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'createdTimestamp') {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [files, sortBy, sortOrder]);

  return (
    <Box sx={{ minHeight: '100vh', p: 4, maxWidth: 800, margin: '0 auto', position: 'relative' }}>

      <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          size="small"
          sx={{ fontWeight: 'bold' }}
        >
          Logout
        </Button>
      </Stack>

      <Typography variant="h3" component="h1" gutterBottom color="primary" sx={{ mt: 2, fontWeight: "bold" }}>
        Your Passwords
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 4,
          mt: 4,
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="author">Author</MenuItem>
              <MenuItem value="createdTimestamp">Date Created</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={toggleSortOrder} size="small">
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </Stack>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ fontWeight: 'bold' }}
        >
          Add File
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {sortedFiles.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No files found. Create one to get started.</Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {sortedFiles.map((file, index) => (
                <ListItem
                  key={file.passwordID}
                  divider={index !== sortedFiles.length - 1}
                  onClick={() => {
                    localStorage.setItem('lethecrypt_current_password_id', String(file.passwordID));
                    window.location.href = '/edit';
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        edge="end"
                        aria-label="share"
                        onClick={() => handleOpenShareDialog(file.passwordID)}
                        color="info"
                      >
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(file.passwordID)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                  sx={{
                    '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <ListItemIcon>
                    <LockPersonOutlinedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        {file.name}
                      </Typography>
                    }
                    secondary={`Author: ${file.author} • Created: ${new Date(file.createdTimestamp).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Add Password Dialog Modal Context */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => !isAddLoading && setIsAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create Password Record</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide a distinct identifier name asset configuration and its secure plaintext data strings payload values.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Record Filename Identifier"
            type="text"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isAddLoading}
            sx={{ mb: 3 }}
          />

          {/* Action header row for password generator context (FIXED layout alignment within sx wrapper bounds) */}
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
              Secret Contents Vault Payload
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<CasinoIcon />}
              onClick={handleGeneratePassword}
              disabled={isAddLoading}
              sx={{ fontWeight: 'bold', py: 0.5 }}
            >
              Generate Password
            </Button>
          </Stack>

          <TextField
            margin="dense"
            label="Password Field Data"
            type="text"
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={isAddLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace'
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsAddDialogOpen(false)} disabled={isAddLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSubmit}
            variant="contained"
            disabled={!newName.trim() || !newContent.trim() || isAddLoading}
          >
            {isAddLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sharing Dialog Modal */}
      <Dialog open={isShareDialogOpen} onClose={handleCloseShareDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Share Vault Record</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Provide the identifier or username of the receiver you wish to pass a backup copy to.
          </DialogContentText>
          <TextField
            margin="dense"
            label="Receiver Username"
            type="text"
            fullWidth
            variant="outlined"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            disabled={isSharingLoading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseShareDialog} disabled={isSharingLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleShareSubmit}
            variant="contained"
            disabled={!receiver.trim() || isSharingLoading}
          >
            {isSharingLoading ? 'Sharing...' : 'Share'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}