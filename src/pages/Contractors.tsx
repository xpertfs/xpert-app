// src/pages/Contractors.tsx
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
import contractorService, { Contractor, ContractorCreateData, ContractorUpdateData } from '../services/contractor.service';

// Form validation schema
const contractorSchema = yup.object().shape({
  name: yup.string().required('Contractor name is required'),
  code: yup.string().required('Contractor code is required'),
  address: yup.string().default(''),
  city: yup.string().default(''),
  state: yup.string().default(''),
  zip: yup.string().default(''),
  phone: yup.string().default(''),
  email: yup.string().email('Invalid email').default(''),
  contactName: yup.string().default(''),
});

interface ContractorFormData {
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

const Contractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<ContractorFormData>({
    resolver: yupResolver(contractorSchema),
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

  // Fetch contractors on component mount
  useEffect(() => {
    fetchContractors();
  }, []);

  // Set form values when editing a contractor
  useEffect(() => {
    if (editingContractor) {
      reset({
        name: editingContractor.name,
        code: editingContractor.code,
        address: editingContractor.address || '',
        city: editingContractor.city || '',
        state: editingContractor.state || '',
        zip: editingContractor.zip || '',
        phone: editingContractor.phone || '',
        email: editingContractor.email || '',
        contactName: editingContractor.contactName || '',
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
  }, [editingContractor, reset]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const response = await contractorService.getContractors();
      setContractors(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching contractors:', err);
      setError(err.response?.data?.message || 'Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Filter contractors based on search query
  const filteredContractors = searchQuery 
    ? contractors.filter(contractor => 
        contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contractor.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contractor.contactName && contractor.contactName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : contractors;

  // Open dialog for creating or editing a contractor
  const handleOpenDialog = (contractor: Contractor | null = null) => {
    setEditingContractor(contractor);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContractor(null);
  };

  // Handle form submission
  const onSubmit = async (data: ContractorFormData) => {
    setFormSubmitting(true);
    try {
      if (editingContractor) {
        // Update existing contractor
        const updateData: ContractorUpdateData = {
          name: data.name,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          zip: data.zip || undefined,
          phone: data.phone || undefined,
          email: data.email || undefined,
          contactName: data.contactName || undefined,
        };
        
        const response = await contractorService.updateContractor(editingContractor.id, updateData);
        
        // Update contractor in the state
        setContractors(contractors.map(contractor => 
          contractor.id === editingContractor.id ? response.data : contractor
        ));
      } else {
        // Create new contractor
        const createData: ContractorCreateData = {
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
        
        const response = await contractorService.createContractor(createData);
        
        // Add new contractor to the state
        setContractors([...contractors, response.data]);
      }
      
      // Close dialog after successful submission
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving contractor:', err);
      setError(err.response?.data?.message || 'Failed to save contractor');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete contractor
  const handleDeleteContractor = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contractor?')) {
      try {
        await contractorService.deleteContractor(id);
        // Remove from state after successful deletion
        setContractors(contractors.filter(contractor => contractor.id !== id));
      } catch (err: any) {
        console.error('Error deleting contractor:', err);
        alert(err.response?.data?.message || 'Failed to delete contractor');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">General Contractors</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchContractors}
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
            New Contractor
          </Button>
        </Box>
      </Box>
      
      {/* Search box */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search contractors by name, code or contact..."
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
        <LoadingState message="Loading contractors..." />
      ) : (
        /* Contractors table */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contractor Name</TableCell>
                <TableCell>Contact Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContractors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    {searchQuery ? (
                      <EmptyState
                        title="No matching contractors"
                        message="Try adjusting your search criteria or clear the search to see all contractors."
                        actionText="Clear Search"
                        onAction={() => setSearchQuery('')}
                      />
                    ) : (
                      <EmptyState
                        title="No contractors found"
                        message="Get started by creating your first general contractor."
                        icon={Business}
                        actionText="Create Contractor" 
                        onAction={() => handleOpenDialog()}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContractors.map((contractor) => (
                  <TableRow key={contractor.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1">{contractor.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contractor.code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{contractor.contactName || '-'}</TableCell>
                    <TableCell>{contractor.email || '-'}</TableCell>
                    <TableCell>{contractor.phone || '-'}</TableCell>
                    <TableCell>
                      {contractor.address ? 
                        `${contractor.address}, ${contractor.city || ''} ${contractor.state || ''} ${contractor.zip || ''}`.replace(/\s+/g, ' ').trim() : 
                        '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(contractor)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteContractor(contractor.id)}
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
      
      {/* Contractor Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingContractor ? 'Edit Contractor' : 'Create New Contractor'}
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
                      label="Contractor Name"
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
                      label="Contractor Code"
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      disabled={formSubmitting || !!editingContractor}
                      placeholder="e.g., GC001"
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
              {formSubmitting ? 'Saving...' : (editingContractor ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Contractors;