// src/components/layout/MainLayout.tsx
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Tooltip, useMediaQuery } from '@mui/material';
import { Menu as MenuIcon, ChevronLeft, Notifications, DarkMode, LightMode, ExitToApp } from '@mui/icons-material';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../features/store';
import { logout } from '../../features/auth/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';

const drawerWidth = 260;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const MainLayout = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const { darkMode, toggleDarkMode } = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Close drawer on mobile by default
  useState(() => {
    if (isMobile) {
      setOpen(false);
    }
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleMenuClose();
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: muiTheme.palette.background.default, minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ 
        zIndex: muiTheme.zIndex.drawer + 1,
        backgroundColor: muiTheme.palette.background.paper,
        color: muiTheme.palette.text.primary,
        borderBottom: `1px solid ${muiTheme.palette.divider}`
      }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            XpertBuild
          </Typography>
          <IconButton>
            <Notifications />
          </IconButton>
          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode}>
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          <IconButton 
            sx={{ ml: 1 }}
            onClick={handleMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {getUserInitials()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>Profile</MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>Account Settings</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => isMobile && setOpen(false)}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          transition: muiTheme.transitions.create('width', {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.enteringScreen,
          }),
          [`& .MuiDrawer-paper`]: { 
            width: open ? drawerWidth : 72, 
            boxSizing: 'border-box',
            transition: muiTheme.transitions.create('width', {
              easing: muiTheme.transitions.easing.sharp,
              duration: muiTheme.transitions.duration.enteringScreen,
            }),
            backgroundColor: muiTheme.palette.background.paper,
            borderRight: `1px solid ${muiTheme.palette.divider}`,
            boxShadow: darkMode ? 'none' : '0 0 10px rgba(0,0,0,0.05)'
          },
        }}
      >
        <DrawerHeader />
        <Sidebar collapsed={!open} />
      </Drawer>
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3,
        pt: 10,
        backgroundColor: muiTheme.palette.background.default
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;