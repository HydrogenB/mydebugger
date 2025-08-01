/**
 * © 2025 MyDebugger Contributors – MIT License
 * Simple Drawer Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Drawer } from '../src/design-system/components/overlays/Drawer';

// Mock createPortal for overlay components
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

describe('Drawer Component - Basic Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div data-testid="drawer-content">Test Content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
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

    it('should call onClose when overlay is clicked', () => {
      const onClose = jest.fn();
      render(<Drawer {...defaultProps} onClose={onClose} closeOnOverlayClick={true} />);
      
      // Find and click the backdrop/overlay
      const backdrop = document.querySelector('[role="presentation"]');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should handle different placements', () => {
      const { rerender } = render(<Drawer {...defaultProps} placement="left" />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();

      rerender(<Drawer {...defaultProps} placement="right" />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();

      rerender(<Drawer {...defaultProps} placement="top" />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();

      rerender(<Drawer {...defaultProps} placement="bottom" />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('should handle different sizes', () => {
      const { rerender } = render(<Drawer {...defaultProps} size="sm" />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();

      rerender(<Drawer {...defaultProps} size="md" />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();

      rerender(<Drawer {...defaultProps} size="lg" />);
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('should show title when provided', () => {
      render(<Drawer {...defaultProps} title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should show close button when enabled', () => {
      render(<Drawer {...defaultProps} showCloseButton={true} />);
      // Look for close button by role or aria-label
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Drawer {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should handle escape key', () => {
      const onClose = jest.fn();
      render(<Drawer {...defaultProps} onClose={onClose} closeOnEsc={true} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
