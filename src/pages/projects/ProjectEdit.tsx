// src/pages/projects/ProjectEdit.tsx
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
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import projectService, { Project, ProjectUpdateData } from '../../services/project.service';
import clientService, { Client } from '../../services/client.service';
import ContractorSelector from '../../components/contractors/ContractorSelector';

// Define explicit type for form data
interface ProjectFormData {
  name: string;
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

const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProjectFormData>({
    resolver: yupResolver(schema) as any, // Type assertion to bypass the type error
    defaultValues: {
      name: '',
      description: null,
      clientId: '',
      contractorId: null,
      status: '',
      value: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      startDate: null,
      endDate: null
    }
  });

  // Watch contractorId for debugging
  const contractorId = watch('contractorId');
  
  // Fetch project and clients on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProjectLoading(true);
        setClientsLoading(true);
        
        // Fetch project and clients concurrently
        const [projectResponse, clientsResponse] = await Promise.all([
          projectService.getProjectById(id as string),
          clientService.getClients()
        ]);
        
        const projectData = projectResponse.data;
        setProject(projectData);
        setClients(clientsResponse.data);
        
        // Populate form with project data
        reset({
          name: projectData.name,
          description: projectData.description || null,
          clientId: projectData.client.id,
          contractorId: projectData.contractor?.id || null,
          status: projectData.status,
          value: projectData.value,
          address: projectData.address || null,
          city: projectData.city || null,
          state: projectData.state || null,
          zip: projectData.zip || null,
          startDate: projectData.startDate ? new Date(projectData.startDate) : null,
          endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        });

        console.log('Project data loaded:', projectData);
        console.log('Contractor ID:', projectData.contractor?.id);
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setProjectLoading(false);
        setClientsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, reset]);

  // Handle form submission
  const onSubmit = async (data: ProjectFormData) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    console.log('Form data to be submitted:', data);
    
    // Create a cleaned version of the data to send to the API
    const projectData: ProjectUpdateData = {
      name: data.name,
      description: data.description || undefined,
      clientId: data.clientId,
      contractorId: data.contractorId || undefined, // Properly handle null values
      status: data.status,
      value: data.value || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zip: data.zip || undefined,
      startDate: data.startDate ? data.startDate.toISOString() : undefined,
      endDate: data.endDate ? data.endDate.toISOString() : undefined,
    };
    
    console.log('API request data:', projectData);
    
    try {
      const response = await projectService.updateProject(id, projectData);
      console.log('API response:', response.data);
      
      setFormSubmitted(true);
      
      // Navigate back to the project details after successful update
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (projectLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<BackIcon />} 
            onClick={() => navigate(`/projects/${id}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">Edit Project</Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {formSubmitted ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Project updated successfully! Redirecting to project details...
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
                  <TextField
                    label="Project Code"
                    fullWidth
                    value={project?.code || ''}
                    disabled
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
                  onClick={() => navigate(`/projects/${id}`)}
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
                  {loading ? 'Updating...' : 'Update Project'}
                </Button>
              </Box>
            </form>
          </Paper>
        )}
      </Box>
  );
};

export default ProjectEdit;