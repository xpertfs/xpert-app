// src/components/projects/details/ProjectLaborTab.tsx
import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { TimeEntry } from '../../../services/timesheet.service';

interface ProjectLaborTabProps {
  timeEntries: TimeEntry[];
  loading: boolean;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};

const ProjectLaborTab: React.FC<ProjectLaborTabProps> = ({ timeEntries, loading }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Labor Entries</Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : timeEntries.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell align="right">Regular Hours</TableCell>
                <TableCell align="right">Overtime Hours</TableCell>
                <TableCell align="right">Double Hours</TableCell>
                <TableCell align="right">Total Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{`${entry.employee.firstName} ${entry.employee.lastName}`}</TableCell>
                  <TableCell align="right">{entry.regularHours}</TableCell>
                  <TableCell align="right">{entry.overtimeHours}</TableCell>
                  <TableCell align="right">{entry.doubleHours}</TableCell>
                  <TableCell align="right">
                    {entry.regularHours + entry.overtimeHours + entry.doubleHours}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No labor entries have been recorded for this project yet.
        </Alert>
      )}
    </Paper>
  );
};

export default ProjectLaborTab;