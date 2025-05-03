// src/components/projects/details/SubScopeFormDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SubScope } from '../../../services/project.service';
import { SubScopeCreateData } from '../../../services/scope.service';

interface SubScopeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubScopeCreateData) => Promise<boolean>;
  editingSubScope: SubScope | null;
}

// Form validation schema
const createSubScopeSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string().optional(),
});

const editSubScopeSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string().optional(),
});

const SubScopeFormDialog: React.FC<SubScopeFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingSubScope
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use appropriate schema based on whether we're editing or creating
  const schema = editingSubScope ? editSubScopeSchema : createSubScopeSchema;
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<SubScopeCreateData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    }
  });

  // Reset form when editingSubScope changes
  useEffect(() => {
    if (editingSubScope) {
      reset({
        name: editingSubScope.name,
        code: editingSubScope.code, // Will be disabled for editing
        description: editingSubScope.description || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
      });
    }
  }, [editingSubScope, reset, open]);

  const handleFormSubmit = async (data: SubScopeCreateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await onSubmit(data);
      if (success) {
        // Dialog is closed by parent component after successful submission
      } else {
        setError('Failed to save sub-scope. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting sub-scope:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {editingSubScope ? 'Edit Sub-Scope' : 'Create New Sub-Scope'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid component="div" container spacing={2}>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sub-Scope Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={loading}
                    margin="normal"
                  />
                )}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sub-Scope Code"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    disabled={loading || !!editingSubScope}
                    margin="normal"
                    placeholder="e.g., SS-001"
                  />
                )}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={loading}
                    margin="normal"
                  />
                )}
              />
            </Grid>
          </Grid>
          
          {!editingSubScope && (
            <Alert severity="info" sx={{ mt: 2 }}>
              All project work items will be automatically assigned to this sub-scope with default quantity of 0.
              You can set quantities after creating the sub-scope.
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={onClose} 
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
            {loading ? 'Saving...' : (editingSubScope ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SubScopeFormDialog;