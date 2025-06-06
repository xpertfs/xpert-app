// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './features/store';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectList from './pages/projects/ProjectList';
import ProjectCreate from './pages/projects/ProjectCreate';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectEdit from './pages/projects/ProjectEdit';
import Clients from './pages/Clients';
import Contractors from './pages/Contractors';
import Employees from './pages/Employees';
import EmployeeList from './pages/employees/EmployeeList';
import Expenses from './pages/Expenses';
import Materials from './pages/Materials';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Vendors from './pages/Vendors';
import UnionClassifications from './pages/UnionClassifications';

function App() {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Clients Route */}
                <Route path="clients" element={<Clients />} />
                
                {/* Contractors Route */}
                <Route path="contractors" element={<Contractors />} />
                
                {/* Projects Routes */}
                <Route path="projects" element={<Projects />}>
                  <Route index element={<ProjectList />} />
                  <Route path="new" element={<ProjectCreate />} />
                  <Route path=":id" element={<ProjectDetails />} />
                  <Route path=":id/edit" element={<ProjectEdit />} />
                </Route>
                
                <Route path="employees" element={<Employees />}>
                  <Route index element={<EmployeeList />} />
                  <Route path="union-classifications" element={<UnionClassifications />} />
                </Route>
                
                <Route path="expenses" element={<Expenses />} />
                <Route path="materials" element={<Materials />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="users" element={<Users />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;