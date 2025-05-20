'use client';

import { Container, Box } from '@mui/material';
import HeroSection from '@/components/ui/HeroSection';
import ComingSoonSection from '@/components/ui/ComingSoonSection';
import MainLayout from '@/components/layout/MainLayout';
import { useHomeViewModel } from '@/viewmodels';

export default function HomePage() {
  const {
    searchQuery,
    setSearchQuery,
  } = useHomeViewModel();

  return (
    <MainLayout>
      <Box>
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <ComingSoonSection />
      </Box>
    </MainLayout>
  );
}
