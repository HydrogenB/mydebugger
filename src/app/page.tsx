'use client';

/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { Box } from '@mui/material';
import HeroSection from '@/components/ui/HeroSection';
import ToolsSection from '@/components/ui/ToolsSection';
import MainLayout from '@/components/layout/MainLayout';
import { useHomeViewModel } from '@/viewmodel';

export default function HomePage() {
  const { searchQuery, setSearchQuery, filteredTools } = useHomeViewModel();

  return (
    <MainLayout>
      <Box>
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <ToolsSection tools={filteredTools} />
      </Box>
    </MainLayout>
  );
}
