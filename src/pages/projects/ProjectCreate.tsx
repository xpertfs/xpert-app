// src/pages/projects/ProjectCreate.tsx
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProjectCreate = () => {
  const navigate = useNavigate();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Create New Project</Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">Project creation form will be here</Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            sx={{ mr: 2 }}
            onClick={() => navigate('/projects')}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => navigate('/projects')}
          >
            Create Project
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectCreate;