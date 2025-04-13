// src/components/projects/details/ProjectScopesTab.tsx
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
  LinearProgress,
  Alert
} from '@mui/material';
import { Project, Scope, SubScope } from '../../../services/project.service';

interface ProjectScopesTabProps {
  project: Project;
}

const ProjectScopesTab: React.FC<ProjectScopesTabProps> = ({ project }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Project Scopes</Typography>
      
      {project.scopes.length > 0 ? (
        project.scopes.map((scope) => (
          <Paper key={scope.id} elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1">{scope.name} ({scope.code})</Typography>
            
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sub-Scope</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell align="right">Completion %</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scope.subScopes.map((subScope) => (
                    <TableRow key={subScope.id}>
                      <TableCell>{subScope.name}</TableCell>
                      <TableCell>{subScope.code}</TableCell>
                      <TableCell align="right">{subScope.percentComplete}%</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={subScope.percentComplete} />
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          No scopes have been defined for this project yet.
        </Alert>
      )}
    </Paper>
  );
};

export default ProjectScopesTab;