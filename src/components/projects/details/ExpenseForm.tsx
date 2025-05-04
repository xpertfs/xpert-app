import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Expense, ExpenseCreateData, ExpenseUpdateData } from '../../../services/expense.service';
import { Vendor } from '../../../services/material.service';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreateData | ExpenseUpdateData) => void;
  expense?: Expense;
  vendors: Vendor[];
  projectId: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'MATERIAL', label: 'Materials' },
  { value: 'TOOL', label: 'Tools' },
  { value: 'RENTAL', label: 'Rentals' },
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'LABOR', label: 'Labor' },
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  onSubmit,
  expense,
  vendors,
  projectId,
}) => {
  const [formData, setFormData] = React.useState<ExpenseCreateData>({
    date: new Date().toISOString(),
    amount: 0,
    description: '',
    category: 'MATERIAL',
    vendorId: '',
    projectId: projectId,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset form data when expense changes or form opens/closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        date: expense?.date || new Date().toISOString(),
        amount: expense?.amount || 0,
        description: expense?.description || '',
        category: expense?.category || 'MATERIAL',
        vendorId: expense?.vendor?.id || '',
        projectId: projectId,
      });
    } else {
      // Reset form when closed
      setFormData({
        date: new Date().toISOString(),
        amount: 0,
        description: '',
        category: 'MATERIAL',
        vendorId: '',
        projectId: projectId,
      });
      setErrors({});
    }
  }, [open, expense, projectId]);

  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.toISOString(),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={new Date(formData.date)}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid sx={{ width: '100%' }}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={handleSelectChange('category')}
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid sx={{ width: '100%' }}>
              <FormControl fullWidth error={!!errors.vendorId}>
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={formData.vendorId}
                  label="Vendor"
                  onChange={handleSelectChange('vendorId')}
                >
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.vendorId && <FormHelperText>{errors.vendorId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleTextChange('description')}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>

            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={handleTextChange('amount')}
                error={!!errors.amount}
                helperText={errors.amount}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {expense ? 'Update' : 'Add'} Expense
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseForm; 