// src/services/expense.service.ts
import api from './api';

// Types
export interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  reference?: string;
  recurring: boolean;
  project?: {
    id: string;
    name: string;
    code: string;
  };
  vendor?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface ExpenseCreateData {
  date: string;
  amount: number;
  description: string;
  category: string;
  reference?: string;
  recurring?: boolean;
  projectId?: string;
  vendorId?: string;
}

export interface ExpenseUpdateData {
  date?: string;
  amount?: number;
  description?: string;
  category?: string;
  reference?: string;
  recurring?: boolean;
  projectId?: string;
  vendorId?: string;
}

export interface ExpenseSummary {
  expenses: Expense[];
  totalsByCategory: Record<string, number>;
  grandTotal: number;
  count: number;
}

const expenseService = {
  // Get all expenses with optional filters
  getExpenses: (params?: {
    search?: string;
    category?: string;
    projectId?: string;
    vendorId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    return api.get<{ expenses: Expense[], pagination: any }>('/expenses', { params });
  },

  // Get expenses for a specific project
  getExpensesByProject: (projectId: string) => {
    return api.get<ExpenseSummary>(`/expenses/project/${projectId}`);
  },

  // Get expenses by category
  getExpensesByCategory: (category: string) => {
    return api.get<{ expenses: Expense[], total: number, count: number }>(`/expenses/category/${category}`);
  },

  // Get an expense by ID
  getExpenseById: (id: string) => {
    return api.get<Expense>(`/expenses/${id}`);
  },

  // Create a new expense
  createExpense: (data: ExpenseCreateData) => {
    return api.post<Expense>('/expenses', data);
  },

  // Update an expense
  updateExpense: (id: string, data: ExpenseUpdateData) => {
    return api.put<Expense>(`/expenses/${id}`, data);
  },

  // Delete an expense
  deleteExpense: (id: string) => {
    return api.delete(`/expenses/${id}`);
  }
};

export default expenseService;