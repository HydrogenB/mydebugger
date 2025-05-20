'use client';

import { Box, Container, Typography, Grid } from '@mui/material';

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
          Tools Coming Soon
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          Our suite of debugging tools is under development. Stay tuned for powerful features to simplify your workflow.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {[
            {
              title: 'JWT Toolkit',
              description: 'Decode, build, inspect, verify, and benchmark JSON Web Tokens.',
            },
            {
              title: 'URL Encoder/Decoder',
              description: 'Encode or decode URL components with ease.',
            },
            {
              title: 'HTTP Headers Analyzer',
              description: 'Analyze and understand HTTP request/response headers.',
            },
            {
              title: 'Deep-Link Tester',
              description: 'Test deep links and generate QR codes for easy sharing.',
            },
            {
              title: 'Clickjacking Validator',
              description: 'Check if websites are vulnerable to clickjacking attacks.',
            },
            {
              title: 'Link Tracer',
              description: 'Trace the complete redirect path of any URL.',
            },
          ].map((tool, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Box
                sx={{
                  p: 3,
                  height: '100%',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.3s',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  {tool.title}
                </Typography>
                <Typography color="text.secondary">{tool.description}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
