// src/components/projects/details/ProjectScopesTabEnhanced.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Project, Scope, SubScope } from '../../../services/project.service';
import scopeService from '../../../services/scope.service';
import ProjectSubScopeWorkItemsPanel from './ProjectSubScopeWorkItemsPanel';

interface ProjectScopesTabProps {
  project: Project;
}

// Types for form data
interface ScopeFormData {
  name: string;
  code: string;
  description: string;
  subScopes: {
    name: string;
    code: string;
    description: string;
  }[];
}

// Form validation schema
const scopeSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string(),
  subScopes: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Name is required'),
      code: yup.string().required('Code is required'),
      description: yup.string(),
    })
  ),
});

const ProjectScopesTabEnhanced: React.FC<ProjectScopesTabProps> = ({ project }) => {
  const [scopes, setScopes] = useState<Scope[]>(project.scopes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm<ScopeFormData>({
    resolver: yupResolver(scopeSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      subScopes: [{ name: '', code: '', description: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subScopes',
  });

  // Watch form values
  const watchSubScopes = watch('subScopes');

  // Fetch scopes when component mounts
  useEffect(() => {
    fetchScopes();
  }, []);

  const fetchScopes = async () => {
    setLoading(true);
    try {
      const response = await scopeService.getProjectScopes(project.id);
      setScopes(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching scopes:', err);
      setError(err.response?.data?.message || 'Failed to load scopes');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating a scope
  const handleOpenDialog = () => {
    reset({
      name: '',
      code: '',
      description: '',
      subScopes: [{ name: '', code: '', description: '' }],
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle form submission
  const onSubmit = async (data: ScopeFormData) => {
    setFormSubmitting(true);
    try {
      const response = await scopeService.createProjectScope(project.id, data);
      
      // Add new scope to the state
      setScopes([...scopes, response.data]);
      
      // Close dialog after successful submission
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error creating scope:', err);
      setError(err.response?.data?.message || 'Failed to create scope');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle updating sub-scope completion
  const handleUpdateCompletion = () => {
    fetchScopes(); // Refresh scopes to get updated completion percentages
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Project Scopes</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchScopes}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Create Scope
          </Button>
        </Box>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Scopes list */
        <Box>
          {scopes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              No scopes defined for this project yet. Create your first scope by clicking the "Create Scope" button.
            </Alert>
          ) : (
            scopes.map((scope) => (
              <Accordion key={scope.id} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{scope.name} ({scope.code})</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {scope.description && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {scope.description}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>Sub-Scopes</Typography>
                  
                  {scope.subScopes.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No sub-scopes defined for this scope.
                    </Alert>
                  ) : (
                    scope.subScopes.map((subScope) => (
                      <ProjectSubScopeWorkItemsPanel 
                        key={subScope.id}
                        projectId={project.id}
                        scopeId={scope.id}
                        subScope={subScope}
                        onUpdateCompletion={handleUpdateCompletion}
                      />
                    ))
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      )}
      
      {/* Scope Create Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Scope
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Typography variant="subtitle1" gutterBottom>Scope Information</Typography>
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
                      margin="normal"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={formSubmitting}
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
                      margin="normal"
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      disabled={formSubmitting}
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
                      margin="normal"
                      multiline
                      rows={2}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      disabled={formSubmitting}
                    />
                  )}
                />
              </Grid>
            </Grid>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Sub-Scopes</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Define at least one sub-scope. Work items will be assigned to sub-scopes.
              </Typography>
            </Box>
            
            {fields.map((field, index) => (
              <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">Sub-Scope #{index + 1}</Typography>
                  {index > 0 && (
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => remove(index)}
                      disabled={formSubmitting}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                
                <Grid component="div" container spacing={2}>
                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`subScopes.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name"
                          fullWidth
                          margin="normal"
                          error={!!errors.subScopes?.[index]?.name}
                          helperText={errors.subScopes?.[index]?.name?.message}
                          disabled={formSubmitting}
                        />
                      )}
                    />
                  </Grid>
                  <Grid component="div" size={{ xs: 12, md: 6 }}>
                    <Controller
                      name={`subScopes.${index}.code`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Code"
                          fullWidth
                          margin="normal"
                          error={!!errors.subScopes?.[index]?.code}
                          helperText={errors.subScopes?.[index]?.code?.message}
                          disabled={formSubmitting}
                          placeholder="e.g., SS-001"
                        />
                      )}
                    />
                  </Grid>
                  <Grid component="div" size={{ xs: 12 }}>
                    <Controller
                      name={`subScopes.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Description (Optional)"
                          fullWidth
                          margin="normal"
                          multiline
                          rows={2}
                          error={!!errors.subScopes?.[index]?.description}
                          helperText={errors.subScopes?.[index]?.description?.message}
                          disabled={formSubmitting}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => append({ name: '', code: '', description: '' })}
              disabled={formSubmitting}
            >
              Add Sub-Scope
            </Button>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog} 
              disabled={formSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={formSubmitting}
              startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
            >
              {formSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default ProjectScopesTabEnhanced;