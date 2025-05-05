import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Collapse,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, KeyboardArrowDown as ExpandMoreIcon, KeyboardArrowUp as ExpandLessIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { unionClassService, UnionClass, CreateUnionClassData, CreateBaseRateData, CreateCustomRateData } from '../services/unionClassService';
import { format } from 'date-fns';

interface ExpandableRowProps {
  unionClass: UnionClass;
  onAddBaseRate: () => void;
  onAddCustomRate: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  isEven: boolean;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ unionClass, onAddBaseRate, onAddCustomRate, onDelete, onRefresh, isEven }) => {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd/yyyy');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDeleteBaseRate = async (baseRateId: number) => {
    if (!window.confirm('Are you sure you want to delete this base rate?')) return;
    try {
      await unionClassService.deleteBaseRate(unionClass.id, baseRateId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting base rate:', error);
    }
  };

  const handleDeleteCustomRate = async (customRateId: number) => {
    if (!window.confirm('Are you sure you want to delete this custom rate?')) return;
    try {
      await unionClassService.deleteCustomRate(unionClass.id, customRateId);
      onRefresh();
    } catch (error) {
      console.error('Error deleting custom rate:', error);
    }
  };

  return (
    <>
      <TableRow sx={{ 
        backgroundColor: isEven ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.01)',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
        },
      }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{unionClass.name}</TableCell>
        <TableCell>{unionClass.baseRates.length}</TableCell>
        <TableCell>{unionClass.customRates.length}</TableCell>
        <TableCell>
          <Button
            size="small"
            onClick={onAddBaseRate}
            sx={{ mr: 1 }}
          >
            Add Base Rate
          </Button>
          <Button
            size="small"
            onClick={onAddCustomRate}
            sx={{ mr: 1 }}
          >
            Add Custom Rate
          </Button>
          <Button
            size="small"
            color="error"
            onClick={onDelete}
          >
            Delete
          </Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ 
              margin: 2,
              backgroundColor: isEven ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.01)',
            }}>
              <Typography variant="h6" gutterBottom>Base Rates History</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Effective Date</TableCell>
                    <TableCell>Regular Rate</TableCell>
                    <TableCell>Overtime Rate</TableCell>
                    <TableCell>Benefits Rate</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unionClass.baseRates
                    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                    .map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>{formatDate(rate.effectiveDate)}</TableCell>
                        <TableCell>{formatCurrency(rate.regularRate)}</TableCell>
                        <TableCell>{formatCurrency(rate.overtimeRate)}</TableCell>
                        <TableCell>{formatCurrency(rate.benefitsRate)}</TableCell>
                        <TableCell>{rate.endDate ? formatDate(rate.endDate) : 'Current'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteBaseRate(rate.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Custom Rates History</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Effective Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unionClass.customRates
                    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
                    .map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>{rate.name}</TableCell>
                        <TableCell>{rate.description}</TableCell>
                        <TableCell>{formatCurrency(rate.rate)}</TableCell>
                        <TableCell>{formatDate(rate.effectiveDate)}</TableCell>
                        <TableCell>{rate.endDate ? formatDate(rate.endDate) : 'Current'}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCustomRate(rate.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const UnionClassifications: React.FC = () => {
  const [unionClasses, setUnionClasses] = useState<UnionClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<UnionClass | null>(null);
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [openBaseRateDialog, setOpenBaseRateDialog] = useState(false);
  const [openCustomRateDialog, setOpenCustomRateDialog] = useState(false);
  const [newClass, setNewClass] = useState<CreateUnionClassData>({ name: '' });
  const [newBaseRate, setNewBaseRate] = useState<CreateBaseRateData>({
    unionClassId: 0,
    regularRate: 0,
    overtimeRate: 0,
    benefitsRate: 0,
    effectiveDate: new Date().toISOString(),
  });
  const [newCustomRate, setNewCustomRate] = useState<CreateCustomRateData>({
    unionClassId: 0,
    name: '',
    rate: 0,
    effectiveDate: new Date().toISOString(),
  });

  useEffect(() => {
    loadUnionClasses();
  }, []);

  const loadUnionClasses = async () => {
    try {
      const classes = await unionClassService.getUnionClasses();
      setUnionClasses(classes);
    } catch (error) {
      console.error('Error loading union classes:', error);
    }
  };

  const handleCreateClass = async () => {
    try {
      await unionClassService.createUnionClass(newClass);
      setOpenClassDialog(false);
      setNewClass({ name: '' });
      loadUnionClasses();
    } catch (error) {
      console.error('Error creating union class:', error);
    }
  };

  const handleCreateBaseRate = async () => {
    if (!selectedClass) return;
    try {
      await unionClassService.createBaseRate({
        ...newBaseRate,
        unionClassId: selectedClass.id,
      });
      setOpenBaseRateDialog(false);
      setNewBaseRate({
        unionClassId: 0,
        regularRate: 0,
        overtimeRate: 0,
        benefitsRate: 0,
        effectiveDate: new Date().toISOString(),
      });
      loadUnionClasses();
    } catch (error) {
      console.error('Error creating base rate:', error);
    }
  };

  const handleCreateCustomRate = async () => {
    if (!selectedClass) return;
    try {
      await unionClassService.createCustomRate({
        ...newCustomRate,
        unionClassId: selectedClass.id,
      });
      setOpenCustomRateDialog(false);
      setNewCustomRate({
        unionClassId: 0,
        name: '',
        rate: 0,
        effectiveDate: new Date().toISOString(),
      });
      loadUnionClasses();
    } catch (error) {
      console.error('Error creating custom rate:', error);
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this union class?')) return;
    try {
      await unionClassService.deleteUnionClass(id);
      loadUnionClasses();
    } catch (error: any) {
      console.error('Error deleting union class:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete union class. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid component="div" container spacing={3}>
        <Grid component="div" size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Union Classifications</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenClassDialog(true)}
            >
              Add Union Class
            </Button>
          </Box>
        </Grid>

        <Grid component="div" size={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50} /> {/* Expand/Collapse cell */}
                  <TableCell>Name</TableCell>
                  <TableCell>Base Rates</TableCell>
                  <TableCell>Custom Rates</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unionClasses.map((unionClass, index) => (
                  <ExpandableRow
                    key={unionClass.id}
                    unionClass={unionClass}
                    onAddBaseRate={() => {
                      setSelectedClass(unionClass);
                      setOpenBaseRateDialog(true);
                    }}
                    onAddCustomRate={() => {
                      setSelectedClass(unionClass);
                      setOpenCustomRateDialog(true);
                    }}
                    onDelete={() => handleDeleteClass(unionClass.id)}
                    onRefresh={loadUnionClasses}
                    isEven={index % 2 === 0}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Add Union Class Dialog */}
      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)}>
        <DialogTitle>Add Union Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newClass.name}
            onChange={(e) => setNewClass({ name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClassDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateClass} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Base Rate Dialog */}
      <Dialog open={openBaseRateDialog} onClose={() => setOpenBaseRateDialog(false)}>
        <DialogTitle>Add Base Rate</DialogTitle>
        <DialogContent>
          <Grid component="div" container spacing={2}>
            <Grid component="div" size={12}>
              <TextField
                label="Regular Rate"
                type="number"
                fullWidth
                value={newBaseRate.regularRate}
                onChange={(e) => setNewBaseRate({ ...newBaseRate, regularRate: Number(e.target.value) })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                label="Overtime Rate"
                type="number"
                fullWidth
                value={newBaseRate.overtimeRate}
                onChange={(e) => setNewBaseRate({ ...newBaseRate, overtimeRate: Number(e.target.value) })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                label="Benefits Rate"
                type="number"
                fullWidth
                value={newBaseRate.benefitsRate}
                onChange={(e) => setNewBaseRate({ ...newBaseRate, benefitsRate: Number(e.target.value) })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <DatePicker
                label="Effective Date"
                value={new Date(newBaseRate.effectiveDate)}
                onChange={(date) => setNewBaseRate({ ...newBaseRate, effectiveDate: date?.toISOString() || '' })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <DatePicker
                label="End Date (Optional)"
                value={newBaseRate.endDate ? new Date(newBaseRate.endDate) : null}
                onChange={(date) => setNewBaseRate({ ...newBaseRate, endDate: date?.toISOString() })}
                slotProps={{
                  textField: {
                    helperText: 'Leave empty if this is the current rate'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBaseRateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBaseRate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Custom Rate Dialog */}
      <Dialog open={openCustomRateDialog} onClose={() => setOpenCustomRateDialog(false)}>
        <DialogTitle>Add Custom Rate</DialogTitle>
        <DialogContent>
          <Grid component="div" container spacing={2}>
            <Grid component="div" size={12}>
              <TextField
                label="Name"
                fullWidth
                value={newCustomRate.name}
                onChange={(e) => setNewCustomRate({ ...newCustomRate, name: e.target.value })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={newCustomRate.description || ''}
                onChange={(e) => setNewCustomRate({ ...newCustomRate, description: e.target.value })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <TextField
                label="Rate"
                type="number"
                fullWidth
                value={newCustomRate.rate}
                onChange={(e) => setNewCustomRate({ ...newCustomRate, rate: Number(e.target.value) })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <DatePicker
                label="Effective Date"
                value={new Date(newCustomRate.effectiveDate)}
                onChange={(date) => setNewCustomRate({ ...newCustomRate, effectiveDate: date?.toISOString() || '' })}
              />
            </Grid>
            <Grid component="div" size={12}>
              <DatePicker
                label="End Date (Optional)"
                value={newCustomRate.endDate ? new Date(newCustomRate.endDate) : null}
                onChange={(date) => setNewCustomRate({ ...newCustomRate, endDate: date?.toISOString() })}
                slotProps={{
                  textField: {
                    helperText: 'Leave empty if this is the current rate'
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomRateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateCustomRate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UnionClassifications; 