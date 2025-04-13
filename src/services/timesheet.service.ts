// src/services/timesheet.service.ts
import api from './api';

// Types
export interface TimeEntry {
  id: string;
  date: string;
  regularHours: number;
  overtimeHours: number;
  doubleHours: number;
  notes?: string;
  paymentStatus: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
    type: string;
  };
  project?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface TimeEntryCreateData {
  employeeId: string;
  date: string;
  regularHours: number;
  overtimeHours?: number;
  doubleHours?: number;
  projectId?: string;
  notes?: string;
}

export interface TimeEntryUpdateData {
  date?: string;
  regularHours?: number;
  overtimeHours?: number;
  doubleHours?: number;
  projectId?: string;
  notes?: string;
  paymentStatus?: string;
}

export interface PaymentData {
  employeeId: string;
  timeEntryIds: string[];
  paymentDate: string;
  reference?: string;
  notes?: string;
  deductions?: number;
}

export interface WeeklyTimesheet {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
    type: string;
  };
  weekStart: string;
  weekEnd: string;
  days: {
    date: Date;
    dateFormatted: string;
    dayName: string;
    entries: TimeEntry[];
    totals: {
      regularHours: number;
      overtimeHours: number;
      doubleHours: number;
      totalHours: number;
    };
  }[];
  totals: {
    regularHours: number;
    overtimeHours: number;
    doubleHours: number;
    totalHours: number;
  };
}

const timesheetService = {
  // Get time entries with optional filters
  getTimeEntries: (params?: {
    employeeId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    limit?: number;
    page?: number;
  }) => {
    return api.get<{ timeEntries: TimeEntry[], pagination: any }>('/timesheets', { params });
  },

  // Create a new time entry
  createTimeEntry: (data: TimeEntryCreateData) => {
    return api.post<TimeEntry>('/timesheets', data);
  },

  // Update a time entry
  updateTimeEntry: (id: string, data: TimeEntryUpdateData) => {
    return api.put<TimeEntry>(`/timesheets/${id}`, data);
  },

  // Delete a time entry
  deleteTimeEntry: (id: string) => {
    return api.delete(`/timesheets/${id}`);
  },

  // Approve multiple time entries
  approveTimeEntries: (timeEntryIds: string[]) => {
    return api.post('/timesheets/approve', { timeEntryIds });
  },

  // Process payment for time entries
  processPayment: (data: PaymentData) => {
    return api.post('/timesheets/payments', data);
  },

  // Get weekly timesheets
  getWeeklyTimesheets: (params?: {
    date?: string;
    employeeId?: string;
  }) => {
    return api.get<WeeklyTimesheet[]>('/timesheets/weekly', { params });
  },

  // Get project time entries
  getProjectTimeEntries: (projectId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }) => {
    return api.get<{ timeEntries: TimeEntry[], pagination: any }>('/timesheets', {
      params: { ...params, projectId }
    });
  }
};

export default timesheetService;