import React, { useState, useEffect } from 'react';

export interface PaginationProps {
  /** Total number of items to paginate */
  totalItems: number;
  /** Number of items to display per page */
  itemsPerPage: number;
  /** Current active page (1-based) */
  currentPage?: number;
  /** Function called when page changes */
  onPageChange?: (page: number) => void;
  /** How many page buttons to show at once */
  siblingCount?: number;
  /** Whether to show the first/last page buttons */
  showFirstLastButtons?: boolean;
  /** Whether to always show the first and last page in the pagination */
  boundaryLinks?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Size of the pagination buttons */
  size?: 'sm' | 'md' | 'lg';
  /** Shape of the pagination buttons */
  shape?: 'rounded' | 'square' | 'circular';
  /** Whether pagination is disabled */
  disabled?: boolean;
  /** Custom label for previous button */
  prevLabel?: React.ReactNode;
  /** Custom label for next button */
  nextLabel?: React.ReactNode;
  /** Custom label for first page button */
  firstLabel?: React.ReactNode;
  /** Custom label for last page button */
  lastLabel?: React.ReactNode;
}

/**
 * Pagination component for navigating through paginated content
 */
const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage: controlledPage,
  onPageChange,
  siblingCount = 1,
  showFirstLastButtons = false,
  boundaryLinks = false,
  className = '',
  size = 'md',
  shape = 'rounded',
  disabled = false,
  prevLabel = '←',
  nextLabel = '→',
  firstLabel = '«',
  lastLabel = '»',
}) => {
  // Internal state for uncontrolled usage
  const [internalPage, setInternalPage] = useState(1);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledPage !== undefined;
  const activePage = isControlled ? controlledPage : internalPage;
  
  // Calculate total number of pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Update internal page when controlled value changes
  useEffect(() => {
    if (isControlled) {
      setInternalPage(controlledPage);
    }
  }, [isControlled, controlledPage]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Ensure page is within valid range
    const validPage = Math.max(1, Math.min(totalPages, page));
    
    if (validPage === activePage || disabled) {
      return;
    }
    
    if (isControlled) {
      onPageChange?.(validPage);
    } else {
      setInternalPage(validPage);
      onPageChange?.(validPage);
    }
  };
  
  // Generate page numbers to display
  const generatePageNumbers = () => {
    // Always show at least 5 page buttons (or fewer if not enough pages)
    const minVisiblePages = Math.min(totalPages, 5);
    
    // Calculate start and end page based on current page and sibling count
    let startPage = Math.max(1, activePage - siblingCount);
    let endPage = Math.min(totalPages, activePage + siblingCount);
    
    // Adjust start and end to ensure we show enough pages
    const pagesToShow = endPage - startPage + 1;
    if (pagesToShow < minVisiblePages) {
      if (activePage <= totalPages / 2) {
        // Near the start, so extend end
        endPage = Math.min(startPage + minVisiblePages - 1, totalPages);
      } else {
        // Near the end, so extend start
        startPage = Math.max(endPage - minVisiblePages + 1, 1);
      }
    }
    
    const pages: (number | 'ellipsis')[] = [];
    
    // Add first page if needed
    if (boundaryLinks && startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis');
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add last page if needed
    if (boundaryLinks && endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-md',
  };
  
  // Shape classes
  const shapeClasses = {
    rounded: 'rounded',
    square: 'rounded-none',
    circular: 'rounded-full',
  };
  
  // Button base classes
  const buttonBaseClass = [
    'flex items-center justify-center',
    'transition-colors duration-200',
    'border border-gray-300 dark:border-gray-600',
    'bg-white dark:bg-gray-800',
    'text-gray-700 dark:text-gray-300',
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700',
    sizeClasses[size],
    shapeClasses[shape],
  ].join(' ');
  
  // Active button classes
  const activeButtonClass = [
    'flex items-center justify-center',
    'border border-blue-500 dark:border-blue-600',
    'bg-blue-500 dark:bg-blue-600',
    'text-white',
    'cursor-default',
    sizeClasses[size],
    shapeClasses[shape],
  ].join(' ');
  
  // Ellipsis classes
  const ellipsisClass = [
    'flex items-center justify-center',
    sizeClasses[size],
    'border-none bg-transparent',
    'text-gray-500 dark:text-gray-400 cursor-default',
  ].join(' ');
  
  // Container classes
  const containerClass = [
    'flex items-center space-x-1',
    className,
  ].join(' ');
  
  // Page numbers to display
  const pageNumbers = generatePageNumbers();
  
  // If no pages or only one page, don't render pagination
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <nav className={containerClass} aria-label="Pagination">
      {/* First page button */}
      {showFirstLastButtons && (
        <button
          type="button"
          className={buttonBaseClass}
          onClick={() => handlePageChange(1)}
          disabled={activePage === 1 || disabled}
          aria-label="Go to first page"
        >
          {firstLabel}
        </button>
      )}
      
      {/* Previous page button */}
      <button
        type="button"
        className={buttonBaseClass}
        onClick={() => handlePageChange(activePage - 1)}
        disabled={activePage === 1 || disabled}
        aria-label="Go to previous page"
      >
        {prevLabel}
      </button>
      
      {/* Page number buttons */}
      {pageNumbers.map((page, index) => 
        page === 'ellipsis' ? (
          <span 
            key={`ellipsis-${index}`}
            className={ellipsisClass}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={page === activePage ? activeButtonClass : buttonBaseClass}
            onClick={() => handlePageChange(page)}
            disabled={page === activePage || disabled}
            aria-label={`Go to page ${page}`}
            aria-current={page === activePage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}
      
      {/* Next page button */}
      <button
        type="button"
        className={buttonBaseClass}
        onClick={() => handlePageChange(activePage + 1)}
        disabled={activePage === totalPages || disabled}
        aria-label="Go to next page"
      >
        {nextLabel}
      </button>
      
      {/* Last page button */}
      {showFirstLastButtons && (
        <button
          type="button"
          className={buttonBaseClass}
          onClick={() => handlePageChange(totalPages)}
          disabled={activePage === totalPages || disabled}
          aria-label="Go to last page"
        >
          {lastLabel}
        </button>
      )}
    </nav>
  );
};

export default Pagination;