// src/pages/projects/ProjectDetails.tsx
import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';

// Import services
import projectService, { Project } from '../../services/project.service';
import timesheetService, { TimeEntry } from '../../services/timesheet.service';
import expenseService, { Expense } from '../../services/expense.service';

// Import tab components
import ProjectOverviewTab from '../../components/projects/details/ProjectOverviewTab';
import ProjectScopesTabRestructured from '../../components/projects/details/ProjectScopesTabRestructured';
import ProjectWorkItemsTab from '../../components/projects/details/ProjectWorkItemsTab';
import ProjectLaborTab from '../../components/projects/details/ProjectLaborTab';
import ProjectExpensesTab from '../../components/projects/details/ProjectExpensesTab';
import ProjectFinancialTab from '../../components/projects/details/ProjectFinancialTab';

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
    if (tabValue === 3 && timeEntries.length === 0) {
      fetchTimeEntries();
    } else if (tabValue === 4 && expenses.length === 0) {
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

  const handleTabChange = async (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Refresh project data when Overview tab is selected
    if (newValue === 0 && id) {
      try {
        const response = await projectService.getProjectById(id);
        setProject(response.data);
      } catch (err: any) {
        console.error('Error refreshing project data:', err);
      }
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
          <Tab label="Work Items" />
          <Tab label="Scopes" />
          <Tab label="Labor" />
          <Tab label="Expenses" />
          <Tab label="Financial" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && <ProjectOverviewTab project={project} />}
      {tabValue === 1 && <ProjectWorkItemsTab project={project} />}
      {tabValue === 2 && <ProjectScopesTabRestructured project={project} />}  
      {tabValue === 3 && <ProjectLaborTab timeEntries={timeEntries} loading={timeEntriesLoading} />}
      {tabValue === 4 && <ProjectExpensesTab expenses={expenses} loading={expensesLoading} />}
      {tabValue === 5 && <ProjectFinancialTab project={project} />}
    </Box>
  );
};

export default ProjectDetails;