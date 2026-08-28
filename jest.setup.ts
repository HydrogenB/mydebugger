import '@testing-library/jest-dom';

// Polyfill Blob.arrayBuffer for jsdom (not implemented in beta versions)
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  // eslint-disable-next-line no-extend-native
  (Blob.prototype as any).arrayBuffer = async function arrayBuffer() {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

// Prevent treating setup file as a test by not exporting tests.


