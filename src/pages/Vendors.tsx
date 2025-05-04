import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
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
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import materialService, { Vendor, VendorPrice } from '../services/material.service';

const Vendors = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, [searchTerm]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await materialService.getVendors({ search: searchTerm });
      setVendors(response.data);
    } catch (err) {
      setError('Failed to load vendors');
      console.error('Error loading vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (vendor?: Vendor) => {
    if (vendor) {
      setSelectedVendor(vendor);
    } else {
      setSelectedVendor({
        id: '',
        code: '',
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: '',
        contactName: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVendor(null);
  };

  const handleSave = async () => {
    if (!selectedVendor) return;

    try {
      setSaving(true);
      if (selectedVendor.id) {
        // Update existing vendor
        const { id, code, ...updateData } = selectedVendor;
        await materialService.updateVendor(id, updateData);
        setSuccessMessage('Vendor updated successfully');
      } else {
        // Create new vendor
        const { id, ...createData } = selectedVendor;
        await materialService.createVendor(createData);
        setSuccessMessage('Vendor created successfully');
      }
      handleClose();
      loadVendors();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save vendor');
      console.error('Error saving vendor:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This will also delete all associated vendor prices.')) return;

    try {
      setLoading(true);
      setError(null);

      // First, get the vendor to check for related records
      const response = await materialService.getVendorById(id);
      const vendor = response.data;
      
      if (vendor.vendorPrices?.length > 0) {
        // Delete all vendor prices first
        await Promise.all(
          vendor.vendorPrices.map((price: VendorPrice) => 
            materialService.deleteVendorPrice(price.material.id, price.id)
          )
        );
      }

      // Now delete the vendor
      await materialService.deleteVendor(id);
      
      setSuccessMessage('Vendor deleted successfully');
      loadVendors(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      setError(error.response?.data?.message || 'Failed to delete vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof Vendor, value: string) => {
    setSelectedVendor(prev => {
      if (!prev) {
        return {
          id: '',
          code: '',
          name: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          phone: '',
          email: '',
          contactName: ''
        };
      }
      return { ...prev, [field]: value };
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Vendors
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Vendor
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No vendors found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>{vendor.code}</TableCell>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>
                    {vendor.contactName && (
                      <Box>
                        <Typography variant="body2">{vendor.contactName}</Typography>
                        {vendor.email && (
                          <Typography variant="body2" color="text.secondary">
                            {vendor.email}
                          </Typography>
                        )}
                        {vendor.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {vendor.phone}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.city && vendor.state && (
                      <Typography variant="body2">
                        {vendor.city}, {vendor.state}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(vendor)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(vendor.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedVendor?.id ? 'Edit Vendor' : 'Add New Vendor'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Code"
                value={selectedVendor?.code || ''}
                onChange={(e) => handleFieldChange('code', e.target.value)}
                disabled={!!selectedVendor?.id}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Name"
                value={selectedVendor?.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={selectedVendor?.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="City"
                value={selectedVendor?.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="State"
                value={selectedVendor?.state || ''}
                onChange={(e) => handleFieldChange('state', e.target.value)}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={selectedVendor?.zip || ''}
                onChange={(e) => handleFieldChange('zip', e.target.value)}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Name"
                value={selectedVendor?.contactName || ''}
                onChange={(e) => handleFieldChange('contactName', e.target.value)}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={selectedVendor?.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </Grid>
            <Grid component="div" size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={selectedVendor?.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : (selectedVendor?.id ? 'Save Changes' : 'Add Vendor')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Vendors; 