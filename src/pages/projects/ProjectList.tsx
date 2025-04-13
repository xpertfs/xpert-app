// src/pages/projects/ProjectList.tsx
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
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import { FolderOff, FilterAlt } from '@mui/icons-material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import projectService, { Project } from '../../services/project.service';

// Status color mapping function
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

// Format status for display
const formatStatus = (status: string) => {
  return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const ProjectList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Function to fetch projects
  const fetchProjects = async () => {
  try {
    setLoading(true);
    console.log('Fetching projects...');
    const response = await projectService.getProjects();
    console.log('API response:', response);
    console.log('Projects data:', response.data);
    setProjects(response.data);
    setError(null);
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    setError(err.response?.data?.message || 'Failed to load projects');
  } finally {
    setLoading(false);
  }
};

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Filter projects based on search query
  const filteredProjects = searchQuery 
    ? projects.filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.client.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  // Handle delete project
  const handleDeleteProject = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        // Remove from state after successful deletion
        setProjects(projects.filter(project => project.id !== id));
      } catch (err: any) {
        console.error('Error deleting project:', err);
        alert(err.response?.data?.message || 'Failed to delete project');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchProjects}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            New Project
          </Button>
        </Box>
      </Box>
      
      {/* Search box */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search projects by name, code or client..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <LoadingState message="Loading projects..." />
      ) : (
        /* Projects table */
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    {searchQuery ? (
                      <EmptyState
                        title="No matching projects"
                        message="Try adjusting your search criteria or clear the search to see all projects."
                        icon={FilterAlt}
                        actionText="Clear Search"
                        onAction={() => setSearchQuery('')}
                      />
                    ) : (
                      <EmptyState
                        title="No projects found"
                        message="Get started by creating your first project."
                        icon={FolderOff}
                        actionText="Create Project" 
                        onAction={() => navigate('/projects/new')}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow 
                    key={project.id}
                    hover
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body1">{project.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{project.client.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={formatStatus(project.status)} 
                        color={getStatusColor(project.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${project.value.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {project.startDate && project.endDate ? (
                        `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`
                      ) : (
                        'Not scheduled'
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${project.id}`);
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${project.id}/edit`);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProjectList;