// src/pages/UserEdit.tsx
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import userService from '../services/user.service';

const UserEdit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Hardcode a user for testing
  const testUser = {
    id: "0d0589b6-ec41-48b3-a077-7a47c2886ed0", // Replace with an actual user ID from your system
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    role: "ADMIN",
    active: true
  };
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      role: testUser.role,
      active: testUser.active
    }
  });

  const onSubmit = async (data) => {
    console.log('Submit function called with data:', data);
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Updating user with data:', data);
      
      const response = await userService.updateUser(testUser.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        active: data.active
      });
      
      console.log('Update successful:', response);
      setSuccess(true);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Edit Test User</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>User updated successfully!</Alert>}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="role"
                control={control}
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role} disabled={loading}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      {...field}
                      label="Role"
                    >
                      <MenuItem value="ADMIN">Admin</MenuItem>
                      <MenuItem value="PROJECT_MANAGER">Project Manager</MenuItem>
                      <MenuItem value="FOREMAN">Foreman</MenuItem>
                      <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
                      <MenuItem value="EMPLOYEE">Employee</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={field.value ? 'active' : 'inactive'}
                      onChange={(e) => field.onChange(e.target.value === 'active')}
                      label="Status"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Updating...
                    </>
                  ) : 'Update User'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UserEdit;