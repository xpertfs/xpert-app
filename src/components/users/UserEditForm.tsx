// src/components/users/UserEditForm.tsx
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
  Alert,
  Divider
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
  const [success, setSuccess] = useState(false);

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

      const response = await userService.updateUser(user.id, updateData);
      setSuccess(true);
      
      // Close form after successful update with a delay
      setTimeout(() => {
        onComplete(response.data);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Edit User</Typography>
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          User updated successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid component="div" container spacing={2}>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
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
                  disabled={loading || success}
                />
              )}
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
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
                  disabled={loading || success}
                />
              )}
            />
          </Grid>
          <Grid component="div" size={{ xs: 12 }}>
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
                  disabled={loading || success}
                />
              )}
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.role} disabled={loading || success}>
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
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={loading || success}>
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
          <Grid component="div" size={{ xs: 12 }}>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
                disabled={loading || success}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Updating...' : 'Update User'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default UserEditForm;