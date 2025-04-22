// src/components/projects/details/ProjectScopesTabRestructured.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  List,
  FormHelperText
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Project, Scope, SubScope } from '../../../services/project.service';
import scopeService, { ScopeCreateData } from '../../../services/scope.service';
import SubScopeItem from './SubScopeItem';
import ScopeFormDialog from './ScopeFormDialog';
import SubScopeFormDialog from './SubScopeFormDialog';

interface ProjectScopesTabProps {
  project: Project;
}

const ProjectScopesTabRestructured: React.FC<ProjectScopesTabProps> = ({ project }) => {
  const [scopes, setScopes] = useState<Scope[]>(project.scopes || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openScopeDialog, setOpenScopeDialog] = useState(false);
  const [openSubScopeDialog, setOpenSubScopeDialog] = useState(false);
  const [editingScope, setEditingScope] = useState<Scope | null>(null);
  const [editingSubScope, setEditingSubScope] = useState<SubScope | null>(null);
  const [currentScopeId, setCurrentScopeId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | false>(false);

  // Fetch scopes when component mounts
  useEffect(() => {
    fetchScopes();
  }, []);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const fetchScopes = async () => {
    setLoading(true);
    try {
      const response = await scopeService.getProjectScopes(project.id);
      setScopes(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching scopes:', err);
      setError(err.response?.data?.message || 'Failed to load scopes');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new scope
  const handleCreateScope = () => {
    setEditingScope(null);
    setOpenScopeDialog(true);
  };

  // Handle editing a scope
  const handleEditScope = (scope: Scope) => {
    setEditingScope(scope);
    setOpenScopeDialog(true);
  };

  // Handle deleting a scope
  const handleDeleteScope = async (scopeId: string) => {
    if (window.confirm('Are you sure you want to delete this scope? This will also delete all sub-scopes and work item assignments.')) {
      try {
        await scopeService.deleteScope(project.id, scopeId);
        // Remove the deleted scope from state
        setScopes(scopes.filter(scope => scope.id !== scopeId));
      } catch (err: any) {
        console.error('Error deleting scope:', err);
        setError(err.response?.data?.message || 'Failed to delete scope');
      }
    }
  };

  // Handle creating a new sub-scope
  const handleCreateSubScope = (scopeId: string) => {
    setEditingSubScope(null);
    setCurrentScopeId(scopeId);
    setOpenSubScopeDialog(true);
  };

  // Handle editing a sub-scope
  const handleEditSubScope = (scope: Scope, subScope: SubScope) => {
    setEditingSubScope(subScope);
    setCurrentScopeId(scope.id);
    setOpenSubScopeDialog(true);
  };

  // Handle deleting a sub-scope
  const handleDeleteSubScope = async (scopeId: string, subScopeId: string) => {
    if (window.confirm('Are you sure you want to delete this sub-scope? This will also delete all work item assignments.')) {
      try {
        await scopeService.deleteSubScope(project.id, scopeId, subScopeId);
        
        // Update the state by removing the deleted sub-scope
        setScopes(scopes.map(scope => 
          scope.id === scopeId 
            ? { ...scope, subScopes: scope.subScopes.filter(ss => ss.id !== subScopeId) } 
            : scope
        ));
      } catch (err: any) {
        console.error('Error deleting sub-scope:', err);
        setError(err.response?.data?.message || 'Failed to delete sub-scope');
      }
    }
  };

  // Handle saving a scope (new or edited)
  const handleScopeSubmit = async (data: ScopeCreateData) => {
    try {
      if (editingScope) {
        // Update existing scope
        const response = await scopeService.updateScope(project.id, editingScope.id, {
          name: data.name,
          description: data.description
        });
        
        // Update scope in state
        setScopes(scopes.map(scope => 
          scope.id === editingScope.id ? { ...scope, ...response.data } : scope
        ));
      } else {
        // Create new scope
        const response = await scopeService.createProjectScope(project.id, data);
        
        // Add new scope to state
        setScopes([...scopes, response.data]);
      }
      
      // Close dialog
      setOpenScopeDialog(false);
      setEditingScope(null);
      
      return true;
    } catch (err: any) {
      console.error('Error saving scope:', err);
      return false;
    }
  };

  // Handle saving a sub-scope (new or edited)
  const handleSubScopeSubmit = async (data: any) => {
    if (!currentScopeId) return false;
    
    try {
      if (editingSubScope) {
        // Update existing sub-scope
        const response = await scopeService.updateSubScope(
          project.id, 
          currentScopeId, 
          editingSubScope.id, 
          {
            name: data.name,
            description: data.description
          }
        );
        
        // Update sub-scope in state
        setScopes(scopes.map(scope => 
          scope.id === currentScopeId 
            ? { 
                ...scope, 
                subScopes: scope.subScopes.map(ss => 
                  ss.id === editingSubScope.id ? response.data : ss
                ) 
              } 
            : scope
        ));
      } else {
        // Create new sub-scope
        const response = await scopeService.createSubScope(
          project.id,
          currentScopeId,
          {
            name: data.name,
            code: data.code,
            description: data.description
          }
        );
        
        // Auto-assign all project work items to this new sub-scope
        const workItems = project.workItem || [];
        if (workItems.length > 0) {
          // Create assignments for each work item with default quantity = 0
          for (const workItem of workItems) {
            try {
              await scopeService.addWorkItemToSubScope(
                project.id,
                currentScopeId,
                response.data.id,
                workItem.id,
                0 // Default quantity
              );
            } catch (err) {
              console.error(`Error assigning work item ${workItem.id} to sub-scope:`, err);
            }
          }
        }
        
        // Reload scopes to get the updated data with work items
        fetchScopes();
      }
      
      // Close dialog
      setOpenSubScopeDialog(false);
      setEditingSubScope(null);
      setCurrentScopeId(null);
      
      return true;
    } catch (err: any) {
      console.error('Error saving sub-scope:', err);
      return false;
    }
  };

  // Handle updating work item quantities for a sub-scope
  const handleUpdateWorkItemQuantities = () => {
    // Refresh scopes to get updated data
    fetchScopes();
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Project Scopes</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchScopes}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateScope}
          >
            New Scope
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {scopes.length === 0 ? (
            <Alert severity="info">
              No scopes defined yet. Create your first scope by clicking the "New Scope" button.
            </Alert>
          ) : (
            scopes.map((scope) => (
              <Accordion 
                key={scope.id} 
                expanded={expanded === scope.id}
                onChange={handleAccordionChange(scope.id)}
                sx={{ mb: 2, boxShadow: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
                    <Typography variant="subtitle1">
                      {scope.name} ({scope.code})
                    </Typography>
                    <Box onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Edit Scope">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditScope(scope)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Scope">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteScope(scope.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {scope.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {scope.description}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2">Sub-Scopes</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleCreateSubScope(scope.id)}
                    >
                      New Sub-Scope
                    </Button>
                  </Box>
                  
                  {scope.subScopes.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                      No sub-scopes defined yet. Create your first sub-scope to assign work items.
                    </Alert>
                  ) : (
                    <List sx={{ width: '100%', mt: 1 }}>
                      {scope.subScopes.map((subScope) => (
                        <SubScopeItem
                          key={subScope.id}
                          projectId={project.id}
                          scopeId={scope.id}
                          subScope={subScope}
                          onEdit={() => handleEditSubScope(scope, subScope)}
                          onDelete={() => handleDeleteSubScope(scope.id, subScope.id)}
                          onUpdate={handleUpdateWorkItemQuantities}
                        />
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Box>
      )}
      
      {/* Scope Dialog */}
      <ScopeFormDialog
        open={openScopeDialog}
        onClose={() => setOpenScopeDialog(false)}
        onSubmit={handleScopeSubmit}
        editingScope={editingScope}
      />
      
      {/* Sub-Scope Dialog */}
      <SubScopeFormDialog
        open={openSubScopeDialog}
        onClose={() => {
          setOpenSubScopeDialog(false);
          setEditingSubScope(null);
          setCurrentScopeId(null);
        }}
        onSubmit={handleSubScopeSubmit}
        editingSubScope={editingSubScope}
      />
    </Paper>
  );
};

export default ProjectScopesTabRestructured;