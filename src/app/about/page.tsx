'use client';

import MainLayout from '@/components/layout/MainLayout';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Button from '@mui/material/Button';

export default function AboutPage() {
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, my: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            About MyDebugger
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="body1" paragraph>
            MyDebugger is a comprehensive web-based debugging and developer toolkit application designed to streamline development workflows and provide developers with essential tools in one place.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Our platform is built as a stateless application deployed on Vercel, requiring no database and ensuring each deployment stands as a clean slate. This makes it fast, reliable, and secure.
          </Typography>

          <Box sx={{ mt: 4, mb: 4 }}>
            {/* Content related to "What's New" or "Featured Tools" can be added here later */}
            {/* For now, keeping it clean as per the user's request to focus on structure and fixing build errors */}
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Placeholder for future content like "Our Vision" or "Get Involved" */}
          {/* This section can be populated once the core structure is stable and modules are being developed. */}
          <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mt: 4 }}>
            Our Vision
          </Typography>
          <Typography variant="body1" paragraph align="center">
            To be the developer&apos;s trusted companion for everyday debugging and development tasks, offering a seamless and efficient experience.
          </Typography>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom component="h2" sx={{ mb: 2 }}>
              Explore Our Tools
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              We are continuously developing a range of tools across various categories to assist you. 
              While our specific tool list is evolving, you can visit our tools page to see what's currently available or planned.
            </Typography>
            <Button
              component={Link}
              href="/modules"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
            >
              View Tools Page
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}
