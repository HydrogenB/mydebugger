/**
 * © 2026 MyDebugger Contributors – MIT License
 *
 * The only module allowed to import codec packages. Everything is a dynamic import so each
 * format's WASM is fetched on first use, and so Jest never loads ESM/WASM from node_modules.
 */
import type { Pixels } from './types';

/** A codec module or its WASM failed to load (offline, stale deploy) — as opposed to failing on an image. */
export class CodecLoadError extends Error {}

const asLoadError = (err: unknown): never => {
  throw new CodecLoadError(err instanceof Error ? err.message : String(err));
};

/**
 * ponytail: @jsquash/jpeg and @jsquash/webp fetch their WASM lazily inside the first encode()/decode(),
 * so a WASM 404 there surfaces as a runtime failure ('internal'), not a CodecLoadError. Upgrade path:
 * call their per-module init() here once jsquash exposes an awaitable one.
 */
const guard = <T>(load: () => Promise<T>) => (): Promise<T> => load().catch(asLoadError);

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
      return asLoadError(err);
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
export const loadJpeg = guard(() => import('@jsquash/jpeg'));
export const loadWebp = guard(() => import('@jsquash/webp'));
export const loadUpng = guard(() => import('upng-js'));
export const loadGifenc = guard(() => import('gifenc'));
export const loadGifuct = guard(() => import('gifuct-js'));
export const loadGifsicle = guard(async () => {
  // ponytail: gifsicle-wasm-browser's testType() does `x instanceof Element`, which throws in a Worker
  // (no DOM) and silently hangs run(); a stub class makes that check return false. Drop if the lib fixes it.
  const g = globalThis as { Element?: unknown };
  if (typeof g.Element === 'undefined') g.Element = class {};
  return import('gifsicle-wasm-browser');
});

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
      return asLoadError(err);
    });
  }
  return liq;
};

export const toImageData = (p: Pixels): ImageData =>
  new ImageData(new Uint8ClampedArray(p.data), p.width, p.height);

export const fromImageData = (d: ImageData): Pixels => ({ data: d.data, width: d.width, height: d.height });
