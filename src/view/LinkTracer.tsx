'use client';
/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { Box, Button, TextField, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useState } from 'react';
import useLinkTracer from '@/viewmodel/useLinkTracer';

export default function LinkTracer() {
  const [url, setUrl] = useState('');
  const { steps, loading, error, trace } = useLinkTracer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) trace(url);
  };

  return (
    <Box component="section" sx={{ p: 2 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <TextField
          fullWidth
          label="Dynamic Link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button type="submit" variant="contained" disabled={loading}>Trace</Button>
      </form>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
      )}
      <List>
        {steps.map((step, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={`${idx + 1}. ${step.url}`}
              secondary={`Status: ${step.status}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
