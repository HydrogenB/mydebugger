/**
 * © 2026 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageCompressorView, { formatBytes, outputName } from '../src/tools/image-compressor/components/ImageCompressorPanel';
import type { QueueItem, UseImageCompressorReturn } from '../src/tools/image-compressor/hooks/useImageCompressor';

beforeAll(() => {
  (URL as unknown as { createObjectURL: () => string }).createObjectURL = () => 'blob:x';
  (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
});

const file = (name: string, size = 2048) => new File([new Uint8Array(size)], name, { type: 'image/png' });
const done = (id: number, name: string): QueueItem => ({
  id, file: file(name, 10240), status: 'done', step: '',
  result: {
    bytes: new Uint8Array(4096), mime: 'image/webp', ext: 'webp',
    report: { pipeline: 'WebP q80', mode: 'visually-lossless', ssim: 0.9953, inputBytes: 10240, outputBytes: 4096, cls: 'photo', warnings: ['Heads up'], skipped: [] },
  },
});

const vm = (over: Partial<UseImageCompressorReturn> = {}): UseImageCompressorReturn => ({
  format: 'webp', setFormat: jest.fn(), items: [], addFiles: jest.fn(), removeItem: jest.fn(), clear: jest.fn(), unavailable: [],
  ...over,
});

describe('helpers', () => {
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB');
  });
  it('swaps the extension', () => {
    expect(outputName('photo.final.JPG', 'webp')).toBe('photo.final.webp');
    expect(outputName('noext', 'png')).toBe('noext.png');
  });
});

describe('ImageCompressorView', () => {
  it('shows the five formats as a radio group', () => {
    const setFormat = jest.fn();
    render(<ImageCompressorView {...vm({ setFormat, unavailable: ['gif'] })} />);
    const group = screen.getByRole('radiogroup', { name: 'Output format' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: 'WebP' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'GIF' })).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', { name: 'PNG' }));
    expect(setFormat).toHaveBeenCalledWith('png');
  });

  it('adds files from the picker and from a drop', () => {
    const addFiles = jest.fn();
    render(<ImageCompressorView {...vm({ addFiles })} />);
    const input = screen.getByLabelText('Choose images');
    fireEvent.change(input, { target: { files: [file('a.png')] } });
    expect(addFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.png' })]);
    fireEvent.drop(screen.getByRole('button', { name: /drop images here/i }), { dataTransfer: { files: [file('b.png')] } });
    expect(addFiles).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.png' })]);
  });

  it('renders progress, errors and results', () => {
    const items: QueueItem[] = [
      { id: 1, file: file('a.png'), status: 'working', step: 'WebP q85' },
      { id: 2, file: file('b.png'), status: 'error', step: '', error: 'File is larger than 50 MB.' },
      done(3, 'c.png'),
    ];
    render(<ImageCompressorView {...vm({ items })} />);
    expect(screen.getByText('WebP q85…')).toBeInTheDocument();
    expect(screen.getByText('File is larger than 50 MB.')).toBeInTheDocument();
    expect(screen.getByText('−60%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Download c.webp' })).toHaveAttribute('download', 'c.webp');
  });

  it('expands a finished row to show the report', () => {
    render(<ImageCompressorView {...vm({ items: [done(3, 'c.png')] })} />);
    fireEvent.click(screen.getByRole('button', { name: /details for c.png/i }));
    expect(screen.getByText('WebP q80')).toBeInTheDocument();
    expect(screen.getByText('Visually lossless')).toBeInTheDocument();
    expect(screen.getByText('0.9953')).toBeInTheDocument();
    expect(screen.getByText('Heads up')).toBeInTheDocument();
  });

  it('enables Download all only when something is done', () => {
    const { rerender } = render(<ImageCompressorView {...vm({ items: [{ id: 1, file: file('a.png'), status: 'queued', step: '' }] })} />);
    expect(screen.getByRole('button', { name: /download all/i })).toBeDisabled();
    rerender(<ImageCompressorView {...vm({ items: [done(3, 'c.png')] })} />);
    expect(screen.getByRole('button', { name: /download all/i })).toBeEnabled();
    expect(screen.getByText(/Saved 6\.0 KB/)).toBeInTheDocument();
  });
});
