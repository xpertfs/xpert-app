// src/pages/projects/ProjectDetails.tsx
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon, PictureAsPdf as PdfIcon, Timeline } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';

// Import services and their types
import projectService, { Project, Scope, SubScope, WorkItem } from '../../services/project.service';
import timesheetService, { TimeEntry } from '../../services/timesheet.service';
import expenseService, { Expense } from '../../services/expense.service';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeEntriesLoading, setTimeEntriesLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // Get user info from Redux store
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await projectService.getProjectById(id as string);
        setProject(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load project details');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  useEffect(() => {
    // Only fetch related data when the relevant tab is selected
    if (tabValue === 2 && timeEntries.length === 0) {
      fetchTimeEntries();
    } else if (tabValue === 3 && expenses.length === 0) {
      fetchExpenses();
    }
  }, [tabValue]);

  const fetchTimeEntries = async () => {
    if (!id) return;
    setTimeEntriesLoading(true);
    try {
      const response = await timesheetService.getProjectTimeEntries(id, { limit: 100 });
      setTimeEntries(response.data.timeEntries);
    } catch (err: any) {
      console.error('Error fetching time entries:', err);
    } finally {
      setTimeEntriesLoading(false);
    }
  };

  const fetchExpenses = async () => {
    if (!id) return;
    setExpensesLoading(true);
    try {
      const response = await expenseService.getExpensesByProject(id);
      setExpenses(response.data.expenses);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'primary';
      case 'PLANNING':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'ON_HOLD':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Helper function to get category icon
  const getExpenseCategoryLabel = (category: string) => {
    switch (category) {
      case 'MATERIAL':
        return 'Materials';
      case 'TOOL':
        return 'Tools';
      case 'RENTAL':
        return 'Rentals';
      case 'OPERATIONAL':
        return 'Operational';
      case 'LABOR':
        return 'Labor';
      default:
        return 'Other';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="warning">Project not found</Alert>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>{project.name}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<PdfIcon />}
          sx={{ mr: 2 }}
        >
          Export
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={() => navigate(`/projects/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Scopes" />
          <Tab label="Labor" />
          <Tab label="Expenses" />
          <Tab label="Materials" />
          <Tab label="Financial" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid component="div" container spacing={3}>
          <Grid component="div" size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Project Details</Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid component="div" container spacing={2}>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                    <Typography variant="body1">{project.client.name}</Typography>
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={project.status.replace('_', ' ')} 
                      color={getStatusColor(project.status)} 
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                    <Typography variant="body1">
                      {formatDate(project.startDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                    <Typography variant="body1">
                      {formatDate(project.endDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Contract Value</Typography>
                    <Typography variant="body1">{formatCurrency(project.value)}</Typography>
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Completion</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={project.finances.completedValue / project.finances.contractValue * 100} 
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(project.finances.completedValue / project.finances.contractValue * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12}}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{project.description || 'No description provided.'}</Typography>
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12}}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">
                      {project.address ? 
                        `${project.address}, ${project.city}, ${project.state} ${project.zip}` :
                        'No address provided.'
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Client Contact</Typography>
              <Divider sx={{ my: 2 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemText 
                    primary={project.client.contactName || 'Not specified'}
                    secondary="Contact Name"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemText 
                    primary={project.client.email || 'Not specified'}
                    secondary="Email"
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText 
                    primary={project.client.phone || 'Not specified'}
                    secondary="Phone"
                  />
                </ListItem>
              </List>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Financial Summary</Typography>
              <Divider sx={{ my: 2 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemText 
                    primary={formatCurrency(project.finances.completedValue)}
                    secondary="Completed Value"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemText 
                    primary={formatCurrency(project.finances.totalCost)}
                    secondary="Total Cost"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemText 
                    primary={formatCurrency(project.finances.profit)}
                    secondary="Current Profit"
                    primaryTypographyProps={{
                      color: project.finances.profit >= 0 ? 'success.main' : 'error.main'
                    }}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText 
                    primary={`${project.finances.profitMargin.toFixed(2)}%`}
                    secondary="Profit Margin"
                    primaryTypographyProps={{
                      color: project.finances.profitMargin >= 0 ? 'success.main' : 'error.main'
                    }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Scopes Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Project Scopes</Typography>
          
          {project.scopes.length > 0 ? (
            project.scopes.map((scope) => (
              <Paper key={scope.id} elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1">{scope.name} ({scope.code})</Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Sub-Scope</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell align="right">Completion %</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {scope.subScopes.map((subScope) => (
                        <TableRow key={subScope.id}>
                          <TableCell>{subScope.name}</TableCell>
                          <TableCell>{subScope.code}</TableCell>
                          <TableCell align="right">{subScope.percentComplete}%</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress variant="determinate" value={subScope.percentComplete} />
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No scopes have been defined for this project yet.
            </Alert>
          )}
        </Paper>
      )}

      {/* Labor Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Labor Entries</Typography>
          
          {timeEntriesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : timeEntries.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell align="right">Regular Hours</TableCell>
                    <TableCell align="right">Overtime Hours</TableCell>
                    <TableCell align="right">Double Hours</TableCell>
                    <TableCell align="right">Total Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{`${entry.employee.firstName} ${entry.employee.lastName}`}</TableCell>
                      <TableCell align="right">{entry.regularHours}</TableCell>
                      <TableCell align="right">{entry.overtimeHours}</TableCell>
                      <TableCell align="right">{entry.doubleHours}</TableCell>
                      <TableCell align="right">
                        {entry.regularHours + entry.overtimeHours + entry.doubleHours}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No labor entries have been recorded for this project yet.
            </Alert>
          )}
        </Paper>
      )}

      {/* Expenses Tab */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Expenses</Typography>
          
          {expensesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : expenses.length > 0 ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Grid component="div" container spacing={2}>
                  <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(
                          expenses.reduce((sum, expense) => sum + expense.amount, 0)
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Expenses
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">
                        {expenses.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Number of Expenses
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid component="div" size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6">
                        {formatCurrency(
                          expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Average Expense
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.date)}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getExpenseCategoryLabel(expense.category)} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{expense.vendor?.name || 'N/A'}</TableCell>
                        <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No expenses have been recorded for this project yet.
            </Alert>
          )}
        </Paper>
      )}

      {/* Materials Tab */}
      {tabValue === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Materials</Typography>
          <Alert severity="info">
            Material tracking for this project will be displayed here. This feature is currently under development.
          </Alert>
        </Paper>
      )}

      {/* Financial Tab */}
      {tabValue === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Financial Overview</Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid component="div" container spacing={3}>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Revenue & Costs</Typography>
                <Box sx={{ mb: 2 }}>
                  <Grid component="div" container spacing={2}>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Contract Value</Typography>
                      <Typography variant="h6">{formatCurrency(project.finances.contractValue)}</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Completed Value</Typography>
                      <Typography variant="h6">{formatCurrency(project.finances.completedValue)}</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Labor Cost</Typography>
                      <Typography variant="h6">{formatCurrency(project.finances.laborCost)}</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Expense Cost</Typography>
                      <Typography variant="h6">{formatCurrency(project.finances.expenseCost)}</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 12 }}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                      <Typography variant="h6">{formatCurrency(project.finances.totalCost)}</Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Profit</Typography>
                      <Typography 
                        variant="h6" 
                        color={project.finances.profit >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(project.finances.profit)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Metrics</Typography>
                <Box sx={{ mb: 2 }}>
                  <Grid component="div" container spacing={2}>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Completion Percentage</Typography>
                      <Typography variant="h6">
                        {Math.round(project.finances.completedValue / project.finances.contractValue * 100)}%
                      </Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Profit Margin</Typography>
                      <Typography 
                        variant="h6"
                        color={project.finances.profitMargin >= 0 ? 'success.main' : 'error.main'}
                      >
                        {project.finances.profitMargin.toFixed(2)}%
                      </Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Labor to Cost Ratio</Typography>
                      <Typography variant="h6">
                        {(project.finances.laborCost / project.finances.totalCost * 100).toFixed(2)}%
                      </Typography>
                    </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">Expenses to Cost Ratio</Typography>
                      <Typography variant="h6">
                        {(project.finances.expenseCost / project.finances.totalCost * 100).toFixed(2)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            
            <Grid component="div" size={{ xs: 12 }}>
              <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" gutterBottom>Completion Progress</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.finances.completedValue / project.finances.contractValue * 100}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(project.finances.completedValue / project.finances.contractValue * 100)}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default ProjectDetails;