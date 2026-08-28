/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React, { useRef } from 'react';
import { Button, SelectInput, TextInput } from '@design-system';
import type { PdfOperation } from '../types';

const OPERATION_OPTIONS = [
  { value: 'unlock', label: 'Unlock Password' },
  { value: 'to-image', label: 'Convert to Image' },
];

export interface PdfToolsToolbarProps {
  defaultPassword: string;
  onDefaultPasswordChange: (password: string) => void;
  bulkOperation: PdfOperation;
  onBulkOperationChange: (operation: PdfOperation) => void;
  onApplyToAll: () => void;
  onFilesSelected: (files: FileList) => void;
  onStartAll: () => void;
  onDownloadAllAsZip: () => void;
  onClearAll: () => void;
  hasCompletedRows: boolean;
  hasPendingRows: boolean;
  hasRows: boolean;
  isProcessing: boolean;
}

const PdfToolsToolbar: React.FC<PdfToolsToolbarProps> = ({
  defaultPassword,
  onDefaultPasswordChange,
  bulkOperation,
  onBulkOperationChange,
  onApplyToAll,
  onFilesSelected,
  onStartAll,
  onDownloadAllAsZip,
  onClearAll,
  hasCompletedRows,
  hasPendingRows,
  hasRows,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="flex flex-wrap items-end gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFilesSelected(e.dataTransfer.files);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
      <Button size="sm" variant="primary" onClick={() => fileInputRef.current?.click()}>
        Add PDFs
      </Button>

      <TextInput
        type="password"
        autoComplete="off"
        label="Default password"
        placeholder="Applies to all files unless overridden"
        value={defaultPassword}
        onChange={(e) => onDefaultPasswordChange(e.target.value)}
        containerClassName="w-56"
      />

      <span className="flex items-end gap-1">
        <SelectInput
          value={bulkOperation}
          onChange={(value) => onBulkOperationChange(value as PdfOperation)}
          options={OPERATION_OPTIONS}
          className="mb-0 w-44"
        />
        <Button size="sm" variant="outline-secondary" onClick={onApplyToAll}>Apply to all</Button>
      </span>

      <Button size="sm" variant="success" onClick={onStartAll} disabled={!hasPendingRows || isProcessing}>
        Start
      </Button>
      <Button size="sm" variant="outline-primary" onClick={onDownloadAllAsZip} disabled={!hasCompletedRows}>
        Download All as ZIP
      </Button>
      <Button size="sm" variant="outline-secondary" onClick={onClearAll} disabled={!hasRows}>
        Clear All
      </Button>
    </div>
  );
};

export default PdfToolsToolbar;
