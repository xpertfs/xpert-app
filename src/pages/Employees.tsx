import { Typography, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Employees = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Employee
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">Employee list will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default Employees;