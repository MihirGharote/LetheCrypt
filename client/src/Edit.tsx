import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from './ThemeContext';

interface PasswordFile {
  passwordID: number;
  name: string;
  author: string;
  content: string;
  createdTimestamp: string;
}

export default function Edit() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [passwordID, setPasswordID] = useState<number | null>(null);
  const [password, setPassword] = useState<PasswordFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');

  // Editing state fields
  const [isEditable, setIsEditable] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Copy state
  const [hasCopied, setHasCopied] = useState(false);

  // Dialog Overlays State
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareReceiver, setShareReceiver] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const rawID = localStorage.getItem('lethecrypt_current_password_id');
    const parsedID = Number(rawID);

    if (!rawID || isNaN(parsedID)) {
      window.location.href = '/passwords';
      return;
    }

    setPasswordID(parsedID);
    fetchPasswordDetail(parsedID);
  }, []);

  const fetchPasswordDetail = async (id: number) => {
    setIsLoading(true);
    setGlobalError('');
    try {
      const response = await fetch(`/api/pass/${id}`, {
        method: 'GET',
        credentials: 'same-origin'
      });

      if (response.ok) {
        const data: PasswordFile = await response.json();
        setPassword(data);
        setTextContent(data.content);
        setRenameValue(data.name);
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else {
        window.location.href = '/passwords';
      }
    } catch (err) {
      setGlobalError('A connection problem prevented resource loading.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem('lethecrypt_current_password_id');
    window.location.href = '/passwords';
  };

  const handleToggleEdit = () => {
    if (isEditable) {
      // FIX: Revert text content back to original database string if user cancels
      if (password) {
        setTextContent(password.content);
      }
    }
    setIsEditable(!isEditable);
  };

  const handleSaveContent = async () => {
    if (!passwordID) return;
    setIsSaving(true);
    setGlobalError('');

    try {
      const response = await fetch(`/api/pass/${passwordID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ content: textContent })
      });

      if (response.ok) {
        setIsEditable(false);
        if (password) setPassword({ ...password, content: textContent });
      } else if (response.status === 401) {
        window.location.href = '/login';
      } else {
        setGlobalError('Failed to commit modifications to server.');
      }
    } catch (err) {
      setGlobalError('Network error context failed patch transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameSubmit = async () => {
    if (!passwordID || !renameValue.trim()) return;
    setIsActionLoading(true);
    setGlobalError('');

    try {
      const response = await fetch(`/api/pass/${passwordID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name: renameValue.trim() })
      });

      if (response.ok) {
        if (password) setPassword({ ...password, name: renameValue.trim() });
        setIsRenameOpen(false);
      } else {
        setGlobalError('Failed to rename target resource item.');
        setIsRenameOpen(false);
      }
    } catch (err) {
      setGlobalError('Network connection issue dropped request context.');
      setIsRenameOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleShareSubmit = async () => {
    if (!passwordID || !shareReceiver.trim()) return;
    setIsActionLoading(true);
    setGlobalError('');

    try {
      const response = await fetch(`/api/copy/${passwordID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ receiver: shareReceiver.trim() }) 
      });

      if (response.status === 201) {
        setIsShareOpen(false);
        setShareReceiver('');
      } else {
        setGlobalError('Failed sharing file copy configuration.');
        setIsShareOpen(false);
      }
    } catch (err) {
      setGlobalError('Network framework exception during proxy transmission.');
      setIsShareOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!passwordID) return;
    if (!window.confirm('Are you absolutely sure you want to permanently delete this secret record?')) return;

    try {
      const response = await fetch(`/api/pass/${passwordID}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      if (response.status === 204) {
        handleBack();
      } else {
        setGlobalError('Failed to complete background erasure procedures.');
      }
    } catch (err) {
      setGlobalError('Network error interrupted delete execution.');
    }
  };

  const handleCopyToClipboard = () => {
    if (isEditable) return; // Safeguard route
    navigator.clipboard.writeText(textContent).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }).catch(() => {
      setGlobalError('Failed to copy to clipboard. Permission denied.');
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', p: 4, maxWidth: 900, margin: '0 auto', position: 'relative' }}>
      
      <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Stack>

      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack} 
        sx={{ mb: 4, fontWeight: 'bold' }}
      >
        Back to Vault
      </Button>

      {globalError && <Alert severity="error" sx={{ mb: 3 }}>{globalError}</Alert>}

      {password && (
        <Box component={Paper} elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              mb: 4,
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' }
            }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h4" component="h1" sx={{fontWeight: "bold"}} color="primary">
                  {password.name}
                </Typography>
                <IconButton onClick={() => setIsRenameOpen(true)} color="secondary" size="small" aria-label="rename file">
                  <DriveFileRenameOutlineIcon />
                </IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Author: {password.author} • Record Key ID: {password.passwordID}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<ShareIcon />} color="info" onClick={() => setIsShareOpen(true)}>
                Share
              </Button>
              <Button variant="outlined" startIcon={<DeleteIcon />} color="error" onClick={handleDelete}>
                Delete
              </Button>
            </Stack>
          </Stack>

          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              mb: 2, 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}
          >
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color={isEditable ? "warning" : "inherit"}
                startIcon={isEditable ? <EditOffIcon /> : <EditIcon />}
                onClick={handleToggleEdit}
              >
                {isEditable ? "Cancel Edit" : "Edit"}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveContent}
                disabled={!isEditable || isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </Stack>

            {/* FIX: Tooltip dynamically reflects state, and button uses disabled={isEditable} */}
            <Tooltip title={isEditable ? "Cannot copy while editing" : (hasCopied ? "Copied!" : "Copy to Clipboard")}>
              <span>
                <Button
                  variant="outlined"
                  color={hasCopied ? "success" : "secondary"}
                  startIcon={hasCopied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopyToClipboard}
                  disabled={isEditable}
                  sx={{ fontWeight: 'bold' }}
                >
                  {hasCopied ? "Copied!" : "Copy"}
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <TextField
            multiline
            rows={14}
            fullWidth
            variant="outlined"
            placeholder="No content saved inside this secure password field container..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            slotProps={{
              input: { readOnly: !isEditable }
            }}
            sx={{
              fontFamily: 'monospace',
              bgcolor: isEditable ? 'background.paper' : 'action.hover',
              borderRadius: 1,
              transition: 'background-color 0.2s ease',
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
              }
            }}
          />
        </Box>
      )}

      {/* Dialog Modules */}
      <Dialog open={isRenameOpen} onClose={() => setIsRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Rename Record</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Document Name"
            fullWidth
            variant="outlined"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            disabled={isActionLoading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsRenameOpen(false)} disabled={isActionLoading}>Cancel</Button>
          <Button onClick={handleRenameSubmit} variant="contained" disabled={!renameValue.trim() || isActionLoading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isShareOpen} onClose={() => setIsShareOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Share Copy</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>
            Enter target username to proxy mirror file assets copy definitions securely.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient Username"
            fullWidth
            variant="outlined"
            value={shareReceiver}
            onChange={(e) => setShareReceiver(e.target.value)}
            disabled={isActionLoading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsShareOpen(false)} disabled={isActionLoading}>Cancel</Button>
          <Button onClick={handleShareSubmit} variant="contained" disabled={!shareReceiver.trim() || isActionLoading}>
            Share File
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}