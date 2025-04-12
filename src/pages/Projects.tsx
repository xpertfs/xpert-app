import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const Projects = () => {
  return (
    <Box>
      <Outlet />
    </Box>
  );
};

export default Projects;