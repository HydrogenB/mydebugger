'use client';

import { Box, Typography, Container, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import MainLayout from '@/components/layout/MainLayout';
import { useState } from 'react';
import Link from 'next/link';
import { TOOL_CATEGORIES } from '@/constants';

// Define module data structure
interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  isNew?: boolean;
}

// List of available modules
const modules: ModuleInfo[] = [
  {
    id: 'module-template',
    name: 'Module Template',
    description: 'Template demonstrating MVVM architecture for modules',
    category: TOOL_CATEGORIES.UTILITIES,
    path: '/modules/module-template',
    isNew: true,
  },
  // Additional modules will be added here as they are developed
];

export default function ModulesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter modules by category
  const filteredModules = selectedCategory 
    ? modules.filter(module => module.category === selectedCategory)
    : modules;

  // Group categories for the filter
  const categories = [...new Set(modules.map(module => module.category))];

  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Debugging Tools
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Explore our collection of debugging tools designed to streamline your development workflow.
          </Typography>
        </Box>

        {/* Category filters */}
        <Box sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant={selectedCategory === null ? 'contained' : 'outlined'}
            onClick={() => setSelectedCategory(null)}
            sx={{ mb: 1 }}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory(category)}
              sx={{ mb: 1 }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </Box>

        {/* Module cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {filteredModules.map(module => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                  },
                  transition: 'box-shadow 0.3s ease-in-out',
                }}
              >
                {module.isNew && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    NEW
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {module.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    href={module.path}
                  >
                    Open Tool
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </MainLayout>
  );
}
