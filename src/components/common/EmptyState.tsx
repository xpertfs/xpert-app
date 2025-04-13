// src/components/common/EmptyState.tsx
import { Box, Typography, Button, SvgIconProps } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: SvgIconComponent;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  icon: Icon, 
  actionText, 
  onAction 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 8,
      px: 2,
      textAlign: 'center' 
    }}>
      {Icon && <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />}
      
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        {message}
      </Typography>
      
      {actionText && onAction && (
        <Button 
          variant="contained" 
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;