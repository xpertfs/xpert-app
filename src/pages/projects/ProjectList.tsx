// src/pages/projects/ProjectList.tsx
import { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data
const mockProjects = [
  { 
    id: '1', 
    name: 'Commercial Building A', 
    client: 'ABC Corporation', 
    status: 'In Progress', 
    value: 450000, 
    progress: 35,
    startDate: '2025-01-15',
    endDate: '2025-07-30'
  },
  { 
    id: '2', 
    name: 'Residential Complex', 
    client: 'XYZ Developers', 
    status: 'Planning', 
    value: 2800000, 
    progress: 10,
    startDate: '2025-02-10',
    endDate: '2026-05-20'
  },
  { 
    id: '3', 
    name: 'Office Renovation', 
    client: 'Tech Innovators Inc', 
    status: 'Completed', 
    value: 180000, 
    progress: 100,
    startDate: '2024-11-05',
    endDate: '2025-02-28'
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'primary';
    case 'Planning':
      return 'warning';
    case 'Completed':
      return 'success';
    default:
      return 'default';
  }
};

const ProjectList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const filteredProjects = mockProjects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
        >
          New Project
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search projects by name or client..."
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right">Progress</TableCell>
              <TableCell>Timeline</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.client}</TableCell>
                <TableCell>
                  <Chip 
                    label={project.status} 
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  ${project.value.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  {project.progress}%
                </TableCell>
                <TableCell>
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectList;