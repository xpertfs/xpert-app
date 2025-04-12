import { Typography, Box, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Active Projects
          </Typography>
          <Typography component="p" variant="h4">
            12
          </Typography>
        </Paper>
        
        {/* Repeat for other cards */}
      </div>
    </Box>
  );
};

export default Dashboard;