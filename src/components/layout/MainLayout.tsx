'use client';

import { Box } from '@mui/material';
import NavBar from './NavBar';
import Footer from './Footer';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <NavBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
