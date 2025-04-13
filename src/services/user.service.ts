// src/services/user.service.ts
import api from './api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface UserCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  active?: boolean;
}

const userService = {
  // Get all users
  getUsers: () => {
    return api.get<User[]>('/settings/users');
  },
  
  // Get a user by ID
  getUserById: (id: string) => {
    return api.get<User>(`/settings/users/${id}`);
  },
  
  // Create a new user
  createUser: (data: UserCreateData) => {
    return api.post<User>('/settings/users', data);
  },
  
  // Update an existing user
  updateUser: (id: string, data: UserUpdateData) => {
    return api.put<User>(`/settings/users/${id}`, data);
  },
  
  // Delete a user
  deleteUser: (id: string) => {
    return api.delete(`/settings/users/${id}`);
  },
  
  // Update user password
  updateUserPassword: (id: string, password: string) => {
    return api.put(`/settings/users/${id}/password`, { password });
  }
};

export default userService;