/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * The only module allowed to import codec packages. Everything is a dynamic import so each
 * format's WASM is fetched on first use, and so Jest never loads ESM/WASM from node_modules.
 */
import type { Pixels } from './types';

export const loadOxipng = () => import('@jsquash/oxipng');
export const loadJpeg = () => import('@jsquash/jpeg');
export const loadWebp = () => import('@jsquash/webp');
export const loadUpng = () => import('upng-js');
export const loadGifenc = () => import('gifenc');
export const loadGifuct = () => import('gifuct-js');
export const loadGifsicle = () => import('gifsicle-wasm-browser');

type Liq = typeof import('libimagequant-wasm/wasm/libimagequant_wasm.js');
let liq: Promise<Liq> | null = null;

/** libimagequant's raw wasm-bindgen API (its high-level class spawns its own worker, which we don't want). */
export const loadImagequant = (): Promise<Liq> => {
  if (!liq) {
    liq = (async () => {
      const [mod, wasm] = await Promise.all([
        import('libimagequant-wasm/wasm/libimagequant_wasm.js'),
        import('libimagequant-wasm/wasm/libimagequant_wasm_bg.wasm?url'),
      ]);
      await mod.default({ module_or_path: wasm.default });
      return mod;
    })().catch((err) => {
      liq = null; // allow a retry after a network hiccup
      throw err;
    });
  }
  return liq;
};

export const toImageData = (p: Pixels): ImageData =>
  new ImageData(new Uint8ClampedArray(p.data), p.width, p.height);

export const fromImageData = (d: ImageData): Pixels => ({ data: d.data, width: d.width, height: d.height });
