import { Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import { useState } from 'react';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab label="Company" />
          <Tab label="Users" />
          <Tab label="Preferences" />
          <Tab label="Integrations" />
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Company Settings</Typography>
            <Typography variant="body1">Company settings will be displayed here</Typography>
          </Box>
        )}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>User Management</Typography>
            <Typography variant="body1">User settings will be displayed here</Typography>
          </Box>
        )}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Preferences</Typography>
            <Typography variant="body1">User preferences will be displayed here</Typography>
          </Box>
        )}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Integrations</Typography>
            <Typography variant="body1">Integration settings will be displayed here</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Settings;