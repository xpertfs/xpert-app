// src/components/projects/details/ProjectOverviewTab.tsx
import React from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Divider, 
  Chip, 
  List, 
  ListItem, 
  ListItemText,
  LinearProgress
} from '@mui/material';
import { Project } from '../../../services/project.service';

interface ProjectOverviewTabProps {
  project: Project;
}

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getStatusColor = (status: string): "primary" | "warning" | "success" | "info" | "error" | "default" => {
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

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project }) => {
  return (
    <Grid component="div" container spacing={3}>
      <Grid component="div" size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 3, height: '98%' }}>
          <Typography variant="h6" gutterBottom>Project Details</Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid component="div" container spacing={2}>
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                <Typography variant="body1">{project.client.name}</Typography>
              </Box>
            </Grid>
            {project.contractor && (
              <Grid component="div" size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">General Contractor</Typography>
                  <Typography variant="body1">{project.contractor.name}</Typography>
                </Box>
              </Grid>
            )}
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
                <Typography variant="body1">{formatCurrency(project.finances.contractValue)}</Typography>
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
        {/* FINANCIAL SUMMARY */}
        <Paper sx={{ p: 3, mb: 3 }}>
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
        
        {/* CLIENT CONTACT */}
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

        {/* CONTRACTOR CONTACT - Only show if contractor exists */}
        {project.contractor && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Contractor Contact</Typography>
            <Divider sx={{ my: 2 }} />
            
            <List disablePadding>
              <ListItem disablePadding sx={{ pb: 1 }}>
                <ListItemText 
                  primary={project.contractor.contactName || 'Not specified'}
                  secondary="Contact Name"
                />
              </ListItem>
              <ListItem disablePadding sx={{ pb: 1 }}>
                <ListItemText 
                  primary={project.contractor.email || 'Not specified'}
                  secondary="Email"
                />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText 
                  primary={project.contractor.phone || 'Not specified'}
                  secondary="Phone"
                />
              </ListItem>
            </List>
          </Paper>
        )}
      </Grid>
    </Grid>
  );
};

export default ProjectOverviewTab;