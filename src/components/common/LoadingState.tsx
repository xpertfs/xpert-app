// src/components/common/LoadingState.tsx
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      py: 6 
    }}>
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;