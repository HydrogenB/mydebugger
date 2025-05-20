import { renderHook, act } from '@testing-library/react';
import { useHomeViewModel } from '@/viewmodels';

describe('useHomeViewModel', () => {
  it('should initialize with empty search query', () => {
    const { result } = renderHook(() => useHomeViewModel());
    
    expect(result.current.searchQuery).toBe('');
  });

  it('should update search query when setSearchQuery is called', () => {
    const { result } = renderHook(() => useHomeViewModel());
    
    act(() => {
      result.current.setSearchQuery('jwt');
    });
    
    expect(result.current.searchQuery).toBe('jwt');
  });

  it('should initialize with no selected category', () => {
    const { result } = renderHook(() => useHomeViewModel());
    
    expect(result.current.selectedCategory).toBeNull();
  });

  it('should update selected category when setSelectedCategory is called', () => {
    const { result } = renderHook(() => useHomeViewModel());
    
    act(() => {
      result.current.setSelectedCategory('security');
    });
    
    expect(result.current.selectedCategory).toBe('security');
  });
});
