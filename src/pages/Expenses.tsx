import { Typography, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Expenses = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Expenses</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Expense
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">Expense list will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default Expenses;