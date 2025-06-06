import { renderHook, act } from '@testing-library/react';
import { useHomeViewModel } from '@/viewmodel';

describe('useHomeViewModel', () => {
  it('should initialize with empty search query and all tools', () => {
    const { result } = renderHook(() => useHomeViewModel());

    expect(result.current.searchQuery).toBe('');
    expect(result.current.filteredTools.length).toBeGreaterThan(0);
  });

  it('should update search query and filter tools', () => {
    const { result } = renderHook(() => useHomeViewModel());

    act(() => {
      result.current.setSearchQuery('link');
    });

    expect(result.current.searchQuery).toBe('link');
    expect(
      result.current.filteredTools.every((tool) =>
        tool.name.toLowerCase().includes('link'),
      ),
    ).toBe(true);
  });
});
