// src/services/auth.service.ts
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
    companyName: string;
  };
  token: string;
}

const authService = {
  login: (credentials: LoginCredentials) => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },
  
  register: (data: RegisterData) => {
    return api.post<AuthResponse>('/auth/register', data);
  },
  
  forgotPassword: (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },
  
  resetPassword: (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },
  
  refreshToken: (token: string) => {
    return api.post<AuthResponse>('/auth/refresh-token', { token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;