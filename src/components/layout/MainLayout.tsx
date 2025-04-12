// src/components/layout/MainLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar, useTheme } from '@mui/material';
import { Menu as MenuIcon, ChevronLeft, Notifications, DarkMode, LightMode } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
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
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`
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
          <IconButton sx={{ ml: 1 }}>
            <DarkMode />
          </IconButton>
          <IconButton sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>JD</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          [`& .MuiDrawer-paper`]: { 
            width: open ? drawerWidth : 72, 
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: '#f8f9fa',
            borderRight: 'none',
            boxShadow: '0 0 10px rgba(0,0,0,0.05)'
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
        backgroundColor: '#f7f9fc'
      }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;