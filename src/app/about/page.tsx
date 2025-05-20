'use client';

import MainLayout from '@/components/layout/MainLayout';
import { Container, Typography, Box, Paper, Grid, Divider } from '@mui/material';

export default function AboutPage() {
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, my: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            About MyDebugger
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="body1" paragraph>
            MyDebugger is a comprehensive web-based debugging and developer toolkit application designed to streamline development workflows and provide developers with essential tools in one place.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our platform is built as a stateless application deployed on Vercel, requiring no database and ensuring each deployment stands as a clean slate. This makes it fast, reliable, and secure.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Our Vision
            </Typography>
            <Typography variant="body1" paragraph>
              To create the ultimate developer companion that consolidates essential debugging tools into a single, intuitive platform, eliminating the need for developers to use multiple scattered online utilities.
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Tool Categories
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {[
                {
                  title: 'Encoding',
                  description: 'Transform data between different encoding formats',
                },
                {
                  title: 'Security',
                  description: 'Tools for security testing, token validation, and encryption',
                },
                {
                  title: 'Testing',
                  description: 'Validate and test various network configurations and responses',
                },
                {
                  title: 'Utilities',
                  description: 'General purpose developer utilities',
                },
                {
                  title: 'Conversion',
                  description: 'Convert between different data formats',
                },
                {
                  title: 'Formatters',
                  description: 'Format and prettify code and data',
                },
              ].map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ p: 2, border: 1, borderRadius: 1, borderColor: 'divider', height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      {category.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}
