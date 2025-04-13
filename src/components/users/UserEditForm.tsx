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
  Card,
  Avatar,
  Divider
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
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
    setSuccess(false);

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
      
      setSuccess(true);
      
      // Return updated user to parent after a brief success message
      setTimeout(() => {
        onComplete(response.data);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper function to format role for display
  const formatRole = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => onComplete()}
            size="small"
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5">Edit User</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              mr: 2
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box>
            <Typography variant="h6">{`${user.firstName} ${user.lastName}`}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatRole(user.role)} • {user.email}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ p: 3 }}>
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
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
                    disabled={loading || success}
                    variant="outlined"
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
                    disabled={loading || success}
                    variant="outlined"
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
                    disabled={loading || success}
                    variant="outlined"
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', mt: 2 }}>
                Account Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role} disabled={loading || success}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      {...field}
                      label="Role"
                      variant="outlined"
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
                  <FormControl fullWidth disabled={loading || success}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={field.value ? 'active' : 'inactive'}
                      onChange={(e) => field.onChange(e.target.value === 'active')}
                      label="Status"
                      variant="outlined"
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                * To change the password, use the reset password function from the users list.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => onComplete()}
                  sx={{ mr: 2 }}
                  disabled={loading || success}
                  startIcon={<Cancel />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || success}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? 'Saving...' : success ? 'Saved' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Card>
  );
};

export default UserEditForm;