declare module 'gif.js' {
  class GIF {
    constructor(options: {
      workers?: number;
      workerScript?: string;
      quality?: number;
      background?: string;
      width?: number;
      height?: number;
      transparent?: string | null;
      dither?: boolean | string;
      repeat?: number;
    });
    addFrame(image: CanvasImageSource, options?: { copy?: boolean; delay?: number }): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    abort(): void;
  }
  export default GIF;
}
