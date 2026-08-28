/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { ToolLayout } from '@design-system';
import { getToolByRoute } from '../index';
import useBatchPdfTools from './hooks/useBatchPdfTools';
import PdfToolsToolbar from './components/PdfToolsToolbar';
import PdfToolsRow from './components/PdfToolsRow';

const PdfToolsPage: React.FC = () => {
  const vm = useBatchPdfTools();
  const tool = getToolByRoute('/pdf-tools');

  return (
    <ToolLayout
      tool={tool!}
      title="PDF Tools"
      description="Unlock password-protected PDFs or convert them to images, one file or a whole batch, entirely in your browser."
      showRelatedTools
    >
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <PdfToolsToolbar
          defaultPassword={vm.defaultPassword}
          onDefaultPasswordChange={vm.setDefaultPassword}
          bulkOperation={vm.bulkOperation}
          onBulkOperationChange={vm.setBulkOperation}
          onApplyToAll={vm.applyOperationToAll}
          onFilesSelected={vm.addFiles}
          onStartAll={() => {
            void vm.startAll();
          }}
          onDownloadAllAsZip={() => {
            void vm.downloadAllAsZip();
          }}
          hasCompletedRows={vm.rows.some((row) => row.status === 'done')}
          hasPendingRows={vm.rows.some((row) => row.status === 'pending')}
        />

        {vm.rows.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Add one or more PDFs to get started.
          </p>
        ) : (
          <div>
            {vm.rows.map((row) => (
              <PdfToolsRow
                key={row.id}
                row={row}
                onOperationChange={(operation) => vm.setRowOperation(row.id, operation)}
                onPasswordChange={(password) => vm.setRowPassword(row.id, password)}
                onRetry={() => {
                  void vm.retryRow(row.id);
                }}
                onDownload={() => {
                  void vm.downloadRow(row.id);
                }}
                onRemove={() => vm.removeRow(row.id)}
              />
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToolsPage;
