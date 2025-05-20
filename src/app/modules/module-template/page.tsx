/**
 * Module page template
 * 
 * This file demonstrates how to create a module page that follows the MVVM pattern.
 * The structure should be followed for all new modules.
 */

'use client';

import { Box, Typography, Container } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import ModuleComponent from '../components/ModuleComponent';
import { useModuleViewModel } from '../viewmodels/useModuleViewModel';

/**
 * Module page component
 * Connects the ViewModel with the View (UI components)
 */
export default function ModuleTemplatePage() {
  // Get all necessary data and handlers from the ViewModel
  const {
    processedData,
    loading,
    error,
    refreshData,
  } = useModuleViewModel('default-id');

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Module Template
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This is a template that demonstrates the MVVM architecture pattern for a module.
            Each module should follow this pattern with Models, ViewModels, and Views.
          </Typography>

          {/* Module component receives props from the ViewModel */}
          <ModuleComponent
            processedData={processedData}
            loading={loading}
            error={error}
            onRefresh={refreshData}
          />

          {/* Module documentation */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom>
              Module Structure Documentation
            </Typography>
            <Typography variant="body1" paragraph>
              Each module should follow this structure:
            </Typography>
            <ul>
              <li>
                <Typography><strong>Models</strong>: Pure business logic and data structures</Typography>
              </li>
              <li>
                <Typography><strong>ViewModels</strong>: React hooks that handle state and connect to models</Typography>
              </li>
              <li>
                <Typography><strong>Components</strong>: UI components that receive props from ViewModels</Typography>
              </li>
              <li>
                <Typography><strong>page.tsx</strong>: Next.js page that connects everything together</Typography>
              </li>
            </ul>
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
