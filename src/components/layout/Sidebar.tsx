// src/components/layout/Sidebar.tsx
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Business, 
  People, 
  Receipt, 
  Inventory, 
  BarChart, 
  Settings,
  AccountTree
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Projects', icon: <Business />, path: '/projects' },
    { text: 'Employees', icon: <People />, path: '/employees' },
    { text: 'Expenses', icon: <Receipt />, path: '/expenses' },
    { text: 'Materials', icon: <Inventory />, path: '/materials' },
    { text: 'Reports', icon: <BarChart />, path: '/reports' },
  ];

  const bottomItems = [
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!collapsed && (
        <Box sx={{ p: 2, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountTree color="primary" />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
              XpertBuild
            </Typography>
          </Box>
        </Box>
      )}
      
      <List sx={{ pt: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{ 
                borderRadius: collapsed ? 0 : '10px',
                mx: collapsed ? 0 : 1,
                backgroundColor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: collapsed ? 'auto' : 40,
                color: isActive(item.path) ? 'primary.main' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText primary={item.text} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        {bottomItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              sx={{ 
                borderRadius: collapsed ? 0 : '10px',
                mx: collapsed ? 0 : 1
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText primary={item.text} />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;