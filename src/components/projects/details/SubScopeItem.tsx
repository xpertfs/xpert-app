// src/components/projects/details/SubScopeItem.tsx
import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  TextField,
  Button,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { SubScope } from '../../../services/project.service';
import workItemService from '../../../services/workitem.service';

interface SubScopeItemProps {
  projectId: string;
  scopeId: string;
  subScope: SubScope;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const SubScopeItem: React.FC<SubScopeItemProps> = ({
  projectId,
  scopeId,
  subScope,
  onEdit,
  onDelete,
  onUpdate
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState(false);

  // Initialize quantities and completed on component mount or when subScope changes
  React.useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    const initialCompleted: Record<string, number> = {};
    
    if (subScope.workItemQuantities) {
      subScope.workItemQuantities.forEach(wiq => {
        initialQuantities[wiq.id] = wiq.quantity;
        initialCompleted[wiq.id] = wiq.completed;
      });
    }
    
    setQuantities(initialQuantities);
    setCompleted(initialCompleted);
  }, [subScope]);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  const handleQuantityChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantities({
        ...quantities,
        [id]: numValue
      });
    }
  };

  const handleCompletedChange = (id: string, value: string) => {
    const numValue = parseFloat(value);
    const maxQuantity = quantities[id] || 0;
    
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxQuantity) {
      setCompleted({
        ...completed,
        [id]: numValue
      });
    }
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleSaveQuantities = async () => {
    setLoading(true);
    
    try {
      // Save each work item quantity and completion
      const promises = Object.entries(quantities).map(([id, quantity]) => {
        const workItemQuantity = subScope.workItemQuantities.find(wiq => wiq.id === id);
        const completedValue = completed[id] || 0;
        
        if (workItemQuantity && 
            (workItemQuantity.quantity !== quantity || 
             workItemQuantity.completed !== completedValue)) {
          return workItemService.updateSubScopeWorkItem(
            projectId,
            scopeId,
            subScope.id,
            workItemQuantity.workItemId,
            { 
              quantity,
              completed: completedValue 
            }
          );
        }
        
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      
      // Exit edit mode and notify parent
      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Error saving quantities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!subScope.workItemQuantities || subScope.workItemQuantities.length === 0) {
      return 0;
    }

    let totalValue = 0;
    let completedValue = 0;

    subScope.workItemQuantities.forEach(wiq => {
      const itemValue = wiq.quantity * wiq.workItem.unitPrice;
      totalValue += itemValue;
      completedValue += (wiq.completed / wiq.quantity) * itemValue;
    });

    return totalValue > 0 ? (completedValue / totalValue) * 100 : 0;
  };

  const completionPercentage = calculateCompletion();

  return (
    <Paper sx={{ mb: 2, borderRadius: 1 }} elevation={1}>
      <Accordion expanded={expanded} onChange={handleExpand}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ '&.Mui-expanded': { minHeight: 48 } }}
        >
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
            <Box>
              <Typography variant="subtitle2">
                {subScope.name} ({subScope.code})
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={completionPercentage}
                  sx={{ width: 100, mr: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {completionPercentage.toFixed(1)}% Complete
                </Typography>
              </Box>
            </Box>
            <Box onClick={(e) => e.stopPropagation()}>
              <Tooltip title="Edit Sub-Scope">
                <IconButton size="small" color="primary" onClick={onEdit}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Sub-Scope">
                <IconButton size="small" color="error" onClick={onDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {subScope.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subScope.description}
            </Typography>
          )}
          
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Work Items</Typography>

          {!editMode ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                size="small"
                onClick={handleEditMode}
                startIcon={<EditIcon />}
              >
                Edit Quantities
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button
                size="small"
                color="primary"
                variant="contained"
                onClick={handleSaveQuantities}
                startIcon={loading ? <CircularProgress size={18} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Quantities'}
              </Button>
            </Box>
          )}

          <TableContainer component={Paper} variant="outlined">
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
                </TableRow>
              </TableHead>
              <TableBody>
                {subScope.workItemQuantities && subScope.workItemQuantities.length > 0 ? (
                  subScope.workItemQuantities.map((wiq) => (
                    <TableRow key={wiq.id}>
                      <TableCell>{wiq.workItem.code}</TableCell>
                      <TableCell>{wiq.workItem.name}</TableCell>
                      <TableCell>{wiq.workItem.unit}</TableCell>
                      <TableCell align="right">{formatCurrency(wiq.workItem.unitPrice)}</TableCell>
                      <TableCell align="right">
                        {editMode ? (
                          <TextField
                            type="number"
                            size="small"
                            value={quantities[wiq.id] || 0}
                            onChange={(e) => handleQuantityChange(wiq.id, e.target.value)}
                            InputProps={{
                              inputProps: { min: 0, step: 0.01 }
                            }}
                            sx={{ width: 80 }}
                          />
                        ) : (
                          wiq.quantity
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {editMode ? (
                          <TextField
                            type="number"
                            size="small"
                            value={completed[wiq.id] || 0}
                            onChange={(e) => handleCompletedChange(wiq.id, e.target.value)}
                            InputProps={{
                              inputProps: { 
                                min: 0, 
                                max: quantities[wiq.id] || wiq.quantity,
                                step: 0.01 
                              }
                            }}
                            sx={{ width: 80 }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography variant="body2">
                              {wiq.completed} / {wiq.quantity}
                            </Typography>
                            <Box sx={{ width: 60, ml: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={wiq.quantity > 0 ? (wiq.completed / wiq.quantity) * 100 : 0}
                              />
                            </Box>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(wiq.quantity * wiq.workItem.unitPrice)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" sx={{ py: 2 }}>
                        No work items assigned to this sub-scope yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default SubScopeItem;