// Create src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken } from '../features/auth/authSlice';
import { AppDispatch, RootState } from '../features/store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(refreshToken());
    }
  }, [dispatch, token, isAuthenticated]);

  return { isAuthenticated };
};