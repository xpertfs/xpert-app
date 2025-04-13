// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  AttachMoney as MoneyIcon,
  Engineering as EngineeringIcon,
  People as PeopleIcon,
  BusinessCenter as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Gavel as TodayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Service imports
import projectService, { Project } from '../services/project.service';
import expenseService, { Expense } from '../services/expense.service';
import clientService, { Client } from '../services/client.service';
import timesheetService, { TimeEntry } from '../services/timesheet.service';

// Types for dashboard data
interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface ExpenseData {
  month: string;
  amount: number;
}

interface HoursData {
  week: string;
  regular: number;
  overtime: number;
}

interface PaymentData {
  id: number;
  employee: string;
  amount: number;
  date: string;
}

interface SummaryData {
  activeProjects: number;
  completedProjects: number;
  totalClients: number;
  totalEmployees: number;
  monthlyExpenses: number;
  unpaidInvoices: number;
  pendingApprovals: number;
  totalRevenue: number;
}

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Get status color helper
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'IN_PROGRESS': return '#1976d2';
    case 'PLANNING': return '#ff9800';
    case 'COMPLETED': return '#4caf50';
    case 'ON_HOLD': return '#03a9f4';
    case 'CANCELLED': return '#f44336';
    default: return '#9e9e9e';
  }
};

const getStatusTextColor = (status: string): "primary" | "warning" | "success" | "info" | "error" | "default" => {
  switch (status) {
    case 'IN_PROGRESS': return 'primary';
    case 'PLANNING': return 'warning';
    case 'COMPLETED': return 'success';
    case 'ON_HOLD': return 'info';
    case 'CANCELLED': return 'error';
    default: return 'default';
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [summaryData, setSummaryData] = useState<SummaryData>({
    activeProjects: 0,
    completedProjects: 0,
    totalClients: 0,
    totalEmployees: 0,
    monthlyExpenses: 0,
    unpaidInvoices: 0,
    pendingApprovals: 0,
    totalRevenue: 0
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [projectsByStatus, setProjectsByStatus] = useState<StatusData[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseData[]>([]);
  const [hoursWorked, setHoursWorked] = useState<HoursData[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentData[]>([]);
  
  // Chart colors
  const COLORS = ['#1976d2', '#ff9800', '#4caf50', '#f44336', '#9c27b0', '#03a9f4'];
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all required data in parallel
      const [projectsResponse, clientsResponse, timeEntriesResponse, expensesResponse] = await Promise.all([
        projectService.getProjects(),
        clientService.getClients(),
        timesheetService.getTimeEntries({ limit: 100 }),
        expenseService.getExpenses({ limit: 100 })
      ]);
      
      const projects = projectsResponse.data;
      const clients = clientsResponse.data;
      const timeEntries = timeEntriesResponse.data.timeEntries || [];
      const expenses = expensesResponse.data.expenses || [];
      
      // Process data for summary metrics
      const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
      const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
      
      // Calculate monthly expenses (assuming data is for current month)
      const monthlyExpensesTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate total revenue from completed project values
      const totalRevenue = projects
        .filter(p => p.status === 'COMPLETED' || p.status === 'IN_PROGRESS')
        .reduce((sum, project) => sum + (project.finances?.completedValue || 0), 0);
      
      // Get pending approvals count
      const pendingApprovals = timeEntries.filter(t => t.paymentStatus === 'PENDING').length;
      
      // Set summary data
      setSummaryData({
        activeProjects,
        completedProjects,
        totalClients: clients.length,
        totalEmployees: 24, // Mocked for now
        monthlyExpenses: monthlyExpensesTotal,
        unpaidInvoices: 8, // Mocked for now
        pendingApprovals,
        totalRevenue
      });
      
      // Set recent projects (sort by most recent start date)
      const sortedProjects = [...projects].sort((a, b) => 
        new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime()
      );
      setRecentProjects(sortedProjects.slice(0, 5));
      
      // Process data for project status chart
      const statusCounts: Record<string, number> = projects.reduce((acc: Record<string, number>, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {});
      
      const statusData: StatusData[] = Object.keys(statusCounts).map(status => ({
        name: status.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: statusCounts[status],
        color: getStatusColor(status)
      }));
      setProjectsByStatus(statusData);
      
      // Process data for monthly expenses chart (mock data for now)
      const expenseData: ExpenseData[] = [
        { month: 'Jan', amount: 45000 },
        { month: 'Feb', amount: 52000 },
        { month: 'Mar', amount: 48000 },
        { month: 'Apr', amount: 61000 },
        { month: 'May', amount: 55000 },
        { month: 'Jun', amount: 67000 },
        { month: 'Jul', amount: 72000 },
        { month: 'Aug', amount: 59000 },
        { month: 'Sep', amount: 62000 },
        { month: 'Oct', amount: 74000 },
        { month: 'Nov', amount: 78000 },
        { month: 'Dec', amount: 71000 }
      ];
      setMonthlyExpenses(expenseData);
      
      // Process data for hours worked chart (mock data for now)
      const hoursData: HoursData[] = [
        { week: 'Week 1', regular: 320, overtime: 42 },
        { week: 'Week 2', regular: 345, overtime: 38 },
        { week: 'Week 3', regular: 356, overtime: 52 },
        { week: 'Week 4', regular: 339, overtime: 29 }
      ];
      setHoursWorked(hoursData);
      
      // Upcoming payments (mock data for now)
      const payments: PaymentData[] = [
        { id: 1, employee: 'John Carpenter', amount: 1840, date: '2025-04-15' },
        { id: 2, employee: 'Sarah Mason', amount: 2150, date: '2025-04-15' },
        { id: 3, employee: 'Michael Torres', amount: 1920, date: '2025-04-15' },
        { id: 4, employee: 'Lisa Johnson', amount: 2250, date: '2025-04-22' },
        { id: 5, employee: 'Robert Smith', amount: 1750, date: '2025-04-22' }
      ];
      setUpcomingPayments(payments);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={fetchDashboardData}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <IconButton onClick={fetchDashboardData} title="Refresh data">
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {/* Summary Cards */}
      <Grid component="div" container spacing={4} sx={{ mb: 4 }}>
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                <EngineeringIcon />
              </Avatar>
              <Typography variant="h6" color="text.secondary">
                Active Projects
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 1 }}>
              {summaryData.activeProjects}
            </Typography>
            <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
              {summaryData.completedProjects} completed projects
            </Typography>
          </Paper>
        </Grid>
        
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                <MoneyIcon />
              </Avatar>
              <Typography variant="h6" color="text.secondary">
                Monthly Revenue
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 1 }}>
              {formatCurrency(summaryData.totalRevenue / 12)}
            </Typography>
            <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
              {formatCurrency(summaryData.totalRevenue)} total revenue
            </Typography>
          </Paper>
        </Grid>
        
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mr: 1 }}>
                <BarChartIcon />
              </Avatar>
              <Typography variant="h6" color="text.secondary">
                Monthly Expenses
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 1 }}>
              {formatCurrency(summaryData.monthlyExpenses)}
            </Typography>
            <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
              {summaryData.unpaidInvoices} unpaid invoices
            </Typography>
          </Paper>
        </Grid>
        
        <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 1 }}>
                <TodayIcon />
              </Avatar>
              <Typography variant="h6" color="text.secondary">
                Pending Tasks
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 1 }}>
              {summaryData.pendingApprovals}
            </Typography>
            <Typography component="p" variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
              Requires your attention
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts and Data */}
      <Grid component="div" container spacing={4}>
        {/* Project Status Chart */}
        <Grid component="div" size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="h6" gutterBottom>
              Projects by Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value, name) => [`${value} projects`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Monthly Expenses Chart */}
        <Grid component="div" size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: 380 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Expenses
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                  <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" fill="#8884d8" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Projects */}
        <Grid component="div" size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Recent Projects
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentProjects.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography color="text.secondary">No projects found</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {recentProjects.map((project) => (
                  <Paper 
                    key={project.id} 
                    elevation={1} 
                    sx={{ mb: 2, p: 2, '&:last-child': { mb: 0 } }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1">{project.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.client.name}
                        </Typography>
                      </Box>
                      <Chip 
                        label={project.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} 
                        color={getStatusTextColor(project.status)} 
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Project Value: {formatCurrency(project.value)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(project.finances?.completedValue / project.finances?.contractValue * 100) || 0} 
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round((project.finances?.completedValue / project.finances?.contractValue * 100) || 0)}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Tooltip title="View project details">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Hours Worked Chart */}
        <Grid component="div" size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Weekly Hours Worked
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hoursWorked}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="regular" stackId="a" name="Regular Hours" fill="#1976d2" />
                  <Bar dataKey="overtime" stackId="a" name="Overtime Hours" fill="#ff9800" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Upcoming Payments */}
        <Grid component="div" size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Payments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              {upcomingPayments.map((payment) => (
                <ListItem 
                  key={payment.id} 
                  divider 
                  sx={{ px: 1, py: 1 }}
                >
                  <ListItemText
                    primary={payment.employee}
                    secondary={`Due: ${new Date(payment.date).toLocaleDateString()}`}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ minWidth: 80, textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        
        {/* Company Stats */}
        <Grid component="div" size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Company Stats
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">Employees</Typography>
                    <Typography variant="h6">{summaryData.totalEmployees}</Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">Clients</Typography>
                    <Typography variant="h6">{summaryData.totalClients}</Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">Overdue Tasks</Typography>
                    <Typography variant="h6">7</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Paper>
        </Grid>
        
        {/* Project Performance */}
        <Grid component="div" size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Project Performance
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: 'Jan', actual: 80, projected: 75 },
                    { month: 'Feb', actual: 82, projected: 78 },
                    { month: 'Mar', actual: 81, projected: 80 },
                    { month: 'Apr', actual: 84, projected: 82 },
                    { month: 'May', actual: 87, projected: 85 },
                    { month: 'Jun', actual: 86, projected: 87 }
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}%`} domain={[70, 100]} />
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" name="Actual" stroke="#4caf50" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="projected" name="Projected" stroke="#ff9800" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;