import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '../Modal';

// Mock createPortal to test modal content
jest.mock('react-dom', () => {
  const original = jest.requireActual('react-dom');
  return {
    ...original,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('Modal Component', () => {
  beforeEach(() => {
    // Reset body style between tests
    document.body.style.overflow = '';
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        <p>Small modal</p>
      </Modal>
    );
    
    let dialog = screen.getByRole('dialog').querySelector('div[id]');
    expect(dialog).toHaveClass('max-w-sm');
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <p>Large modal</p>
      </Modal>
    );
    
    dialog = screen.getByRole('dialog').querySelector('div[id]');
    expect(dialog).toHaveClass('max-w-lg');
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="full">
        <p>Full-size modal</p>
      </Modal>
    );
    
    dialog = screen.getByRole('dialog').querySelector('div[id]');
    expect(dialog).toHaveClass('max-w-full');
    expect(dialog).toHaveClass('min-h-screen');
  });

  it('calls onClose when backdrop is clicked and closeOnClickOutside is true', () => {
    const onClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnClickOutside={true}>
        <p>Click outside me</p>
      </Modal>
    );
    
    // Click on the backdrop (the parent div of the modal content)
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when backdrop is clicked and closeOnClickOutside is false', () => {
    const onClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnClickOutside={false}>
        <p>Cannot click outside</p>
      </Modal>
    );
    
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed and closeOnEsc is true', () => {
    const onClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEsc={true}>
        <p>Press escape</p>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when Escape key is pressed and closeOnEsc is false', () => {
    const onClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEsc={false}>
        <p>Cannot press escape</p>
      </Modal>
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders close button and calls onClose when clicked', () => {
    const onClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} showCloseButton={true}>
        <p>Modal with close button</p>
      </Modal>
    );
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        <p>Modal without close button</p>
      </Modal>
    );
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        title="Modal Title"
        description="This is a description"
        id="test-modal"
      >
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toBeInTheDocument();
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'test-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'test-modal-description');
  });

  it('renders with footer', () => {
    const footer = (
      <>
        <button>Cancel</button>
        <button>Confirm</button>
      </>
    );
    
    render(
      <Modal isOpen={true} onClose={() => {}} footer={footer}>
        <p>Modal with footer</p>
      </Modal>
    );
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} loading={true}>
        <p>Should not see this when loading</p>
      </Modal>
    );
    
    expect(screen.queryByText('Should not see this when loading')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('locks body scroll when modal is open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Body should be locked</p>
      </Modal>
    );
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('renders Modal.Header subcomponent', () => {
    const onClose = jest.fn();
    
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <Modal.Header
          title="Custom Header"
          subtitle="With subtitle"
          onClose={onClose}
        />
        <p>Content</p>
      </Modal>
    );
    
    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.getByText('With subtitle')).toBeInTheDocument();
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders Modal.Body subcomponent', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <Modal.Body className="custom-body-class">
          <p>Body content</p>
        </Modal.Body>
      </Modal>
    );
    
    const bodyElement = screen.getByText('Body content').parentElement;
    expect(bodyElement).toHaveClass('p-6');
    expect(bodyElement).toHaveClass('custom-body-class');
  });

  it('renders Modal.Footer subcomponent', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
        <Modal.Footer className="custom-footer-class">
          <button>Footer button</button>
        </Modal.Footer>
      </Modal>
    );
    
    const footerElement = screen.getByText('Footer button').parentElement;
    expect(footerElement).toHaveClass('border-t');
    expect(footerElement).toHaveClass('custom-footer-class');
  });

  it('applies custom className to the modal', () => {
    render(
      <Modal 
        isOpen={true} 
        onClose={() => {}} 
        className="custom-modal-class"
        backdropClassName="custom-backdrop-class"
      >
        <p>Custom styled modal</p>
      </Modal>
    );
    
    const backdrop = screen.getByRole('dialog');
    expect(backdrop).toHaveClass('custom-backdrop-class');
    
    const modalContainer = backdrop.firstChild as HTMLElement;
    expect(modalContainer).toHaveClass('custom-modal-class');
  });

  it('renders without animations when animate is false', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} animate={false}>
        <p>No animations</p>
      </Modal>
    );
    
    const backdrop = screen.getByRole('dialog');
    expect(backdrop).not.toHaveClass('transition-opacity');
    
    const modalContainer = backdrop.firstChild as HTMLElement;
    expect(modalContainer).not.toHaveClass('transition-all');
  });

  it('renders with fullHeight option', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} fullHeight>
        <p>Full height modal</p>
      </Modal>
    );
    
    const modalContainer = screen.getByRole('dialog').firstChild as HTMLElement;
    expect(modalContainer).toHaveClass('h-full');
  });
});