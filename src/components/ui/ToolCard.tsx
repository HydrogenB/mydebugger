'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
} from '@mui/material';
import { Tool } from '@/models';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography component="h3" variant="h6" gutterBottom>
          {tool.name}
        </Typography>
        <Typography color="text.secondary">{tool.description}</Typography>
      </CardContent>
      <CardActions>
        <Button
          component={Link}
          href={tool.route}
          size="small"
          variant="contained"
          color="primary"
        >
          Open
        </Button>
      </CardActions>
    </Card>
  );
}
