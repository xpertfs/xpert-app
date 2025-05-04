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
  Snackbar,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import materialService, { Material, Vendor, VendorPrice, VendorPriceCreateData } from '../services/material.service';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface MaterialWithPrices extends Material {
  vendorPrices: VendorPrice[];
}

const Materials = () => {
  const theme = useTheme();
  const [materials, setMaterials] = useState<MaterialWithPrices[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithPrices | null>(null);
  const [selectedVendorPrice, setSelectedVendorPrice] = useState<VendorPrice | null>(null);
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [openPriceDialog, setOpenPriceDialog] = useState(false);
  const [openViewPricesDialog, setOpenViewPricesDialog] = useState(false);
  const [selectedMaterialPrices, setSelectedMaterialPrices] = useState<VendorPrice[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit: '',
    category: '',
    initialPrice: {
      vendorId: '',
      price: '',
      effectiveDate: new Date(),
      endDate: undefined as Date | undefined,
      notes: ''
    }
  });
  const [priceFormData, setPriceFormData] = useState({
    vendorId: '',
    price: '',
    effectiveDate: new Date(),
    endDate: undefined as Date | undefined,
    notes: ''
  });

  useEffect(() => {
    loadMaterials();
    loadVendors();
  }, [searchTerm]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialService.getMaterials({ search: searchTerm });
      const materialsWithPrices = await Promise.all(
        response.data.map(async (material) => {
          const pricesResponse = await materialService.getVendorPrices(material.id);
          return { ...material, vendorPrices: pricesResponse.data };
        })
      );
      setMaterials(materialsWithPrices);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setError('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await materialService.getVendors();
      setVendors(response.data);
    } catch (err) {
      console.error('Error loading vendors:', err);
    }
  };

  const handleOpenMaterialDialog = (material?: MaterialWithPrices) => {
    if (material) {
      setSelectedMaterial(material);
      setFormData({
        code: material.code,
        name: material.name,
        description: material.description || '',
        unit: material.unit,
        category: material.category || '',
        initialPrice: {
          vendorId: '',
          price: '',
          effectiveDate: new Date(),
          endDate: undefined,
          notes: ''
        }
      });
    } else {
      setSelectedMaterial(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        unit: '',
        category: '',
        initialPrice: {
          vendorId: '',
          price: '',
          effectiveDate: new Date(),
          endDate: undefined,
          notes: ''
        }
      });
    }
    setOpenMaterialDialog(true);
  };

  const handleOpenPriceDialog = (material: MaterialWithPrices, price?: VendorPrice) => {
    setSelectedMaterial(material);
    if (price) {
      setSelectedVendorPrice(price);
      setPriceFormData({
        vendorId: price.vendor.id,
        price: price.price.toString(),
        effectiveDate: new Date(price.effectiveDate),
        endDate: price.endDate ? new Date(price.endDate) : undefined,
        notes: price.notes || ''
      });
    } else {
      setSelectedVendorPrice(null);
      setPriceFormData({
        vendorId: '',
        price: '',
        effectiveDate: new Date(),
        endDate: undefined,
        notes: ''
      });
    }
    setOpenPriceDialog(true);
  };

  const handleCloseMaterialDialog = () => {
    setOpenMaterialDialog(false);
    setSelectedMaterial(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      unit: '',
      category: '',
      initialPrice: {
        vendorId: '',
        price: '',
        effectiveDate: new Date(),
        endDate: undefined,
        notes: ''
      }
    });
  };

  const handleClosePriceDialog = () => {
    setOpenPriceDialog(false);
    setSelectedVendorPrice(null);
    setPriceFormData({
      vendorId: '',
      price: '',
      effectiveDate: new Date(),
      endDate: undefined,
      notes: ''
    });
  };

  const handleSaveMaterial = async () => {
    try {
      setSaving(true);
      let materialId: string;

      // Extract only the material fields for the API
      const materialData = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        category: formData.category
      };

      if (selectedMaterial) {
        const response = await materialService.updateMaterial(selectedMaterial.id, materialData);
        materialId = response.data.id;
        setSuccessMessage('Material updated successfully');
      } else {
        const response = await materialService.createMaterial(materialData);
        materialId = response.data.id;
        setSuccessMessage('Material created successfully');

        // If initial price is provided, create it
        if (formData.initialPrice.vendorId && formData.initialPrice.price) {
          const priceData: VendorPriceCreateData = {
            vendorId: formData.initialPrice.vendorId,
            price: parseFloat(formData.initialPrice.price),
            effectiveDate: formData.initialPrice.effectiveDate.toISOString(),
            endDate: formData.initialPrice.endDate ? formData.initialPrice.endDate.toISOString() : undefined,
            notes: formData.initialPrice.notes
          };
          await materialService.createVendorPrice(materialId, priceData);
        }
      }

      await loadMaterials();
      setOpenMaterialDialog(false);
      handleCloseMaterialDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrice = async () => {
    try {
      setSaving(true);
      const priceData: VendorPriceCreateData = {
        vendorId: priceFormData.vendorId,
        price: parseFloat(priceFormData.price),
        effectiveDate: priceFormData.effectiveDate.toISOString(),
        endDate: priceFormData.endDate ? priceFormData.endDate.toISOString() : undefined,
        notes: priceFormData.notes
      };

      if (selectedVendorPrice) {
        await materialService.updateVendorPrice(
          selectedMaterial!.id,
          selectedVendorPrice.id,
          priceData
        );
        setSuccessMessage('Price updated successfully');
      } else {
        await materialService.createVendorPrice(selectedMaterial!.id, priceData);
        setSuccessMessage('Price added successfully');
      }

      await loadMaterials();
      setOpenPriceDialog(false);
      handleClosePriceDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save price');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaterial = async (material: MaterialWithPrices) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      setLoading(true);
      await materialService.deleteMaterial(material.id);
      setSuccessMessage('Material deleted successfully');
      loadMaterials();
    } catch (err) {
      setError('Failed to delete material');
      console.error('Error deleting material:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrice = async (material: MaterialWithPrices, price: VendorPrice) => {
    if (!window.confirm('Are you sure you want to delete this price?')) return;

    try {
      setLoading(true);
      await materialService.deleteVendorPrice(material.id, price.id);
      setSuccessMessage('Price deleted successfully');
      loadMaterials();
    } catch (err) {
      setError('Failed to delete price');
      console.error('Error deleting price:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialPriceDateChange = (field: 'effectiveDate' | 'endDate', value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      initialPrice: {
        ...prev.initialPrice,
        [field]: value || undefined
      }
    }));
  };

  const handlePriceDateChange = (field: 'effectiveDate' | 'endDate', value: Date | null) => {
    setPriceFormData(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleViewPrices = async (material: MaterialWithPrices) => {
    try {
      setLoading(true);
      const response = await materialService.getVendorPrices(material.id);
      setSelectedMaterialPrices(response.data);
      setSelectedMaterial(material);
      setOpenViewPricesDialog(true);
    } catch (err) {
      setError('Failed to load prices');
      console.error('Error loading prices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewPricesDialog = () => {
    setOpenViewPricesDialog(false);
    setSelectedMaterialPrices([]);
    setSelectedMaterial(null);
  };

  const handleAddPrice = (material: MaterialWithPrices) => {
    setSelectedMaterial(material);
    setSelectedVendorPrice(null);
    setPriceFormData({
      vendorId: '',
      price: '',
      effectiveDate: new Date(),
      endDate: undefined,
      notes: ''
    });
    setOpenPriceDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Materials</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenMaterialDialog()}
        >
          New Material
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Best Price</TableCell>
                  <TableCell>Best Vendor</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map((material) => {
                  const sortedPrices = [...material.vendorPrices].sort((a, b) => a.price - b.price);
                  const bestPrice = sortedPrices[0];
                  return (
                    <TableRow key={material.id}>
                      <TableCell>{material.code}</TableCell>
                      <TableCell>{material.name}</TableCell>
                      <TableCell>{material.description}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>
                        {material.category && (
                          <Chip 
                            label={material.category} 
                            size="small"
                            sx={{ 
                              bgcolor: theme.palette.primary.light,
                              color: theme.palette.primary.contrastText
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {material.vendorPrices && material.vendorPrices.length > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>
                              ${Number(bestPrice.price).toFixed(2)}
                            </Typography>
                            <Tooltip title="View All Prices">
                              <IconButton 
                                size="small"
                                onClick={() => handleViewPrices(material)}
                              >
                                <MoneyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography color="text.secondary">No prices</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {material.vendorPrices && material.vendorPrices.length > 0 ? (
                          <Tooltip 
                            title={
                              <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Vendor Details</Typography>
                                <Typography variant="body2">Name: {bestPrice.vendor.name}</Typography>
                                <Typography variant="body2">Email: {bestPrice.vendor.email || 'N/A'}</Typography>
                                <Typography variant="body2">Phone: {bestPrice.vendor.phone || 'N/A'}</Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>Location:</Typography>
                                <Typography variant="body2" sx={{ pl: 1 }}>
                                  {bestPrice.vendor.address || 'N/A'}
                                </Typography>
                                <Typography variant="body2" sx={{ pl: 1 }}>
                                  {[
                                    bestPrice.vendor.city,
                                    bestPrice.vendor.state,
                                    bestPrice.vendor.zip
                                  ].filter(Boolean).join(', ') || 'N/A'}
                                </Typography>
                              </Box>
                            }
                            arrow
                            placement="top"
                          >
                            <Typography sx={{ cursor: 'help' }}>
                              {bestPrice.vendor.name}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenMaterialDialog(material)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteMaterial(material)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Material Dialog */}
      <Dialog 
        open={openMaterialDialog} 
        onClose={handleCloseMaterialDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedMaterial ? 'Edit Material' : 'New Material'}
        </DialogTitle>
        <DialogContent>
          <Grid component="div" container spacing={3} sx={{ mt: 1 }}>
            <Grid component="div" size={12}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled={!!selectedMaterial}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid component="div" size={6}>
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid component="div" size={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                variant="outlined"
                size="small"
              />
            </Grid>

            {!selectedMaterial && (
              <>
                <Grid component="div" size={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 2, color: 'text.secondary' }}>
                    Initial Vendor Price (Optional)
                  </Typography>
                </Grid>
                <Grid component="div" size={12}>
                  <TextField
                    fullWidth
                    select
                    label="Vendor"
                    value={formData.initialPrice.vendorId}
                    onChange={(e) => setFormData({
                      ...formData,
                      initialPrice: { ...formData.initialPrice, vendorId: e.target.value }
                    })}
                    variant="outlined"
                    size="small"
                  >
                    {vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid component="div" size={12}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={formData.initialPrice.price}
                    onChange={(e) => setFormData({
                      ...formData,
                      initialPrice: { ...formData.initialPrice, price: e.target.value }
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid component="div" size={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Effective Date"
                      value={formData.initialPrice.effectiveDate}
                      onChange={(date) => handleInitialPriceDateChange('effectiveDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          variant: "outlined"
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid component="div" size={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date (Optional)"
                      value={formData.initialPrice.endDate}
                      onChange={(date) => handleInitialPriceDateChange('endDate', date)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          variant: "outlined"
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid component="div" size={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={formData.initialPrice.notes}
                    onChange={(e) => setFormData({
                      ...formData,
                      initialPrice: { ...formData.initialPrice, notes: e.target.value }
                    })}
                    multiline
                    rows={2}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMaterialDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveMaterial} 
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price Dialog */}
      <Dialog 
        open={openPriceDialog} 
        onClose={handleClosePriceDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedVendorPrice ? 'Edit Price' : 'Add Price'}
        </DialogTitle>
        <DialogContent>
          <Grid component="div" container spacing={3} sx={{ mt: 1 }}>
            <Grid component="div" size={12}>
              <TextField
                fullWidth
                select
                label="Vendor"
                value={priceFormData.vendorId}
                onChange={(e) => setPriceFormData({ ...priceFormData, vendorId: e.target.value })}
                variant="outlined"
                size="small"
              >
                {vendors.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={priceFormData.price}
                onChange={(e) => setPriceFormData({ ...priceFormData, price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid component="div" size={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Effective Date"
                  value={priceFormData.effectiveDate}
                  onChange={(date) => handlePriceDateChange('effectiveDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      variant: "outlined"
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid component="div" size={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date (Optional)"
                  value={priceFormData.endDate}
                  onChange={(date) => handlePriceDateChange('endDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      variant: "outlined"
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                fullWidth
                label="Notes"
                value={priceFormData.notes}
                onChange={(e) => setPriceFormData({ ...priceFormData, notes: e.target.value })}
                multiline
                rows={2}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePriceDialog}>Cancel</Button>
          <Button 
            onClick={handleSavePrice} 
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Prices Dialog */}
      <Dialog 
        open={openViewPricesDialog} 
        onClose={handleCloseViewPricesDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Vendor Prices - {selectedMaterial?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={() => {
                setOpenViewPricesDialog(false);
                handleAddPrice(selectedMaterial!);
              }}
            >
              Add Price
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Effective Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedMaterialPrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>{price.vendor.name}</TableCell>
                    <TableCell>${Number(price.price).toFixed(2)}</TableCell>
                    <TableCell>{new Date(price.effectiveDate).toLocaleDateString()}</TableCell>
                    <TableCell>{price.endDate ? new Date(price.endDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{price.notes || '-'}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setOpenViewPricesDialog(false);
                            handleOpenPriceDialog(selectedMaterial!, price);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePrice(selectedMaterial!, price)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {selectedMaterialPrices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No prices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewPricesDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccessMessage(null);
        }}
      >
        <Alert 
          severity={error ? 'error' : 'success'} 
          onClose={() => {
            setError(null);
            setSuccessMessage(null);
          }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Materials;