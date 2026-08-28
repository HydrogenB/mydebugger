import '@testing-library/jest-dom';

// Polyfill Blob.arrayBuffer for jsdom (not implemented in beta versions)
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Blob.prototype, 'arrayBuffer', {
    value: async function (this: Blob) {
      return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(this);
      });
    },
    writable: true,
    configurable: true,
  });
}

// Prevent treating setup file as a test by not exporting tests.


