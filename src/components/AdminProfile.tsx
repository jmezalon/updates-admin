import { BASE_URL } from '../constants/config';
import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField,
  Alert,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { Navbar } from './Navbar';
import { useAuth } from '../auth/AuthContext';

interface AdminProfileProps {
  onBack: () => void;
}

export function AdminProfile({ onBack }: AdminProfileProps) {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const authToken = localStorage.getItem('authToken');

  const handleProfileSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        setEditing(false);
        setSuccess('Profile updated successfully!');
        // Refresh user data to reflect changes
        await refreshUser();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error while updating profile');
    }
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    // Clear any previous errors and success messages
    setError('');
    setSuccess('');
    
    // Frontend validation
    if (!passwordData.currentPassword) {
      setError('Current password is required');
      return;
    }
    
    if (!passwordData.newPassword) {
      setError('New password is required');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const responseData = await response.json();
      
      if (response.ok) {
        setPasswordDialogOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccess('Password changed successfully!');
      } else {
        // Display error message from backend in the dialog
        setError(responseData.error || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError('Network error while changing password. Please try again.');
    }
    
    setLoading(false);
  };

  const handleAccountDeletion = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BASE_URL}/users/${user?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setSuccess('Account deleted successfully. You will be logged out.');
        // Log out after a brief delay
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Network error while deleting account');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Box sx={{ pt: 10, width: '100%' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <IconButton onClick={onBack} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', flexGrow: 1 }}>
              My Profile
            </Typography>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Profile Overview */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 3, 
                    bgcolor: 'secondary.main',
                    fontSize: '2rem'
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                    {user?.email}
                  </Typography>
                  <Chip 
                    label={user?.role === 'superuser' ? 'Super Admin' : 'Church Admin'} 
                    color={user?.role === 'superuser' ? 'error' : 'primary'}
                    size="small"
                    icon={user?.role === 'superuser' ? <AdminIcon /> : <PersonIcon />}
                  />
                </Box>
              </Box>

              {/* Account Info */}
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Full Name" 
                    secondary={user?.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Address" 
                    secondary={user?.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Church Assignment" 
                    secondary={
                      user?.churchAssignments?.length 
                        ? user.churchAssignments[0].church_name 
                        : 'No church assigned'
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                  Profile Settings
                </Typography>
                {!editing ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileSave}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => {
                        setEditing(false);
                        setProfileData({ name: user?.name || '', email: user?.email || '' });
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={editing ? profileData.name : (user?.name || '')}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={editing ? profileData.email : (user?.email || '')}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'secondary.main', mb: 3 }}>
                Security Settings
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Change Password
                </Button>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" sx={{ color: 'error.main', mb: 1 }}>
                  Danger Zone
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Once you delete your account, there is no going back. Please be certain.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Delete Account
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Password Change Dialog */}
          <Dialog 
            open={passwordDialogOpen} 
            onClose={() => {
              setPasswordDialogOpen(false);
              setError('');
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }} 
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setError('');
                    setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                  }}
                  error={!!error && error.includes('current password')}
                  helperText={error.includes('current password') ? error : ''}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setError('');
                    setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                  }}
                  error={!!error && (error.includes('New password') || error.includes('password must'))}
                  helperText={
                    error.includes('New password') || error.includes('password must') 
                      ? error 
                      : 'Must be at least 6 characters long'
                  }
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setError('');
                    setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                  }}
                  error={!!error && error.includes('do not match')}
                  helperText={error.includes('do not match') ? error : ''}
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={() => {
                  setPasswordDialogOpen(false);
                  setError('');
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handlePasswordChange}
                disabled={
                  loading || 
                  !passwordData.currentPassword || 
                  !passwordData.newPassword || 
                  !passwordData.confirmPassword ||
                  passwordData.newPassword.length < 6 ||
                  passwordData.newPassword !== passwordData.confirmPassword
                }
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Account Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you absolutely sure you want to delete your account?
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                This action cannot be undone. This will permanently delete your account and remove all associated data.
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>This will:</strong>
                  <br />• Delete your user account permanently
                  <br />• Remove you from any church assignments
                  <br />• Log you out immediately
                </Typography>
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAccountDeletion} 
                color="error"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
}
