// src/components/projects/details/ProjectExpensesTab.tsx
import React from 'react';
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
  Chip
} from '@mui/material';
import { Expense } from '../../../services/expense.service';

interface ProjectExpensesTabProps {
  expenses: Expense[];
  loading: boolean;
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

// Helper function to get category label
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

const ProjectExpensesTab: React.FC<ProjectExpensesTabProps> = ({ expenses, loading }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Expenses</Typography>
      
      {loading ? (
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
  );
};

export default ProjectExpensesTab;