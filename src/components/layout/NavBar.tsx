'use client';

import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BugReportIcon from '@mui/icons-material/BugReport';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Link from 'next/link';
import { useThemeContext } from './ThemeRegistry';

export default function NavBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { mode, toggleMode } = useThemeContext();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              MyDebugger
            </Link>
          </Typography>
          <Tooltip title={`Toggle ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton 
              color="inherit" 
              onClick={toggleMode} 
              sx={{ mr: 1 }}
              aria-label="toggle theme"
            >
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
          <Button color="inherit" component={Link} href="/about">
            About
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/">
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/modules">
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText primary="Tools" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
            </ListItem>
          </List>
          <Divider />
          <List>            <Typography
              variant="subtitle2"
              sx={{ px: 2, pt: 2, pb: 1, fontWeight: 'bold' }}
            >
              Tool Categories
            </Typography>
            <ListItem disablePadding>
                <ListItemText 
                  primary="More categories coming soon." 
                  sx={{ px:2, py:1 }} 
                  primaryTypographyProps={{variant: 'caption', color: 'textSecondary'}}
                />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
