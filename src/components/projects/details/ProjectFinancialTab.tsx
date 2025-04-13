// src/components/projects/details/ProjectFinancialTab.tsx
import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Divider,
  LinearProgress
} from '@mui/material';
import { Project } from '../../../services/project.service';

interface ProjectFinancialTabProps {
  project: Project;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const ProjectFinancialTab: React.FC<ProjectFinancialTabProps> = ({ project }) => {
  return (
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
  );
};

export default ProjectFinancialTab;