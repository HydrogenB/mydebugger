'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Container,
  Paper,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function HeroSection({ searchQuery, onSearchChange }: HeroSectionProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        pt: 6,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: 'transparent',
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="primary"
            fontWeight="bold"
            gutterBottom
          >
            MyDebugger
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Your comprehensive toolkit for web and app debugging
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
              gap: 2,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <TextField
              fullWidth
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" color="primary" sx={{ px: 4 }}>
              Search
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
