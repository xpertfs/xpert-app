import React from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  FormControlLabel, 
  Switch,
  Grid,
  Card,
  CardContent,
  useTheme as useMuiTheme
} from '@mui/material';
import { DarkMode, LightMode, Palette, ModeNight, WbSunny } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSettings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Display Settings
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {darkMode ? <DarkMode sx={{ mr: 1 }} /> : <LightMode sx={{ mr: 1 }} />}
              <Typography>
                {darkMode ? "Dark Mode" : "Light Mode"}
              </Typography>
            </Box>
          }
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Choose between light and dark color modes for the application interface.
        </Typography>
        
        <Grid component="div" container spacing={2} sx={{ mt: 1 }}>
          <Grid component="div" size={{ xs: 12, sm: 6 }}>
            <Card 
              elevation={1} 
              sx={{ 
                p: 1,
                border: `1px solid ${!darkMode ? muiTheme.palette.primary.main : muiTheme.palette.divider}`,
                backgroundColor: '#ffffff'
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WbSunny sx={{ color: '#f57c00', mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#333' }}>
                    Light Mode
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#555' }}>
                  Clean, bright interface with high contrast and familiar look.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid component="div" size={{ xs: 12, sm: 6 }}>
            <Card 
              elevation={1} 
              sx={{ 
                p: 1,
                backgroundColor: '#212121',
                border: `1px solid ${darkMode ? muiTheme.palette.primary.main : '#212121'}`,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ModeNight sx={{ color: '#90caf9', mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                    Dark Mode
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#aaa' }}>
                  Reduced eye strain in low-light environments and saves battery life.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ThemeSettings;