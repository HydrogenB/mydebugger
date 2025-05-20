'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function NotFound() {
  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 8,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 100, color: 'primary.main', mb: 4 }} />
          <Typography variant="h2" component="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" component={Link} href="/">
              Go to Homepage
            </Button>
            <Button variant="outlined" component={Link} href="/modules">
              Browse Tools
            </Button>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
