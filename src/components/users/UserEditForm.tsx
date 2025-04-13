import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, UserUpdateData } from '../../services/user.service';
import userService from '../../services/user.service';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  role: yup.string().required('Role is required'),
  active: yup.boolean()
}).required();

type UserFormProps = {
  user: User;
  onComplete: (updatedUser?: User) => void;
};

const UserEditForm: React.FC<UserFormProps> = ({ user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      active: user.active
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const updateData: UserUpdateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        active: data.active
      };

      console.log('Updating user:', user.id, updateData);
      const response = await userService.updateUser(user.id, updateData);
      console.log('Update response:', response);
      
      // Return updated user to parent
      onComplete(response.data);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
      
      // Don't close form on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Edit User</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="firstName"
              control={control}
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
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => onComplete()}
                sx={{ mr: 2 }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Saving...' : 'Update User'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default UserEditForm;