'use client';

import { Box, Typography, Container, Paper, Button } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';

export default function ModulesPage() {
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Debugging Tools
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Explore our collection of debugging tools. More tools are coming soon!
          </Typography>
        </Box>

        <Paper 
          sx={{ 
            p: 4, 
            mt: 4, 
            mb: 6, 
            textAlign: 'center',
            minHeight: '30vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px dashed',
            borderColor: 'divider'
          }}
          elevation={0}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tools available at the moment.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We are working hard to bring you a suite of useful debugging utilities. Please check back later!
          </Typography>
          <Button component={Link} href="/" variant="outlined">
            Go to Homepage
          </Button>
        </Paper>
      </Container>
    </MainLayout>
  );
}
