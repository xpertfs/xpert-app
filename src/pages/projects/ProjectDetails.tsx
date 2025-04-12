// src/pages/projects/ProjectDetails.tsx
import { useState } from 'react';
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
  LinearProgress
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data - this would come from an API in a real app
const mockProject = {
  id: '1', 
  name: 'Commercial Building A', 
  client: 'ABC Corporation', 
  status: 'In Progress', 
  value: 450000, 
  progress: 35,
  startDate: '2025-01-15',
  endDate: '2025-07-30',
  description: 'Four-story commercial building with retail on the ground floor and offices above.',
  address: '123 Business Ave, Downtown, NY 10001',
  contactName: 'John Smith',
  contactEmail: 'john.smith@abccorp.com',
  contactPhone: '(555) 123-4567'
};

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
        <Typography variant="h4" sx={{ flexGrow: 1 }}>{mockProject.name}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<EditIcon />}
          onClick={() => navigate(`/projects/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Scopes" />
          <Tab label="Labor" />
          <Tab label="Expenses" />
          <Tab label="Materials" />
          <Tab label="Financial" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Project Details</Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                    <Typography variant="body1">{mockProject.client}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={mockProject.status} 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                    <Typography variant="body1">
                      {new Date(mockProject.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                    <Typography variant="body1">
                      {new Date(mockProject.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Contract Value</Typography>
                    <Typography variant="body1">${mockProject.value.toLocaleString()}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Progress</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={mockProject.progress} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {mockProject.progress}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">{mockProject.description}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{mockProject.address}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Client Contact</Typography>
              <Divider sx={{ my: 2 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemText 
                    primary={mockProject.contactName}
                    secondary="Contact Name"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 1 }}>
                  <ListItemText 
                    primary={mockProject.contactEmail}
                    secondary="Email"
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemText 
                    primary={mockProject.contactPhone}
                    secondary="Phone"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Project Scopes</Typography>
          <Typography variant="body1">Scopes and subscopes will be displayed here</Typography>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Labor</Typography>
          <Typography variant="body1">Labor details will be displayed here</Typography>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Expenses</Typography>
          <Typography variant="body1">Project expenses will be displayed here</Typography>
        </Paper>
      )}

      {tabValue === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Materials</Typography>
          <Typography variant="body1">Materials used in this project will be displayed here</Typography>
        </Paper>
      )}

      {tabValue === 5 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Financial Overview</Typography>
          <Typography variant="body1">Financial charts and data will be displayed here</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ProjectDetails;