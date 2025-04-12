import { Typography, Box, Paper, Grid } from '@mui/material';

const Reports = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Reports</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Financial Summary</Typography>
            <Typography variant="body1">Financial charts will be displayed here</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Labor Analysis</Typography>
            <Typography variant="body1">Labor charts will be displayed here</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
            <Typography variant="body1">Expense charts will be displayed here</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;