/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * The only module allowed to import codec packages. Everything is a dynamic import so each
 * format's WASM is fetched on first use, and so Jest never loads ESM/WASM from node_modules.
 */
import type { Pixels } from './types';

type OxipngCodec = typeof import('@jsquash/oxipng/codec/pkg/squoosh_oxipng.js');
type OxipngOptions = { level: number; optimiseAlpha?: boolean };

let oxipng: Promise<OxipngCodec> | null = null;

/**
 * ponytail: single-threaded oxipng build only. `@jsquash/oxipng`'s default export probes for a
 * multi-threaded (rayon) build, which self-spawns a Worker on itself — Vite 4's worker plugin
 * can't bundle a self-referencing `new URL(import.meta.url)` and hangs the build. The threaded
 * path also needs crossOriginIsolated/SharedArrayBuffer, which our Vercel deploy doesn't grant
 * (no COOP/COEP headers), so it would never actually run multi-threaded anyway.
 * Upgrade path: only worth revisiting if we add COOP/COEP headers AND move off Vite 4.
 */
const loadOxipngCodec = (): Promise<OxipngCodec> => {
  if (!oxipng) {
    oxipng = (async () => {
      const mod = await import('@jsquash/oxipng/codec/pkg/squoosh_oxipng.js');
      await mod.default();
      return mod;
    })().catch((err) => {
      oxipng = null; // allow a retry after a network hiccup
      throw err;
    });
  }
  return oxipng;
};

export const loadOxipng = async () => {
  const mod = await loadOxipngCodec();
  return {
    optimise: async (data: ArrayBuffer | ImageData, options: OxipngOptions): Promise<ArrayBuffer> => {
      const { level, optimiseAlpha = false } = options;
      const out =
        data instanceof ImageData
          ? mod.optimise_raw(data.data, data.width, data.height, level, false, optimiseAlpha)
          : mod.optimise(new Uint8Array(data), level, false, optimiseAlpha);
      // Copy out of wasm memory before returning — the memory backing `out` can be reused/grown
      // by the next call.
      return out.slice().buffer;
    },
  };
};
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
