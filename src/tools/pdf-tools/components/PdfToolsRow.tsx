/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Badge, Button, SelectInput, TextInput } from '@design-system';
import { formatFileSize } from '../lib/pdfConverter';
import type { PdfOperation, PdfToolRow, RowStatus } from '../types';

const OPERATION_OPTIONS = [
  { value: 'unlock', label: 'Unlock Password' },
  { value: 'to-image', label: 'Convert to Image' },
];

const STATUS_BADGE: Record<RowStatus, { label: string; variant: 'light' | 'info' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'Pending', variant: 'light' },
  processing: { label: 'Processing…', variant: 'info' },
  done: { label: 'Done', variant: 'success' },
  'needs-password': { label: 'Needs password', variant: 'warning' },
  error: { label: 'Error', variant: 'danger' },
};

export interface PdfToolsRowProps {
  row: PdfToolRow;
  onOperationChange: (operation: PdfOperation) => void;
  onPasswordChange: (password: string) => void;
  onRetry: () => void;
  onDownload: () => void;
  onRemove: () => void;
}

const PdfToolsRow: React.FC<PdfToolsRowProps> = ({
  row,
  onOperationChange,
  onPasswordChange,
  onRetry,
  onDownload,
  onRemove,
}) => {
  const badge = STATUS_BADGE[row.status];

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 text-sm border-b border-gray-100 dark:border-gray-800">
      <span className="flex-[2] truncate" title={row.file.name}>{row.file.name}</span>
      <span className="flex-1 text-gray-500 dark:text-gray-400 text-xs">{formatFileSize(row.file.size)}</span>
      <span className="flex-1">
        <SelectInput
          value={row.operation}
          onChange={(value) => onOperationChange(value as PdfOperation)}
          options={OPERATION_OPTIONS}
          className="mb-0"
        />
      </span>
      <span className="flex-1">
        <Badge variant={badge.variant} inline pill>{badge.label}</Badge>
      </span>
      <span className="flex-[2]">
        {row.status === 'needs-password' && (
          <div className="flex items-center gap-1">
            <TextInput
              type="password"
              autoComplete="off"
              placeholder="Password for this file"
              value={row.password}
              onChange={(e) => onPasswordChange(e.target.value)}
              containerClassName="flex-1"
            />
            <Button size="xs" variant="outline-primary" onClick={onRetry}>Retry</Button>
          </div>
        )}
        {row.status === 'error' && (
          <Button size="xs" variant="outline-primary" onClick={onRetry}>Retry</Button>
        )}
        {row.errorMessage && (row.status === 'error' || row.status === 'needs-password') && (
          <span className="text-xs text-red-600 dark:text-red-400 block">{row.errorMessage}</span>
        )}
      </span>
      <Button
        size="xs"
        variant="text-primary"
        onClick={onDownload}
        disabled={row.status !== 'done'}
      >
        Download
      </Button>
      <button
        type="button"
        aria-label={`Remove ${row.file.name}`}
        onClick={onRemove}
        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-1"
      >
        ×
      </button>
    </div>
  );
};

export default PdfToolsRow;
