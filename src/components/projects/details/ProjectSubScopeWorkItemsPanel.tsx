// src/components/projects/details/ProjectSubScopeWorkItemsPanel.tsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Collapse,
  Grid,
  Divider,
  LinearProgress,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import workItemService, { WorkItem, SubScopeWorkItem } from '../../../services/workitem.service';
import { SubScope } from '../../../services/project.service';

interface SubScopeWorkItemsProps {
  projectId: string;
  scopeId: string;
  subScope: SubScope;
  onUpdateCompletion: () => void;
}

// Types for form data
interface WorkItemAssignFormData {
  workItemId: string;
  quantity: number;
}

// Form validation schema
const workItemAssignSchema = yup.object().shape({
  workItemId: yup.string().required('Work item is required'),
  quantity: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Quantity is required')
    .min(0.01, 'Quantity must be greater than 0'),
});

// Types for completion form data
interface WorkItemCompletionFormData {
  completed: number;
}

// Form validation schema for completion
const workItemCompletionSchema = yup.object().shape({
  completed: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Completed value is required')
    .min(0, 'Completed value must be positive'),
});

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const ProjectSubScopeWorkItemsPanel: React.FC<SubScopeWorkItemsProps> = ({
  projectId,
  scopeId,
  subScope,
  onUpdateCompletion
}) => {
  const [expanded, setExpanded] = useState(false);
  const [subScopeWorkItems, setSubScopeWorkItems] = useState<SubScopeWorkItem[]>([]);
  const [availableWorkItems, setAvailableWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openCompletionDialog, setOpenCompletionDialog] = useState(false);
  const [editingWorkItemId, setEditingWorkItemId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form handling for assigning work items
  const { control: assignControl, handleSubmit: handleAssignSubmit, reset: resetAssignForm, formState: { errors: assignErrors } } = useForm<WorkItemAssignFormData>({
    resolver: yupResolver(workItemAssignSchema),
    defaultValues: {
      workItemId: '',
      quantity: 0,
    }
  });

  // Form handling for updating completion
  const { control: completionControl, handleSubmit: handleCompletionSubmit, setValue: setCompletionValue, formState: { errors: completionErrors } } = useForm<WorkItemCompletionFormData>({
    resolver: yupResolver(workItemCompletionSchema),
    defaultValues: {
      completed: 0,
    }
  });

  // Fetch sub-scope work items and available work items when component mounts or expanded
  useEffect(() => {
    if (expanded) {
      fetchSubScopeWorkItems();
      fetchAvailableWorkItems();
    }
  }, [expanded]);

  // Fetch sub-scope work items
  const fetchSubScopeWorkItems = async () => {
    setLoading(true);
    try {
      const response = await workItemService.getSubScopeWorkItems(projectId, scopeId, subScope.id);
      setSubScopeWorkItems(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching sub-scope work items:', err);
      setError(err.response?.data?.message || 'Failed to load sub-scope work items');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available work items
  const fetchAvailableWorkItems = async () => {
    try {
      const response = await workItemService.getProjectWorkItems(projectId);
      setAvailableWorkItems(response.data);
    } catch (err: any) {
      console.error('Error fetching available work items:', err);
    }
  };

  // Open dialog for assigning a work item
  const handleOpenAssignDialog = () => {
    resetAssignForm({
      workItemId: '',
      quantity: 0,
    });
    setOpenAssignDialog(true);
  };

  // Close assign dialog
  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
  };

  // Open dialog for updating completion
  const handleOpenCompletionDialog = (workItem: SubScopeWorkItem) => {
    setEditingWorkItemId(workItem.id);
    setCompletionValue('completed', workItem.completed);
    setOpenCompletionDialog(true);
  };

  // Close completion dialog
  const handleCloseCompletionDialog = () => {
    setOpenCompletionDialog(false);
    setEditingWorkItemId(null);
  };

  // Handle assigning a work item
  const onAssignSubmit = async (data: WorkItemAssignFormData) => {
    setFormSubmitting(true);
    try {
      const response = await workItemService.assignWorkItemToSubScope(
        projectId,
        scopeId,
        subScope.id,
        data.workItemId,
        data.quantity
      );
      
      // Add new work item to the state
      setSubScopeWorkItems([...subScopeWorkItems, response.data]);
      
      // Close dialog after successful submission
      handleCloseAssignDialog();
      
      // Update completion percentage
      onUpdateCompletion();
    } catch (err: any) {
      console.error('Error assigning work item:', err);
      setError(err.response?.data?.message || 'Failed to assign work item');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle updating completion
  const onCompletionSubmit = async (data: WorkItemCompletionFormData) => {
    if (!editingWorkItemId) return;
    
    setFormSubmitting(true);
    try {
      const response = await workItemService.updateSubScopeWorkItem(
        projectId,
        scopeId,
        subScope.id,
        editingWorkItemId,
        { completed: data.completed }
      );
      
      // Update work item in the state
      setSubScopeWorkItems(subScopeWorkItems.map(item => 
        item.id === editingWorkItemId ? response.data : item
      ));
      
      // Close dialog after successful submission
      handleCloseCompletionDialog();
      
      // Update completion percentage
      onUpdateCompletion();
    } catch (err: any) {
      console.error('Error updating completion:', err);
      setError(err.response?.data?.message || 'Failed to update completion');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle removing a work item
  const handleRemoveWorkItem = async (workItemId: string) => {
    if (window.confirm('Are you sure you want to remove this work item from the sub-scope?')) {
      try {
        await workItemService.removeWorkItemFromSubScope(
          projectId,
          scopeId,
          subScope.id,
          workItemId
        );
        
        // Remove from state after successful deletion
        setSubScopeWorkItems(subScopeWorkItems.filter(item => item.id !== workItemId));
        
        // Update completion percentage
        onUpdateCompletion();
      } catch (err: any) {
        console.error('Error removing work item:', err);
        alert(err.response?.data?.message || 'Failed to remove work item');
      }
    }
  };

  // Calculate sub-scope totals
  const calculateTotals = () => {
    const totalAmount = subScopeWorkItems.reduce((sum, item) => {
      return sum + (item.quantity * item.workItem.unitPrice);
    }, 0);
    
    const completedAmount = subScopeWorkItems.reduce((sum, item) => {
      return sum + (item.completed * item.workItem.unitPrice);
    }, 0);
    
    const completionPercentage = totalAmount > 0 
      ? Math.round((completedAmount / totalAmount) * 100) 
      : 0;
    
    return { totalAmount, completedAmount, completionPercentage };
  };

  const { totalAmount, completedAmount, completionPercentage } = calculateTotals();

  return (
    <Paper elevation={1} sx={{ mb: 2 }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          "&:hover": { bgcolor: 'rgba(0, 0, 0, 0.04)' }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ mr: 1 }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {subScope.name} ({subScope.code})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 100, mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={subScope.percentComplete} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {subScope.percentComplete}%
          </Typography>
        </Box>
      </Box>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1">Work Items</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAssignDialog();
              }}
            >
              Assign Work Item
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Completed</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subScopeWorkItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body2" sx={{ py: 2 }}>
                            No work items assigned to this sub-scope yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      subScopeWorkItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.workItem.code}</TableCell>
                          <TableCell>{item.workItem.name}</TableCell>
                          <TableCell>{item.workItem.unit}</TableCell>
                          <TableCell align="right">{formatCurrency(item.workItem.unitPrice)}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <Typography variant="body2">
                                {item.completed} / {item.quantity}
                              </Typography>
                              <Box sx={{ width: 60, ml: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(item.completed / item.quantity) * 100} 
                                />
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(item.quantity * item.workItem.unitPrice)}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Update completion">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCompletionDialog(item);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove work item">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveWorkItem(item.id);
                                }}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Paper elevation={2} sx={{ p: 2, width: 300 }}>
                  <Typography variant="subtitle2" gutterBottom>Summary</Typography>
                  <Grid component="div" container spacing={1}>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" align="right">{formatCurrency(totalAmount)}</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Completed Amount:</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" align="right">{formatCurrency(completedAmount)}</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 12 }}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="subtitle2">Completion:</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="subtitle2" align="right">{completionPercentage}%</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            </>
          )}
        </Box>
      </Collapse>
      
      {/* Work Item Assignment Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Work Item to {subScope.name}
        </DialogTitle>
        <form onSubmit={handleAssignSubmit(onAssignSubmit)}>
          <DialogContent dividers>
            <Grid component="div" container spacing={2}>
              <Grid component="div" size={{ xs: 12 }}>
                <Controller
                  name="workItemId"
                  control={assignControl}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      margin="normal"
                      error={!!assignErrors.workItemId}
                      disabled={formSubmitting}
                    >
                      <InputLabel>Work Item</InputLabel>
                      <Select
                        {...field}
                        label="Work Item"
                      >
                        {availableWorkItems
                          .filter(item => !subScopeWorkItems.some(swi => swi.workItemId === item.id))
                          .map(item => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.code} - {item.name} ({formatCurrency(item.unitPrice)} per {item.unit})
                            </MenuItem>
                          ))}
                      </Select>
                      {assignErrors.workItemId && (
                        <FormHelperText>{assignErrors.workItemId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid component="div" size={{ xs: 12 }}>
                <Controller
                  name="quantity"
                  control={assignControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Quantity"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!assignErrors.quantity}
                      helperText={assignErrors.quantity?.message}
                      disabled={formSubmitting}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseAssignDialog} 
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
              {formSubmitting ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Work Item Completion Dialog */}
      <Dialog
        open={openCompletionDialog}
        onClose={handleCloseCompletionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Completion
        </DialogTitle>
        <form onSubmit={handleCompletionSubmit(onCompletionSubmit)}>
          <DialogContent dividers>
            <Grid component="div" container spacing={2}>
              <Grid component="div" size={{ xs: 12 }}>
                {editingWorkItemId && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Work Item:</Typography>
                    <Typography variant="body1">
                      {subScopeWorkItems.find(item => item.id === editingWorkItemId)?.workItem.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Quantity: {subScopeWorkItems.find(item => item.id === editingWorkItemId)?.quantity}
                    </Typography>
                  </Box>
                )}
                <Controller
                  name="completed"
                  control={completionControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Completed Quantity"
                      type="number"
                      fullWidth
                      margin="normal"
                      error={!!completionErrors.completed}
                      helperText={
                        completionErrors.completed?.message || 
                        `Enter the total completed quantity (0 - ${subScopeWorkItems.find(item => item.id === editingWorkItemId)?.quantity})`
                      }
                      disabled={formSubmitting}
                      InputProps={{
                        inputProps: { 
                          min: 0, 
                          max: subScopeWorkItems.find(item => item.id === editingWorkItemId)?.quantity 
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseCompletionDialog} 
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
              {formSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
};

export default ProjectSubScopeWorkItemsPanel;