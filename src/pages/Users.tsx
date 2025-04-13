// src/pages/Users.tsx
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import userService, { User } from '../services/user.service';
import UserEditForm from '../components/users/UserEditForm';
import UserCreateForm from '../components/users/UserCreateForm';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({ password: '', confirmPassword: '' });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to handle edit user
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Function to handle create user
  const handleCreateUser = () => {
    setIsCreating(true);
    setIsEditing(false);
    setEditingUser(null);
  };

  // Function to handle complete edit
  const handleEditComplete = (updatedUser?: User) => {
    if (updatedUser) {
      // Update user in state
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
    setEditingUser(null);
    setIsEditing(false);
  };

  // Function to handle create complete
  const handleCreateComplete = () => {
    setIsCreating(false);
    fetchUsers(); // Refresh the users list
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Filter users based on search query
  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  // Open password reset dialog
  const handleOpenPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordFormData({ password: '', confirmPassword: '' });
    setShowPasswordDialog(true);
  };

  // Close password reset dialog
  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setSelectedUserId(null);
  };

  // Handle password update submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) return;
    if (passwordFormData.password !== passwordFormData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    if (passwordFormData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    setPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    
    try {
      await userService.updateUserPassword(selectedUserId, passwordFormData.password);
      setPasswordSuccess(true);
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClosePasswordDialog();
      }, 2000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Handle toggle user active status
  const handleToggleActive = async (user: User) => {
    try {
      const response = await userService.updateUser(user.id, {
        active: !user.active
      });
      
      // Update user in the state
      setUsers(users.map(u => 
        u.id === user.id ? response.data : u
      ));
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (id: string) => {
    // Prevent self-deletion
    if (currentUser && id === currentUser.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        // Remove from state after successful deletion
        setUsers(users.filter(user => user.id !== id));
      } catch (err: any) {
        console.error('Error deleting user:', err);
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  // Helper function to format role for display
  const formatRole = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'PROJECT_MANAGER':
        return 'primary';
      case 'FOREMAN':
        return 'warning';
      case 'ACCOUNTANT':
        return 'success';
      case 'EMPLOYEE':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            New User
          </Button>
        </Box>
      </Box>
      
      {/* Search box */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email or role..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Main content */}
      {isCreating ? (
        <UserCreateForm onComplete={handleCreateComplete} />
      ) : isEditing && editingUser ? (
        <UserEditForm 
          user={editingUser} 
          onComplete={handleEditComplete} 
        />
      ) : loading ? (
        <LoadingState message="Loading users..." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    {searchQuery ? (
                      <EmptyState
                        title="No matching users"
                        message="Try adjusting your search criteria or clear the search to see all users."
                        actionText="Clear Search"
                        onAction={() => setSearchQuery('')}
                      />
                    ) : (
                      <EmptyState
                        title="No users found"
                        message="Get started by creating your first user."
                        icon={People}
                        actionText="Create User" 
                        onAction={handleCreateUser}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    hover
                    sx={{
                      bgcolor: currentUser && user.id === currentUser.id ? 'action.selected' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body1">{`${user.firstName} ${user.lastName}`}</Typography>
                          {currentUser && user.id === currentUser.id && (
                            <Typography variant="caption" color="primary">(You)</Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={formatRole(user.role)} 
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.active ? 'Active' : 'Inactive'} 
                        color={user.active ? 'success' : 'default'}
                        size="small"
                        onClick={() => handleToggleActive(user)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleEditUser(user)}
                        title="Edit user"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenPasswordDialog(user.id)}
                        title="Reset password"
                        disabled={currentUser && user.id === currentUser.id}
                      >
                        <LockResetIcon/>
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete user"
                        disabled={currentUser && user.id === currentUser.id}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Password Reset Dialog */}
      <Dialog
        open={showPasswordDialog}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reset User Password
        </DialogTitle>
        <form onSubmit={handlePasswordSubmit}>
          <DialogContent dividers>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Password updated successfully!
              </Alert>
            )}
            <Grid component="div" container spacing={3}>
              <Grid component="div" size={{ xs: 12 }}>
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={passwordFormData.password}
                  onChange={(e) => setPasswordFormData({...passwordFormData, password: e.target.value})}
                  error={!!passwordError}
                  disabled={passwordSubmitting || passwordSuccess}
                />
              </Grid>
              <Grid component="div" size={{ xs: 12 }}>
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData({...passwordFormData, confirmPassword: e.target.value})}
                  error={!!passwordError}
                  disabled={passwordSubmitting || passwordSuccess}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleClosePasswordDialog} 
              disabled={passwordSubmitting}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              color="primary"
              disabled={passwordSubmitting || passwordSuccess}
              startIcon={passwordSubmitting ? <CircularProgress size={20} /> : null}
            >
              {passwordSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Users;