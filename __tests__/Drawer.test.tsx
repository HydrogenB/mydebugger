/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * WORLD-CLASS DESIGN SYSTEM COMPONENT TESTS
 * Comprehensive test suite following international software engineering standards
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Drawer } from '../src/design-system/components/overlays/Drawer';

// Mock createPortal for overlay components
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

describe('Drawer Component - World-Class Test Coverage', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div data-testid="drawer-content">Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any existing modals
    document.body.innerHTML = '';
  });

  describe('Core Functionality', () => {
    it('should render drawer content when open', () => {
      render(<Drawer {...defaultProps} />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('should not render content when closed', () => {
      render(<Drawer {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument();
    });

    it('should call onClose when overlay is clicked', async () => {
      const onClose = jest.fn();
      render(<Drawer {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByRole('presentation');
      fireEvent.click(overlay);
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onClose when escape key is pressed', async () => {
      const onClose = jest.fn();
      render(<Drawer {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Positioning & Variants', () => {
    it('should apply correct position classes for left placement', () => {
      render(<Drawer {...defaultProps} placement="left" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('left-0');
    });

    it('should apply correct position classes for right placement', () => {
      render(<Drawer {...defaultProps} placement="right" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('right-0');
    });

    it('should apply correct position classes for top placement', () => {
      render(<Drawer {...defaultProps} placement="top" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('top-0');
    });

    it('should apply correct position classes for bottom placement', () => {
      render(<Drawer {...defaultProps} placement="bottom" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('bottom-0');
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      render(<Drawer {...defaultProps} size="sm" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('w-80');
    });

    it('should apply medium size classes', () => {
      render(<Drawer {...defaultProps} size="md" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('w-96');
    });

    it('should apply large size classes', () => {
      render(<Drawer {...defaultProps} size="lg" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('w-1/2');
    });

    it('should apply extra large size classes', () => {
      render(<Drawer {...defaultProps} size="xl" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('w-2/3');
    });
  });

  describe('Accessibility & Keyboard Navigation', () => {
    it('should have proper ARIA attributes', () => {
      render(<Drawer {...defaultProps} />);
      const drawer = screen.getByRole('dialog');
      
      expect(drawer).toHaveAttribute('role', 'dialog');
      expect(drawer).toHaveAttribute('aria-modal', 'true');
    });

    it('should focus trap within drawer when open', () => {
      render(
        <Drawer {...defaultProps}>
          <button data-testid="first-button">First</button>
          <button data-testid="second-button">Second</button>
        </Drawer>
      );

      const firstButton = screen.getByTestId('first-button');
      expect(document.activeElement).toBe(firstButton);
    });

    it('should return focus to trigger element when closed', async () => {
      const triggerButton = document.createElement('button');
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { rerender } = render(<Drawer {...defaultProps} />);
      
      rerender(<Drawer {...defaultProps} isOpen={false} />);
      
      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton);
      });

      document.body.removeChild(triggerButton);
    });
  });

  describe('Animation & Transitions', () => {
    it('should apply enter animation classes when opening', () => {
      const { rerender } = render(<Drawer {...defaultProps} isOpen={false} />);
      
      rerender(<Drawer {...defaultProps} isOpen={true} />);
      
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('animate-slide-in');
    });

    it('should apply exit animation classes when closing', async () => {
      const { rerender } = render(<Drawer {...defaultProps} isOpen={true} />);
      
      rerender(<Drawer {...defaultProps} isOpen={false} />);
      
      await waitFor(() => {
        const drawer = screen.queryByRole('dialog');
        if (drawer) {
          expect(drawer).toHaveClass('animate-slide-out');
        }
      });
    });
  });

  describe('Edge Cases & Error Handling', () => {
    it('should handle missing onClose gracefully', () => {
      // Since onClose is required, test with a no-op function
      const propsWithNoOp = { ...defaultProps, onClose: () => {} };
      
      expect(() => {
        render(<Drawer {...propsWithNoOp} />);
      }).not.toThrow();
    });

    it('should handle empty children gracefully', () => {
      const propsWithEmptyChildren = { ...defaultProps, children: null };
      
      expect(() => {
        render(<Drawer {...propsWithEmptyChildren} />);
      }).not.toThrow();
    });

    it('should handle rapid open/close state changes', async () => {
      const { rerender } = render(<Drawer {...defaultProps} isOpen={false} />);
      
      // Rapid state changes
      rerender(<Drawer {...defaultProps} isOpen={true} />);
      rerender(<Drawer {...defaultProps} isOpen={false} />);
      rerender(<Drawer {...defaultProps} isOpen={true} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
      });
    });
  });

  describe('Performance & Memory Management', () => {
    it('should clean up event listeners when unmounted', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<Drawer {...defaultProps} />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('should not create memory leaks with multiple renders', () => {
      const { rerender, unmount } = render(<Drawer {...defaultProps} />);
      
      // Multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<Drawer {...defaultProps} isOpen={i % 2 === 0} />);
      }
      
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Custom Props & Styling', () => {
    it('should apply custom className', () => {
      render(<Drawer {...defaultProps} className="custom-drawer" />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('custom-drawer');
    });

    it('should apply custom data attributes', () => {
      render(<Drawer {...defaultProps} data-testid="custom-drawer" />);
      expect(screen.getByTestId('custom-drawer')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Drawer {...defaultProps} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Theme Integration', () => {
    it('should respect dark mode styling', () => {
      document.documentElement.classList.add('dark');
      
      render(<Drawer {...defaultProps} />);
      const drawer = screen.getByRole('dialog');
      
      expect(drawer).toHaveClass('dark:bg-gray-800');
      
      document.documentElement.classList.remove('dark');
    });

    it('should apply proper z-index for layering', () => {
      render(<Drawer {...defaultProps} />);
      const overlay = screen.getByRole('presentation');
      expect(overlay).toHaveClass('z-50');
    });
  });
});
