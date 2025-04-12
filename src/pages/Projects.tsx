import { Typography, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Projects = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Project
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">Project list will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default Projects;