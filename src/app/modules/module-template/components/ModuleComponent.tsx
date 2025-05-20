/**
 * Module UI component template
 * 
 * This is a template for module-specific UI components.
 * Components should only render based on props from the ViewModel.
 * No direct imports from models should be here.
 */

'use client';

import { Box, Typography, CircularProgress, Alert, Button, TextField, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState } from 'react';

/**
 * Component props
 * These should come from the ViewModel
 */
interface ModuleComponentProps {
  processedData: string;
  loading: boolean;
  error: string | null;
  onRefresh: (id: string) => Promise<void>;
}

/**
 * UI Component for the module
 * This is a dumb component that renders based on props
 */
export default function ModuleComponent({
  processedData,
  loading,
  error,
  onRefresh,
}: ModuleComponentProps) {
  const [idInput, setIdInput] = useState<string>('');

  // Handler for refreshing data
  const handleRefresh = () => {
    if (idInput.trim()) {
      onRefresh(idInput);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        mb: 4,
        maxWidth: 800,
        mx: 'auto',
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Module Template Component
      </Typography>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main content */}
      <Box sx={{ mb: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Typography variant="body1">
            {processedData || 'No data available'}
          </Typography>
        )}
      </Box>

      {/* Input form */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Enter ID"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          disabled={loading || !idInput.trim()}
        >
          Refresh
        </Button>
      </Box>
    </Paper>
  );
}
