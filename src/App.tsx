// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './features/store';
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectList from './pages/projects/ProjectList';
import ProjectCreate from './pages/projects/ProjectCreate';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectEdit from './pages/projects/ProjectEdit';
import Employees from './pages/Employees';
import Expenses from './pages/Expenses';
import Materials from './pages/Materials';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Guards
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main App Routes */}
        <Route path="/" element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }>
          <Route index element={<Dashboard />} />
          
          {/* Projects Routes */}
          <Route path="projects" element={<Projects />}>
            <Route index element={<ProjectList />} />
            <Route path="new" element={<ProjectCreate />} />
            <Route path=":id" element={<ProjectDetails />} />
            <Route path=":id/edit" element={<ProjectEdit />} />
          </Route>
          
          <Route path="employees" element={<Employees />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="materials" element={<Materials />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;