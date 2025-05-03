// src/components/projects/details/ProjectWorkItemsTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tooltip, 
  FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Project } from '../../../services/project.service';
import workItemService, { WorkItem } from '../../../services/workitem.service';

interface WorkItemFormData {
  code: string;
  name: string;
  unit: string;
  unitPrice: number;
  description?: string;
}

// Form validation schema
const workItemSchema = yup.object({
  code: yup.string().required('Code is required'),
  name: yup.string().required('Name is required'),
  unit: yup.string().required('Unit is required'),
  unitPrice: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Unit price is required')
    .min(0, 'Unit price must be positive'),
  description: yup.string().optional(),
}).required();

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

interface ProjectWorkItemsTabProps {
  project: Project;
}

const ProjectWorkItemsTab: React.FC<ProjectWorkItemsTabProps> = ({ project }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<WorkItemFormData>({
    resolver: yupResolver(workItemSchema),
    defaultValues: {
      code: '',
      name: '',
      unit: '',
      unitPrice: 0,
      description: '',
    }
  });

  // Fetch work items when component mounts
  useEffect(() => {
    fetchWorkItems();
  }, []);

  // Set form values when editing a work item
  useEffect(() => {
    if (editingWorkItem) {
      reset({
        code: editingWorkItem.code,
        name: editingWorkItem.name,
        unit: editingWorkItem.unit,
        unitPrice: editingWorkItem.unitPrice,
        description: editingWorkItem.description || '',
      });
    } else {
      reset({
        code: '',
        name: '',
        unit: '',
        unitPrice: 0,
        description: '',
      });
    }
  }, [editingWorkItem, reset]);

  const fetchWorkItems = async () => {
    setLoading(true);
    try {
      const response = await workItemService.getProjectWorkItems(project.id);
      setWorkItems(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching work items:', err);
      setError(err.response?.data?.message || 'Failed to load work items');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating or editing a work item
const handleOpenDialog = (workItem: WorkItem | null = null) => {
  setEditingWorkItem(workItem);
  
  // Reset form completely when creating a new work item
  if (!workItem) {
    reset({
      code: '',
      name: '',
      unit: '',
      unitPrice: 0,
      description: '',
    });
  }
  
  setOpenDialog(true);
};

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWorkItem(null);
  };

  // Handle form submission
  const onSubmit = async (data: WorkItemFormData) => {
    setFormSubmitting(true);
    try {
      if (editingWorkItem) {
        // Update existing work item
        const response = await workItemService.updateWorkItem(
          project.id, 
          editingWorkItem.id, 
          {
            name: data.name,
            unit: data.unit,
            unitPrice: data.unitPrice,
            description: data.description,
          }
        );
        
        // Update work item in the state
        setWorkItems(workItems.map(item => 
          item.id === editingWorkItem.id ? response.data : item
        ));
      } else {
        // Create new work item
        const response = await workItemService.createWorkItem(project.id, data);
        
        // Add new work item to the state
        setWorkItems([...workItems, response.data]);
      }
      
      // Close dialog after successful submission
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving work item:', err);
      setError(err.response?.data?.message || 'Failed to save work item');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete work item
  const handleDeleteWorkItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this work item?')) {
      try {
        await workItemService.deleteWorkItem(project.id, id);
        // Remove from state after successful deletion
        setWorkItems(workItems.filter(item => item.id !== id));
      } catch (err: any) {
        console.error('Error deleting work item:', err);
        alert(err.response?.data?.message || 'Failed to delete work item');
      }
    }
  };

  // Common unit options
  const unitOptions = [
    { value: 'EACH', label: 'Each' },
    { value: 'SF', label: 'Square Feet' },
    { value: 'SY', label: 'Square Yards' },
    { value: 'LF', label: 'Linear Feet' },
    { value: 'CY', label: 'Cubic Yards' },
    { value: 'DAY', label: 'Day' },
    { value: 'HOUR', label: 'Hour' },
    { value: 'LS', label: 'Lump Sum' },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Work Items</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchWorkItems}
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
            Add Work Item
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
        /* Work items table */
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ py: 2 }}>
                      No work items found. Add your first work item by clicking the "Add Work Item" button.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                workItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit work item">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete work item">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteWorkItem(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Work Item Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingWorkItem ? 'Edit Work Item' : 'Add New Work Item'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid component="div" container spacing={2}>
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Code"
                      fullWidth
                      margin="normal"
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      disabled={formSubmitting || (editingWorkItem !== null)}
                      placeholder="e.g., WI-001"
                    />
                  )}
                />
              </Grid>
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Name"
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
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      margin="normal"
                      error={!!errors.unit}
                      disabled={formSubmitting}
                    >
                      <InputLabel>Unit</InputLabel>
                      <Select
                        {...field}
                        label="Unit"
                      >
                        {unitOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label} ({option.value})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.unit && (
                        <FormHelperText>{errors.unit.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Controller
                  name="unitPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Unit Price"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!errors.unitPrice}
                      helperText={errors.unitPrice?.message}
                      disabled={formSubmitting}
                      InputProps={{
                        startAdornment: '$',
                      }}
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
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
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
              {formSubmitting ? 'Saving...' : (editingWorkItem ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default ProjectWorkItemsTab;