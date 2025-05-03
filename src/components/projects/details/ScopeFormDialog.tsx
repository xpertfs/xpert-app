// src/components/projects/details/ScopeFormDialog.tsx
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
import { Scope } from '../../../services/project.service';
import { ScopeCreateData } from '../../../services/scope.service';

interface ScopeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ScopeCreateData) => Promise<boolean>;
  editingScope: Scope | null;
}

// Form validation schema
const createScopeSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string().optional(),
});

const editScopeSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string().optional(),
});

const ScopeFormDialog: React.FC<ScopeFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editingScope
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use appropriate schema based on whether we're editing or creating
  const schema = editingScope ? editScopeSchema : createScopeSchema;
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ScopeCreateData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    }
  });

  // Reset form when editingScope changes
  useEffect(() => {
    if (editingScope) {
      reset({
        name: editingScope.name,
        code: editingScope.code, // Will be disabled for editing
        description: editingScope.description || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
      });
    }
  }, [editingScope, reset, open]);

  const handleFormSubmit = async (data: ScopeCreateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await onSubmit(data);
      if (success) {
        // Close dialog
        onClose();
      } else {
        setError('Failed to save scope. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting scope:', err);
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
        {editingScope ? 'Edit Scope' : 'Create New Scope'}
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
                    label="Scope Name"
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
                    label="Scope Code"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    disabled={loading || !!editingScope}
                    margin="normal"
                    placeholder="e.g., S-001"
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
            {loading ? 'Saving...' : (editingScope ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ScopeFormDialog;