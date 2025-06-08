import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    // Check for small size class
    let dialog = screen.getByRole('dialog');
    let dialogContent = dialog.querySelector('.max-w-sm');
    expect(dialogContent).toBeInTheDocument();
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    // Check for large size class
    dialog = screen.getByRole('dialog');
    dialogContent = dialog.querySelector('.max-w-lg');
    expect(dialogContent).toBeInTheDocument();
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="xl">
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    // Check for extra large size class
    dialog = screen.getByRole('dialog');
    dialogContent = dialog.querySelector('.max-w-xl');
    expect(dialogContent).toBeInTheDocument();
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="2xl">
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    // Check for 2xl size class
    dialog = screen.getByRole('dialog');
    dialogContent = dialog.querySelector('.max-w-2xl');
    expect(dialogContent).toBeInTheDocument();
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="full">
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    // Check for full size class
    dialog = screen.getByRole('dialog');
    dialogContent = dialog.querySelector('.max-w-full');
    expect(dialogContent).toBeInTheDocument();
  });
  
  it('applies custom className to backdrop', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} backdropClassName="custom-backdrop">
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    const backdrop = screen.getByTestId('modal-backdrop');
    expect(backdrop).toHaveClass('custom-backdrop');
  });
  
  it('applies custom className to modal content', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} className="custom-modal">
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    const modalContent = dialog.querySelector('.custom-modal');
    expect(modalContent).toBeInTheDocument();
  });
  
  it('renders with a footer', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
        <Modal.Footer>
          <button>Cancel</button>
          <button>Submit</button>
        </Modal.Footer>
      </Modal>
    );
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
  
  it('closes on backdrop click when closeOnBackdropClick is true', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdropClick={true}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
  
  it('does not close on backdrop click when closeOnBackdropClick is false', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>
        <Modal.Header>Test Modal</Modal.Header>
        <Modal.Body>Modal content</Modal.Body>
      </Modal>
    );
    
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(handleClose).not.toHaveBeenCalled();
  });
});