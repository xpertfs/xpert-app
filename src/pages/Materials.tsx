import { Typography, Box, Button, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Materials = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Materials</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Material
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">Material list will be displayed here</Typography>
      </Paper>
    </Box>
  );
};

export default Materials;