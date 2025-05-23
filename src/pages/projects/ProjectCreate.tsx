// src/pages/projects/ProjectCreate.tsx
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import projectService, { ProjectCreateData } from '../../services/project.service';
import clientService, { Client } from '../../services/client.service';
import ContractorSelector from '../../components/contractors/ContractorSelector';

// Define explicit type for form data
interface ProjectFormData {
  name: string;
  code: string;
  description: string | null;
  clientId: string;
  contractorId: string | null;
  status: string;
  value: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

// Form validation schema
const schema = yup.object().shape({
  name: yup.string().required('Project name is required'),
  code: yup.string().required('Project code is required'),
  description: yup.string().nullable().default(null),
  clientId: yup.string().required('Client is required'),
  contractorId: yup.string().nullable().default(null),
  status: yup.string().required('Status is required'),
  value: yup
    .number()
    .transform((value) => (isNaN(value) ? null : value))
    .nullable()
    .default(null),
  address: yup.string().nullable().default(null),
  city: yup.string().nullable().default(null),
  state: yup.string().nullable().default(null),
  zip: yup.string().nullable().default(null),
  startDate: yup.date().nullable().default(null),
  endDate: yup.date().nullable().default(null)
    .when('startDate', {
      is: (startDate: Date | null) => startDate !== null,
      then: (schema) => schema.min(
        yup.ref('startDate'),
        'End date cannot be before start date'
      ),
    }),
});

const ProjectCreate = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProjectFormData>({
    resolver: yupResolver(schema) as any, // Type assertion to bypass the type error
    defaultValues: {
      name: '',
      code: '',
      description: null,
      clientId: '',
      contractorId: null,
      status: 'PLANNING',
      value: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      startDate: null,
      endDate: null
    }
  });

  // Watch for contractorId changes
  const contractorId = watch('contractorId');

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setClientsLoading(true);
        const response = await clientService.getClients();
        setClients(response.data);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again.');
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Handle form submission
  const onSubmit = async (data: ProjectFormData) => {
    setLoading(true);
    setError(null);
    
    console.log('Form data:', data); // Debug log to check form data
    
    // Create a cleaned version of the data to send to the API
    const projectData: ProjectCreateData = {
      name: data.name,
      code: data.code,
      description: data.description || undefined,
      clientId: data.clientId,
      contractorId: data.contractorId || undefined, // Make sure this is properly handled
      status: data.status,
      value: data.value || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zip: data.zip || undefined,
      startDate: data.startDate ? data.startDate.toISOString() : undefined,
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
    };
    
    console.log('API request data:', projectData); // Debug log to check API request data
    
    try {
      const response = await projectService.createProject(projectData);
      console.log('API response:', response.data); // Debug log to check API response
      
      setFormSubmitted(true);
      
      // Navigate to the project details after successful creation
      setTimeout(() => {
        navigate(`/projects/${response.data.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate('/projects')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">Create New Project</Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {formSubmitted ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Project created successfully! Redirecting to project details...
          </Alert>
        ) : (
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid component="div" container spacing={3}>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Project Name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={loading}
                        value={field.value || ''}
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
                        label="Project Code"
                        fullWidth
                        error={!!errors.code}
                        helperText={errors.code?.message}
                        disabled={loading}
                        placeholder="e.g., PRJ001"
                        value={field.value || ''}
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
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        disabled={loading}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="clientId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.clientId} disabled={loading || clientsLoading}>
                        <InputLabel required>Client</InputLabel>
                        <Select
                          {...field}
                          label="Client"
                          value={field.value || ''}
                        >
                          {clientsLoading ? (
                            <MenuItem value="">Loading clients...</MenuItem>
                          ) : clients.length > 0 ? (
                            clients.map((client) => (
                              <MenuItem key={client.id} value={client.id}>
                                {client.name} ({client.code})
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value="">No clients available</MenuItem>
                          )}
                        </Select>
                        {errors.clientId && <FormHelperText>{errors.clientId.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="contractorId"
                    control={control}
                    render={({ field }) => (
                      <ContractorSelector
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        error={!!errors.contractorId}
                        helperText={errors.contractorId?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.status} disabled={loading}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          {...field}
                          label="Status"
                          value={field.value || ''}
                        >
                          <MenuItem value="PLANNING">Planning</MenuItem>
                          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                          <MenuItem value="ON_HOLD">On Hold</MenuItem>
                          <MenuItem value="COMPLETED">Completed</MenuItem>
                          <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </Select>
                        {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="value"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Contract Value"
                        fullWidth
                        type="number"
                        InputProps={{ startAdornment: '$' }}
                        error={!!errors.value}
                        helperText={errors.value?.message}
                        disabled={loading}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : Number(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value === null ? '' : field.value}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Timeline</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid component="div" container spacing={3}>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <TextField
                        {...field}
                        label="Start Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={value ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          onChange(date);
                        }}
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <TextField
                        {...field}
                        label="End Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={value ? new Date(value).toISOString().split('T')[0] : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          onChange(date);
                        }}
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Location</Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid component="div" container spacing={3}>
                <Grid component="div" size={{ xs: 12 }}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Address"
                        fullWidth
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        disabled={loading}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="City"
                        fullWidth
                        error={!!errors.city}
                        helperText={errors.city?.message}
                        disabled={loading}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="State"
                        fullWidth
                        error={!!errors.state}
                        helperText={errors.state?.message}
                        disabled={loading}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 4 }}>
                  <Controller
                    name="zip"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="ZIP Code"
                        fullWidth
                        error={!!errors.zip}
                        helperText={errors.zip?.message}
                        disabled={loading}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  sx={{ mr: 2 }}
                  onClick={() => navigate('/projects')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </Box>
  );
};

export default ProjectCreate;