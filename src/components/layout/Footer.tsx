'use client';

import { Box, Typography, Container, Link as MuiLink } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' '}
          <MuiLink color="inherit" href="/">
            MyDebugger
          </MuiLink>
          {' - A stateless debugging toolkit for developers'}
        </Typography>
      </Container>
    </Box>
  );
}
