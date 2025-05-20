'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function ComingSoonSection() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h4"
          align="center"
          color="text.primary"
          gutterBottom
        >
          More Tools Coming Soon
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          Our suite of debugging tools is actively under development. Stay tuned for powerful features to simplify your workflow.
        </Typography>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            component={Link} 
            href="/modules" 
            variant="outlined" // Changed from contained to outlined for a softer look
            color="primary" 
            size="large"
          >
            Explore Available Tools
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
