import { BASE_URL } from '../constants/config';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { Navbar } from './Navbar';
import { useAuth } from '../auth/AuthContext';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  churchAssignments?: Array<{
    id: number;
    church_id: number;
    church_name: string;
  }>;
}

interface Church {
  id: number;
  name: string;
  senior_pastor: string;
  contact_email: string;
  created_at: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function SuperuserDashboard() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Admin Dialog State
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('church_admin');

  // Assign Admin Dialog State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedChurchId, setSelectedChurchId] = useState<number | null>(null);

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(''); // Clear any existing errors
    try {
      // Load users
      const usersResponse = await fetch(`${BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } else {
        throw new Error('Failed to load users');
      }

      // Load churches
      const churchesResponse = await fetch(`${BASE_URL}/churches`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (churchesResponse.ok) {
        const churchesData = await churchesResponse.json();
        setChurches(churchesData);
      } else {
        throw new Error('Failed to load churches');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh the page.');
      // Don't clear existing data on error to prevent white screen
    }
    setLoading(false);
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail || !newAdminName || !newAdminPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (!newAdminEmail.includes('@')) {
      setError('Email must contain an @ symbol');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          email: newAdminEmail.toLowerCase(),
          password: newAdminPassword,
          name: newAdminName,
          role: newAdminRole
        })
      });

      if (response.ok) {
        setSuccess('Admin created successfully!');
        setCreateAdminOpen(false);
        setNewAdminEmail('');
        setNewAdminName('');
        setNewAdminPassword('');
        setNewAdminRole('church_admin');
        loadData(); // Refresh the data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create admin');
      }
    } catch (err) {
      setError('Network error while creating admin');
    }
    setLoading(false);
  };

  const handleAssignToChurch = async () => {
    if (!selectedUserId || !selectedChurchId) {
      setError('Please select both user and church');
      return;
    }

    setLoading(true);
    setError(''); // Clear any existing errors
    try {
      const response = await fetch(`${BASE_URL}/users/${selectedUserId}/assign-church`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ churchId: selectedChurchId })
      });

      if (response.ok) {
        setSuccess('User assigned to church successfully!');
        setAssignDialogOpen(false);
        setSelectedUserId(null);
        setSelectedChurchId(null);
        
        // Refresh data without setting loading to true again to prevent UI flicker
        try {
          const usersResponse = await fetch(`${BASE_URL}/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setUsers(usersData);
          }

          const churchesResponse = await fetch(`${BASE_URL}/churches`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (churchesResponse.ok) {
            const churchesData = await churchesResponse.json();
            setChurches(churchesData);
          }
        } catch (refreshErr) {
          console.error('Error refreshing data after assignment:', refreshErr);
          // Don't show error to user, just log it - assignment was successful
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to assign user to church');
      }
    } catch (err) {
      console.error('Error assigning user:', err);
      setError('Network error while assigning user');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        setSuccess('User deleted successfully!');
        loadData(); // Refresh the data
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Network error while deleting user');
    }
    setLoading(false);
  };

  const handleDeleteChurch = async (churchId: number, churchName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${churchName}"?\n\nThis will also remove all admin assignments for this church and reset affected users' enrollment status.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/churches/${churchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Church deleted successfully! ${result.removedAssignments} admin assignments were also removed.`);
        loadData(); // Refresh the data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete church');
      }
    } catch (err) {
      setError('Network error while deleting church');
    }
    setLoading(false);
  };

  const getUnassignedUsers = () => {
    return users.filter(user => 
      user.role === 'church_admin' && 
      (!user.churchAssignments || user.churchAssignments.length === 0)
    );
  };

  const getAssignedUsers = () => {
    return users.filter(user => 
      user.churchAssignments && user.churchAssignments.length > 0
    );
  };

  // Show loading spinner during initial load only
  if (loading && users.length === 0 && churches.length === 0) {
    return (
      <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
        <Navbar />
        <Box sx={{ pt: 10, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Typography variant="h6">Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <Navbar />
      <Box sx={{ pt: 10, width: '100%' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main', mb: 2, textAlign: 'center' }}>
            🔧 Superuser Dashboard
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 4, textAlign: 'center' }}>
            Welcome {user?.name}! Manage admins, churches, and assignments.
          </Typography>

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

          {/* Quick Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {users.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Users
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {churches.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Total Churches
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {getAssignedUsers().length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Assigned Admins
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {getUnassignedUsers().length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Unassigned Admins
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setCreateAdminOpen(true)}
            >
              Create Admin
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setAssignDialogOpen(true)}
              disabled={getUnassignedUsers().length === 0 || churches.length === 0}
            >
              Assign Admin to Church
            </Button>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="All Users" />
              <Tab label="Churches" />
              <Tab label="Assignments" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Church Assignments</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'superuser' ? 'error' : 'primary'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.churchAssignments && user.churchAssignments.length > 0 ? (
                          user.churchAssignments.map(assignment => (
                            <Chip 
                              key={assignment.id}
                              label={assignment.church_name} 
                              size="small" 
                              sx={{ mr: 1, mb: 0.5 }}
                            />
                          ))
                        ) : (
                          user.role === 'church_admin' ? (
                            <Chip label="Unassigned" color="warning" size="small" />
                          ) : null
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role !== 'superuser' && (
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteUser(user.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Church Name</TableCell>
                    <TableCell>Senior Pastor</TableCell>
                    <TableCell>Contact Email</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {churches.map((church) => (
                    <TableRow key={church.id}>
                      <TableCell>{church.id}</TableCell>
                      <TableCell>{church.name}</TableCell>
                      <TableCell>{church.senior_pastor}</TableCell>
                      <TableCell>{church.contact_email}</TableCell>
                      <TableCell>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteChurch(church.id, church.name)}
                          size="small"
                          title={`Delete ${church.name}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>Assigned Admins</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Admin Name</TableCell>
                    <TableCell>Admin Email</TableCell>
                    <TableCell>Church</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getAssignedUsers().map((user) => 
                    user.churchAssignments?.map((assignment) => (
                      <TableRow key={`${user.id}-${assignment.id}`}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{assignment.church_name}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Container>
      </Box>

      {/* Create Admin Dialog */}
      <Dialog open={createAdminOpen} onClose={() => setCreateAdminOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="church_admin">Church Admin</MenuItem>
              <MenuItem value="superuser">Superuser</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateAdminOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} variant="contained" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Admin to Church</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Admin</InputLabel>
            <Select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              label="Select Admin"
            >
              {getUnassignedUsers().map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Church</InputLabel>
            <Select
              value={selectedChurchId || ''}
              onChange={(e) => setSelectedChurchId(Number(e.target.value))}
              label="Select Church"
            >
              {churches.map((church) => (
                <MenuItem key={church.id} value={church.id}>
                  {church.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignToChurch} variant="contained" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
