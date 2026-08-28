/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationProvider } from '../src/context/TranslationContext';

// The real qpdfClient module pulls in a Vite Worker factory that uses
// `import.meta.url` — syntax Jest's CJS transform can't parse. This test
// never triggers unlockPdf, so stub the module boundary (same pattern as
// __tests__/tools.pdf-tools.useBatchPdfTools.test.ts).
jest.mock('../src/tools/pdf-tools/lib/qpdfClient', () => ({
  unlockPdf: jest.fn(),
}));

jest.mock('../src/tools/index', () => ({
  getToolByRoute: () => ({
    id: 'pdf-tools',
    route: '/pdf-tools',
    title: 'PDF Tools',
    description: 'test',
    icon: () => null,
    category: 'Utilities',
    metadata: { keywords: [] },
  }),
  // ToolLayout renders <RelatedTools> (showRelatedTools=true in page.tsx),
  // which also imports from this module — keep it a no-op for this test.
  getRelatedTools: () => [],
}));

import PdfToolsPage from '../src/tools/pdf-tools/page';

// ToolLayout reads from TranslationContext, so the page needs a provider
// ancestor to render at all outside the full app shell.
const renderPage = () => render(<PdfToolsPage />, { wrapper: TranslationProvider });

describe('PdfToolsPage', () => {
  test('shows an empty-state message with no files added', () => {
    renderPage();
    expect(screen.getByText(/add one or more pdfs to get started/i)).toBeInTheDocument();
  });

  test('adding a file renders a row with its name', () => {
    renderPage();
    const file = new File([new Uint8Array([1])], 'contract.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('contract.pdf')).toBeInTheDocument();
  });
});
