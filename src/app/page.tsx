'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { Box, Typography, Container } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';

export default function HomePage() {
  return (
    <MainLayout>
      <Container maxWidth="md">
        <Box sx={{ my: 8, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            MyDebugger
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Developer tools coming soon.
          </Typography>
        </Box>
      </Container>
    </MainLayout>
  );
}
