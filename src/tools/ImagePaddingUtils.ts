/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export function expandImageWithJunk(blob: Blob, targetSizeMB: number): Blob {
  const currentSize = blob.size;
  const targetBytes = targetSizeMB * 1024 * 1024;
  if (targetBytes <= currentSize) {
    return blob;
  }
  const paddingSize = targetBytes - currentSize;
  const junk = new Uint8Array(paddingSize).fill(65); // ASCII 'A'
  return new Blob([blob, junk], { type: blob.type });
}
