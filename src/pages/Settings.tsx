import { Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import ThemeSettings from '../components/settings/ThemeSettings';

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
      
      {tabValue === 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Company Settings</Typography>
            <Typography variant="body1">Company settings will be displayed here</Typography>
          </Paper>
        </Box>
      )}
      
      {tabValue === 1 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>User Management</Typography>
            <Typography variant="body1">User settings will be displayed here</Typography>
          </Paper>
        </Box>
      )}
      
      {tabValue === 2 && (
        <Box>
          <ThemeSettings />
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
            <Typography variant="body1">Notification settings will be displayed here</Typography>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Regional Settings</Typography>
            <Typography variant="body1">Date formats, time zones and language preferences will be displayed here</Typography>
          </Paper>
        </Box>
      )}
      
      {tabValue === 3 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Integrations</Typography>
            <Typography variant="body1">Integration settings will be displayed here</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Settings;