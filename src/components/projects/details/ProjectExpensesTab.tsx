// src/components/projects/details/ProjectExpensesTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  TablePagination,
  TableSortLabel,
  Tooltip,
  Stack,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Expense, ExpenseCreateData, ExpenseUpdateData } from '../../../services/expense.service';
import { Vendor } from '../../../services/material.service';
import materialService from '../../../services/material.service';
import expenseService from '../../../services/expense.service';
import ExpenseForm from './ExpenseForm';

interface ProjectExpensesTabProps {
  projectId: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Expense | 'actions';
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'date', label: 'Date', numeric: false },
  { id: 'description', label: 'Description', numeric: false },
  { id: 'category', label: 'Category', numeric: false },
  { id: 'vendor', label: 'Vendor', numeric: false },
  { id: 'amount', label: 'Amount', numeric: true },
  { id: 'actions' as keyof Expense, label: 'Actions', numeric: false },
];

const EXPENSE_CATEGORIES = [
  { 
    value: 'MATERIAL', 
    label: 'Materials', 
    color: 'info.main',
    bgColor: 'rgba(25, 118, 210, 0.08)',
    borderColor: 'info.light'
  },
  { 
    value: 'TOOL', 
    label: 'Tools', 
    color: 'success.main',
    bgColor: 'rgba(46, 125, 50, 0.08)',
    borderColor: 'success.light'
  },
  { 
    value: 'RENTAL', 
    label: 'Rentals', 
    color: 'warning.main',
    bgColor: 'rgba(237, 108, 2, 0.08)',
    borderColor: 'warning.light'
  },
  { 
    value: 'OPERATIONAL', 
    label: 'Operational', 
    color: 'error.main',
    bgColor: 'rgba(211, 47, 47, 0.08)',
    borderColor: 'error.light'
  },
  { 
    value: 'LABOR', 
    label: 'Labor', 
    color: 'secondary.main',
    bgColor: 'rgba(156, 39, 176, 0.08)',
    borderColor: 'secondary.light'
  },
];

const getCategoryStyle = (category: string) => {
  const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
  return categoryInfo || { 
    color: 'text.primary', 
    bgColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: 'grey.300'
  };
};

const ProjectExpensesTab: React.FC<ProjectExpensesTabProps> = ({ projectId }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Expense>('date');
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    category: '',
    vendorId: '',
  });
  const [summaryData, setSummaryData] = useState<Record<string, number>>({});

  // Fetch expenses and vendors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching expenses for project:', projectId);
        const [expensesResponse, vendorsResponse] = await Promise.all([
          expenseService.getExpensesByProject(projectId),
          materialService.getVendors().catch(err => {
            console.warn('Failed to load vendors:', err);
            return { data: [] };
          }),
        ]);
        console.log('Expenses response:', expensesResponse);
        console.log('Vendors response:', vendorsResponse);
        setExpenses(expensesResponse.data.expenses);
        setVendors(vendorsResponse.data);
        setSummaryData(expensesResponse.data.totalsByCategory);
      } catch (err: any) {
        console.error('Error details:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Error status:', err.response.status);
        }
        setError('Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Handle sorting
  const handleRequestSort = (property: keyof Expense | 'actions') => {
    if (property === 'actions') return;
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property as keyof Expense);
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filters
  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Handle expense form
  const handleOpenForm = (expense?: Expense) => {
    setSelectedExpense(expense);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedExpense(undefined);
  };

  const handleSubmitExpense = async (data: ExpenseCreateData | ExpenseUpdateData) => {
    try {
      if (selectedExpense) {
        await expenseService.updateExpense(selectedExpense.id, data);
      } else {
        await expenseService.createExpense(data as ExpenseCreateData);
      }
      // Refresh expenses
      const response = await expenseService.getExpensesByProject(projectId);
      setExpenses(response.data.expenses);
      handleCloseForm();
    } catch (err) {
      setError('Failed to save expense');
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        // Refresh expenses
        const response = await expenseService.getExpensesByProject(projectId);
        setExpenses(response.data.expenses);
      } catch (err) {
        setError('Failed to delete expense');
        console.error(err);
      }
    }
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      if (filters.startDate && new Date(expense.date) < filters.startDate) return false;
      if (filters.endDate && new Date(expense.date) > filters.endDate) return false;
      if (filters.category && expense.category !== filters.category) return false;
      if (filters.vendorId && expense.vendor?.id !== filters.vendorId) return false;
      return true;
    })
    .sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  // Paginate expenses
  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add Expense
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid component="div" container spacing={2} sx={{ mb: 3 }}>
        {/* Total Expenses Card */}
        <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              textAlign: 'center', 
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              border: '1px solid',
              borderColor: 'primary.light'
            }}
          >
            <Typography variant="h6" color="primary.main">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(Object.values(summaryData).reduce((sum, amount) => sum + amount, 0))}
            </Typography>
            <Typography variant="body2" color="primary.main">
              Total Expenses
            </Typography>
          </Paper>
        </Grid>
        {/* Category Cards */}
        {Object.entries(summaryData).map(([category, amount]) => {
          const { color, bgColor, borderColor } = getCategoryStyle(category);
          return (
            <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }} key={category}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  bgcolor: bgColor,
                  border: '1px solid',
                  borderColor: borderColor
                }}
              >
                <Typography variant="h6" color={color}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(amount)}
                </Typography>
                <Typography variant="body2" color={color}>
                  {EXPENSE_CATEGORIES.find(c => c.value === category)?.label || category}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={filters.startDate}
            onChange={(date) => handleFilterChange('startDate', date)}
            slotProps={{
              textField: { size: 'small' },
            }}
          />
          <DatePicker
            label="End Date"
            value={filters.endDate}
            onChange={(date) => handleFilterChange('endDate', date)}
            slotProps={{
              textField: { size: 'small' },
            }}
          />
        </LocalizationProvider>
        <TextField
          select
          label="Category"
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          {EXPENSE_CATEGORIES.map((category) => (
            <MenuItem key={category.value} value={category.value}>
              {category.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Vendor"
          value={filters.vendorId}
          onChange={(e) => handleFilterChange('vendorId', e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {vendors.map((vendor) => (
            <MenuItem key={vendor.id} value={vendor.id}>
              {vendor.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Expenses Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.id !== 'actions' ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExpenses.map((expense) => {
              const { color, bgColor, borderColor } = getCategoryStyle(expense.category);
              return (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                      size="small"
                      sx={{
                        bgcolor: bgColor,
                        color: color,
                        border: '1px solid',
                        borderColor: borderColor,
                        '&:hover': {
                          bgcolor: bgColor,
                          opacity: 0.9
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{expense.vendor?.name || 'N/A'}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(expense)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteExpense(expense.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredExpenses.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Expense Form Modal */}
      <ExpenseForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmitExpense}
        expense={selectedExpense}
        vendors={vendors}
        projectId={projectId}
      />
    </Paper>
  );
};

export default ProjectExpensesTab;