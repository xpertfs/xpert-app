// src/pages/projects/ProjectEdit.tsx
import { 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(`/projects/${id}`)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Edit Project</Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">Project edit form will be here</Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            sx={{ mr: 2 }}
            onClick={() => navigate(`/projects/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => navigate(`/projects/${id}`)}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectEdit;