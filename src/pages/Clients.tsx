// src/pages/Clients.tsx
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
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import clientService, { Client, ClientCreateData, ClientUpdateData } from '../services/client.service';

// Form validation schema
const clientSchema = yup.object().shape({
  name: yup.string().required('Client name is required'),
  code: yup.string().required('Client code is required'),
  address: yup.string().default(''),
  city: yup.string().default(''),
  state: yup.string().default(''),
  zip: yup.string().default(''),
  phone: yup.string().default(''),
  email: yup.string().email('Invalid email').default(''),
  contactName: yup.string().default(''),
});

interface ClientFormData {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  contactName: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      contactName: '',
    }
  });

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Set form values when editing a client
  useEffect(() => {
    if (editingClient) {
      reset({
        name: editingClient.name,
        code: editingClient.code,
        address: editingClient.address || '',
        city: editingClient.city || '',
        state: editingClient.state || '',
        zip: editingClient.zip || '',
        phone: editingClient.phone || '',
        email: editingClient.email || '',
        contactName: editingClient.contactName || '',
      });
    } else {
      reset({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        contactName: '',
      });
    }
  }, [editingClient, reset]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients();
      setClients(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Filter clients based on search query
  const filteredClients = searchQuery 
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.contactName && client.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : clients;

  // Open dialog for creating or editing a client
  const handleOpenDialog = (client: Client | null = null) => {
    setEditingClient(client);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
  };

  // Handle form submission
  const onSubmit = async (data: ClientFormData) => {
    setFormSubmitting(true);
    try {
      if (editingClient) {
        // Update existing client
        const updateData: ClientUpdateData = {
          name: data.name,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          zip: data.zip || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          contactName: data.contactName || undefined,
        };
        
        const response = await clientService.updateClient(editingClient.id, updateData);
        
        // Update client in the state
        setClients(clients.map(client => 
          client.id === editingClient.id ? response.data : client
        ));
      } else {
        // Create new client
        const createData: ClientCreateData = {
          name: data.name,
          code: data.code,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          zip: data.zip || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          contactName: data.contactName || undefined,
        };
        
        const response = await clientService.createClient(createData);
        
        // Add new client to the state
        setClients([...clients, response.data]);
      }
      
      // Close dialog after successful submission
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving client:', err);
      setError(err.response?.data?.message || 'Failed to save client');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete client
  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.deleteClient(id);
        // Remove from state after successful deletion
        setClients(clients.filter(client => client.id !== id));
      } catch (err: any) {
        console.error('Error deleting client:', err);
        alert(err.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchClients}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Client
          </Button>
        </Box>
      </Box>
      
      {/* Search box */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search clients by name, code or contact..."
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
      
      {/* Loading indicator */}
      {loading ? (
        <LoadingState message="Loading clients..." />
      ) : (
        /* Clients table */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client Name</TableCell>
                <TableCell>Contact Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    {searchQuery ? (
                      <EmptyState
                        title="No matching clients"
                        message="Try adjusting your search criteria or clear the search to see all clients."
                        actionText="Clear Search"
                        onAction={() => setSearchQuery('')}
                      />
                    ) : (
                      <EmptyState
                        title="No clients found"
                        message="Get started by creating your first client."
                        icon={Business}
                        actionText="Create Client" 
                        onAction={() => handleOpenDialog()}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1">{client.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client.code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{client.contactName || '-'}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>
                      {client.address ? 
                        `${client.address}, ${client.city || ''} ${client.state || ''} ${client.zip || ''}`.replace(/\s+/g, ' ').trim() : 
                        '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(client)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteClient(client.id)}
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
      
      {/* Client Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingClient ? 'Edit Client' : 'Create New Client'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
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
                      label="Client Name"
                      fullWidth
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
                      label="Client Code"
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      disabled={formSubmitting || !!editingClient}
                      placeholder="e.g., CLT001"
                    />
                  )}
                />
              </Grid>
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Controller
                  name="contactName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contact Name"
                      fullWidth
                      error={!!errors.contactName}
                      helperText={errors.contactName?.message}
                      disabled={formSubmitting}
                    />
                  )}
                />
              </Grid>
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={formSubmitting}
                    />
                  )}
                />
              </Grid>
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      disabled={formSubmitting}
                    />
                  )}
                />
              </Grid>
            </Grid>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Address</Typography>
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
                      disabled={formSubmitting}
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
                      disabled={formSubmitting}
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
                      disabled={formSubmitting}
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
                      disabled={formSubmitting}
                    />
                  )}
                />
              </Grid>
            </Grid>
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
              {formSubmitting ? 'Saving...' : (editingClient ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Clients;