'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { Box, Container, Grid, Typography } from '@mui/material';
import ToolCard from './ToolCard';
import { Tool } from '@/models';

interface ToolsSectionProps {
  tools: Tool[];
}

export default function ToolsSection({ tools }: ToolsSectionProps) {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        <Typography component="h2" variant="h4" align="center" gutterBottom>
          Available Tools
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {tools.map((tool) => (
            <Grid key={tool.id} item xs={12} sm={6} md={4}>
              <ToolCard tool={tool} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
