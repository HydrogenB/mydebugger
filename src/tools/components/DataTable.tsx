import React, { useState, useMemo, useEffect } from 'react';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T | ((row: T) => string);
  isLoading?: boolean;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: React.ReactNode;
  loadingMessage?: React.ReactNode;
  sortable?: boolean;
  defaultSortKey?: string;
  defaultSortDir?: 'asc' | 'desc';
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  serverSide?: boolean;
  totalItems?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  stickyHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  responsiveBreakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | false;
}

interface TableHeaderProps<T> {
  columns: Column<T>[];
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  className?: string;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  stickyHeader?: boolean;
}

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions: number[];
  className?: string;
}

/**
 * DataTable - A flexible, accessible data table with sorting, filtering, and pagination
 */
function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  isLoading = false,
  className = '',
  tableClassName = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = () => '',
  onRowClick,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading data...',
  sortable = true,
  defaultSortKey = '',
  defaultSortDir = 'asc',
  filterable = false,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  serverSide = false,
  totalItems: externalTotalItems,
  onPageChange,
  onSortChange,
  onFilterChange,
  stickyHeader = false,
  striped = true,
  bordered = false,
  compact = false,
  verticalAlign = 'middle',
  responsiveBreakpoint = 'md',
}: DataTableProps<T>) {
  // State
  const [sortKey, setSortKey] = useState<string>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDir);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const totalItems = useMemo(() => 
    serverSide ? externalTotalItems || 0 : filteredData.length,
    [serverSide, externalTotalItems, filteredData]
  );
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (serverSide) return data;

    // Apply filters
    let result = [...data];
    if (filterable) {
      Object.entries(filters).forEach(([key, filterValue]) => {
        if (!filterValue) return;
        
        const column = columns.find(col => col.key === key);
        if (!column || !column.filterable) return;
        
        result = result.filter(row => {
          const cellValue = column.accessor 
            ? column.accessor(row, 0) 
            : String(row[key]);
            
          return String(cellValue)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      });
    }

    // Apply sort
    if (sortable && sortKey) {
      const sortColumn = columns.find(col => col.key === sortKey);
      if (sortColumn) {
        result.sort((a, b) => {
          let aValue = sortColumn.accessor ? sortColumn.accessor(a, 0) : a[sortKey];
          let bValue = sortColumn.accessor ? sortColumn.accessor(b, 0) : b[sortKey];
          
          // Handle React elements or complex objects
          if (React.isValidElement(aValue) || React.isValidElement(bValue)) {
            aValue = String(aValue?.props?.children || '');
            bValue = String(bValue?.props?.children || '');
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else {
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          }
        });
      }
    }

    return result;
  }, [data, filters, sortKey, sortDirection, columns, filterable, sortable, serverSide]);

  // Get current page data
  const currentData = useMemo(() => {
    if (serverSide) return data;
    if (!pagination) return filteredData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, pageSize, pagination, serverSide, data]);

  // Handle sort change
  const handleSort = (key: string) => {
    let newDirection: 'asc' | 'desc';
    if (sortKey === key) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      newDirection = 'asc';
    }
    
    setSortKey(key);
    setSortDirection(newDirection);
    
    if (serverSide && onSortChange) {
      onSortChange(key, newDirection);
    }
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Reset to first page when filter changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    
    if (serverSide && onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    if (serverSide && onPageChange) {
      onPageChange(page, pageSize);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    
    if (serverSide && onPageChange) {
      onPageChange(1, size);
    }
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  // Get key for row
  const getRowKey = (row: T, index: number): string => {
    if (typeof keyField === 'function') {
      return keyField(row);
    }
    
    const key = row[keyField];
    return key !== undefined ? String(key) : `row-${index}`;
  };

  // Vertical alignment classes
  const verticalAlignClasses = {
    top: 'align-top',
    middle: 'align-middle',
    bottom: 'align-bottom',
  };

  // Responsive wrapper class
  const responsiveWrapperClass = responsiveBreakpoint !== false
    ? `overflow-x-auto ${responsiveBreakpoint ? `sm:overflow-visible md:overflow-visible ${responsiveBreakpoint}:overflow-visible` : ''}`
    : '';

  return (
    <div className={`w-full ${className}`}>
      {/* Table actions and filter toggle */}
      {filterable && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={toggleFilters}
            className="text-sm flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      )}

      {/* Table responsive wrapper */}
      <div className={responsiveWrapperClass}>
        <table
          className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 
            ${bordered ? 'border border-gray-200 dark:border-gray-700' : ''}
            ${compact ? 'text-sm' : ''}
            ${tableClassName}`}
        >
          {/* Table header */}
          <TableHeader<T>
            columns={columns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            className={headerClassName}
            filters={filters}
            onFilterChange={handleFilterChange}
            showFilters={showFilters}
            toggleFilters={toggleFilters}
            stickyHeader={stickyHeader}
          />

          {/* Table body */}
          <tbody
            className={`divide-y divide-gray-200 dark:divide-gray-700 ${bodyClassName}`}
          >
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  {loadingMessage}
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr
                  key={getRowKey(row, rowIndex)}
                  className={`
                    ${striped && rowIndex % 2 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
                    ${onRowClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                    ${rowClassName(row, rowIndex)}
                  `}
                  onClick={() => onRowClick && onRowClick(row, rowIndex)}
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={`px-6 py-3 ${verticalAlignClasses[verticalAlign]} 
                        ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                        ${column.cellClassName || ''}`}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.accessor
                        ? column.accessor(row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {pagination && !isLoading && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
          className="mt-4"
        />
      )}
    </div>
  );
}

/**
 * Table header component with sort and filter functionality
 */
function TableHeader<T>({
  columns,
  sortKey,
  sortDirection,
  onSort,
  className = '',
  filters,
  onFilterChange,
  showFilters,
  toggleFilters,
  stickyHeader,
}: TableHeaderProps<T>) {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-700 ${className} ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
      <tr>
        {columns.map(column => (
          <th
            key={column.key}
            scope="col"
            className={`px-6 py-3 text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400 uppercase
              ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
              ${column.headerClassName || ''}`}
            style={column.width ? { width: column.width } : undefined}
          >
            {column.sortable !== false ? (
              <button
                type="button"
                onClick={() => onSort(column.key)}
                className="group flex items-center space-x-1 focus:outline-none"
              >
                <span>{column.header}</span>
                {sortKey === column.key ? (
                  <span>
                    {sortDirection === 'asc' ? (
                      <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                ) : (
                  <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                )}
              </button>
            ) : (
              column.header
            )}
          </th>
        ))}
      </tr>
      
      {showFilters && (
        <tr className="bg-gray-100 dark:bg-gray-800">
          {columns.map(column => (
            <td key={`filter-${column.key}`} className="px-6 py-2">
              {column.filterable !== false && (
                <input
                  type="text"
                  value={filters[column.key] || ''}
                  onChange={e => onFilterChange(column.key, e.target.value)}
                  placeholder="Filter..."
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                />
              )}
            </td>
          ))}
        </tr>
      )}
    </thead>
  );
}

/**
 * Pagination component for navigating between pages
 */
function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if there are few enough
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start or end
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis before middle pages if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis after middle pages if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-between gap-y-3 ${className}`}>
      {/* Results summary */}
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Page size selector */}
      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 space-x-2">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-white py-1 pl-2 pr-8"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>per page</span>
      </div>

      {/* Page navigation */}
      <div className="flex space-x-1">
        {/* Previous button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`px-3 py-1 rounded-md flex items-center
            ${
              currentPage <= 1
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, i) => (
          typeof page === 'number' ? (
            <button
              key={`page-${i}`}
              onClick={() => goToPage(page)}
              className={`min-w-[2rem] px-3 py-1 rounded-md
                ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {page}
            </button>
          ) : (
            <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-700 dark:text-gray-300">
              {page}
            </span>
          )
        ))}

        {/* Next button */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-3 py-1 rounded-md flex items-center
            ${
              currentPage >= totalPages
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default DataTable;