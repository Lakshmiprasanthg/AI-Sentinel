import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Logout as LogoutIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
  Dashboard as DashboardIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDrawerOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Analyze', icon: <UploadIcon />, path: '/upload' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon />
          AI-Sentinel
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
          User: {user?.username}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" className="glass-navbar" elevation={0}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2, color: 'white !important' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <SecurityIcon sx={{ mr: 2, color: 'white' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'white !important' }}>
            AI-Sentinel
          </Typography>

          {!isMobile && (
            <>
              <Button
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/')}
                sx={{ 
                  fontWeight: 500,
                  color: 'white !important',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Dashboard
              </Button>

              <Button
                startIcon={<UploadIcon />}
                onClick={() => navigate('/upload')}
                sx={{ 
                  fontWeight: 500,
                  color: 'white !important',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Analyze
              </Button>

              <Button
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/history')}
                sx={{ 
                  fontWeight: 500,
                  color: 'white !important',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                History
              </Button>

              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <div className="trust-indicator">
                  <div className="trust-light"></div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Secure • AI Ready</span>
                </div>
                <Typography variant="body2" sx={{ ml: 2, fontWeight: 500, color: 'white !important' }}>{user?.username}</Typography>
                <IconButton onClick={handleLogout} sx={{ color: 'white !important' }}>
                  <LogoutIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>

      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: 'auto',
          backgroundColor: '#0f172a',
          borderTop: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#e2e8f0',
                fontStyle: 'italic',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                mb: 1,
                fontWeight: 500,
              }}
            >
              "Your rights are written in fine print. Our AI reads between the lines."
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#94a3b8',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              — by YOU
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b',
              textAlign: 'center',
              mt: 2,
            }}
          >
            AI-Sentinel © {new Date().getFullYear()} • Intelligent Legal Document Auditor
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
