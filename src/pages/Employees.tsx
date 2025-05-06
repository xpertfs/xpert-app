import { Typography, Box, Button, Paper, Tabs, Tab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const Employees = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    navigate(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Employee
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={location.pathname} 
          onChange={handleTabChange}
          aria-label="employee sections"
        >
          <Tab 
            label="Employee List" 
            value="/employees"
          />
          <Tab 
            label="Union Classifications" 
            value="/employees/union-classifications"
          />
        </Tabs>
      </Paper>
      
      <Outlet />
    </Box>
  );
};

export default Employees;