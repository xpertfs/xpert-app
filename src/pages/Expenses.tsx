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
  TablePagination,
  TableSortLabel,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Expense, ExpenseCreateData, ExpenseUpdateData } from '../services/expense.service';
import { Project } from '../services/project.service';
import expenseService from '../services/expense.service';
import projectService from '../services/project.service';
import ExpenseForm from '../components/expenses/ExpenseForm';

const EXPENSE_CATEGORIES = [
  { value: 'MATERIAL', label: 'Materials', color: '#2196f3' }, // Blue
  { value: 'TOOL', label: 'Tools', color: '#4caf50' }, // Green
  { value: 'RENTAL', label: 'Rentals', color: '#ff9800' }, // Orange
  { value: 'OPERATIONAL', label: 'Operational', color: '#9c27b0' }, // Purple
];

interface HeadCell {
  id: keyof Expense | 'actions';
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  { id: 'date', label: 'Date', numeric: false },
  { id: 'description', label: 'Description', numeric: false },
  { id: 'category', label: 'Category', numeric: false },
  { id: 'project', label: 'Project', numeric: false },
  { id: 'vendor', label: 'Vendor', numeric: false },
  { id: 'amount', label: 'Amount', numeric: true },
  { id: 'actions' as keyof Expense, label: 'Actions', numeric: false },
];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof Expense>('date');
  const [filters, setFilters] = useState({
    search: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    category: '',
    projectId: '',
    isGeneral: false,
  });

  // Fetch expenses and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesResponse, projectsResponse] = await Promise.all([
          expenseService.getExpenses(),
          projectService.getProjects(),
        ]);
        setExpenses(expensesResponse.data.expenses);
        setProjects(projectsResponse.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    if (field === 'projectId') {
      if (value === 'general') {
        setFilters(prev => ({ 
          ...prev, 
          projectId: '',
          isGeneral: true 
        }));
      } else {
        setFilters(prev => ({ 
          ...prev, 
          projectId: value,
          isGeneral: false 
        }));
      }
    } else {
      setFilters(prev => ({ ...prev, [field]: value }));
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      startDate: null,
      endDate: null,
      category: '',
      projectId: '',
      isGeneral: false,
    });
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
    setError(null);
  };

  const handleSubmitExpense = async (data: ExpenseCreateData | ExpenseUpdateData) => {
    try {
      setError(null);
      // Convert empty projectId to undefined
      const submitData = {
        ...data,
        projectId: data.projectId || undefined,
        vendorId: data.vendorId || undefined
      };

      let response: { data: Expense };
      if (selectedExpense) {
        response = await expenseService.updateExpense(selectedExpense.id, submitData);
      } else {
        response = await expenseService.createExpense(submitData as ExpenseCreateData);
      }

      if (response.data) {
        // Update the expenses list with the new/updated expense
        if (selectedExpense) {
          // Update existing expense
          setExpenses(prevExpenses => 
            prevExpenses.map(exp => 
              exp.id === selectedExpense.id ? response.data : exp
            )
          );
        } else {
          // Add new expense
          setExpenses(prevExpenses => [response.data, ...prevExpenses]);
        }
        setOpenForm(false);
        setSelectedExpense(undefined);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error saving expense:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save expense. Please try again.');
      throw err;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        // Refresh expenses
        const response = await expenseService.getExpenses();
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
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          expense.description.toLowerCase().includes(searchLower) ||
          expense.vendor?.name.toLowerCase().includes(searchLower) ||
          expense.vendor?.code.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      if (filters.startDate && new Date(expense.date) < filters.startDate) return false;
      if (filters.endDate && new Date(expense.date) > filters.endDate) return false;
      if (filters.category && expense.category !== filters.category) return false;
      if (filters.projectId && expense.project?.id !== filters.projectId) return false;
      if (filters.isGeneral && expense.project) return false;
      return true;
    })
    .sort((a, b) => {
      if (orderBy === 'amount') {
        // Handle amount sorting
        const aValue = Number(a.amount);
        const bValue = Number(b.amount);
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        // Handle other fields
        const aValue = a[orderBy] || '';
        const bValue = b[orderBy] || '';
        if (order === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      }
    });

  // Paginate expenses
  const paginatedExpenses = filteredExpenses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate summary totals
  const calculateSummary = () => {
    const summary = {
      total: 0,
      byCategory: {} as Record<string, number>,
    };

    filteredExpenses.forEach(expense => {
      const amount = Number(expense.amount);
      summary.total += amount;
      
      const category = expense.category;
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = 0;
      }
      summary.byCategory[category] += amount;
    });

    return summary;
  };

  const summary = calculateSummary();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          New Expense
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid component="div" container spacing={2} sx={{ mb: 3 }}>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="subtitle2" gutterBottom>
              Total Expenses
            </Typography>
            <Typography variant="h4">
              ${summary.total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </Typography>
          </Paper>
        </Grid>
        {EXPENSE_CATEGORIES.map((category) => (
          <Grid component="div" key={category.value} size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                borderLeft: `4px solid ${category.color}`,
                '&:hover': {
                  boxShadow: 2,
                }
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {category.label}
              </Typography>
              <Typography variant="h6" sx={{ color: category.color }}>
                ${(summary.byCategory[category.value] || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid component="div" container spacing={2}>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                slotProps={{
                  textField: { fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {EXPENSE_CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Project</InputLabel>
              <Select
                value={filters.projectId}
                label="Project"
                onChange={(e) => handleFilterChange('projectId', e.target.value)}
              >
                <MenuItem value="">All Projects</MenuItem>
                <MenuItem value="general">General Expenses</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid component="div" size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ height: '56px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
        <Paper>
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
                      {headCell.id === 'actions' ? (
                        headCell.label
                      ) : (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={() => handleRequestSort(headCell.id)}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                        size="small"
                        sx={{
                          bgcolor: EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.color,
                          color: 'white',
                          '&:hover': {
                            opacity: 0.9
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {expense.project ? (
                        <Typography variant="body2">
                          {expense.project.name} ({expense.project.code})
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          General
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.vendor ? (
                        <Typography variant="body2">
                          {expense.vendor.name} ({expense.vendor.code})
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No vendor
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      ${Number(expense.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenForm(expense)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredExpenses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Expense Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent>
          <ExpenseForm
            open={openForm}
            onClose={handleCloseForm}
            onSubmit={handleSubmitExpense}
            expense={selectedExpense}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Expenses;