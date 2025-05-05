import React, { useState, useEffect } from 'react';
import {
  Box,
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
import { Expense, ExpenseCreateData, ExpenseUpdateData } from '../../services/expense.service';
import { Project } from '../../services/project.service';
import { Vendor } from '../../services/material.service';
import projectService from '../../services/project.service';
import materialService from '../../services/material.service';

const EXPENSE_CATEGORIES = [
  { value: 'MATERIAL', label: 'Materials' },
  { value: 'TOOL', label: 'Tools' },
  { value: 'RENTAL', label: 'Rentals' },
  { value: 'OPERATIONAL', label: 'Operational' },
];

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreateData | ExpenseUpdateData) => void;
  expense?: Expense;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  open,
  onClose,
  onSubmit,
  expense,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [formData, setFormData] = useState<ExpenseCreateData>({
    date: new Date().toISOString(),
    amount: 0,
    description: '',
    category: 'MATERIAL',
    projectId: '',
    vendorId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch projects and vendors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, vendorsResponse] = await Promise.all([
          projectService.getProjects(),
          materialService.getVendors(),
        ]);
        setProjects(projectsResponse.data);
        setVendors(vendorsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // Reset form data when expense changes or form opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        date: expense?.date || new Date().toISOString(),
        amount: expense?.amount || 0,
        description: expense?.description || '',
        category: expense?.category || 'MATERIAL',
        projectId: expense?.project?.id || '',
        vendorId: expense?.vendor?.id || '',
      });
    } else {
      // Reset form when closed
      setFormData({
        date: new Date().toISOString(),
        amount: 0,
        description: '',
        category: 'MATERIAL',
        projectId: '',
        vendorId: '',
      });
      setErrors({});
    }
  }, [open, expense]);

  const handleTextChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'amount' ? parseFloat(event.target.value) || 0 : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
      onClose(); // Close the form after successful submission
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid component="div" container spacing={2}>
        <Grid component="div" size={{ xs: 12 }}>
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

        <Grid component="div" size={{ xs: 12 }}>
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

        <Grid component="div" size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={handleTextChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={2}
          />
        </Grid>

        <Grid component="div" size={{ xs: 12 }}>
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

        <Grid component="div" size={{ xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel>Project (Optional)</InputLabel>
            <Select
              value={formData.projectId}
              label="Project (Optional)"
              onChange={handleSelectChange('projectId')}
            >
              <MenuItem value="">No Project</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid component="div" size={{ xs: 12 }}>
          <FormControl fullWidth>
            <InputLabel>Vendor (Optional)</InputLabel>
            <Select
              value={formData.vendorId}
              label="Vendor (Optional)"
              onChange={handleSelectChange('vendorId')}
            >
              <MenuItem value="">No Vendor</MenuItem>
              {vendors.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained">Save</Button>
      </Box>
    </Box>
  );
};

export default ExpenseForm; 