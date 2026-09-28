# Image Compressor v2 — auto-optimizing, TinyPNG-style

Date: 2026-09-28 · Route: `/image-compressor` · Status: approved design

## Goal

The user picks only **input image(s)** and **output format** (PNG / JPG / WebP / GIF / BMP).
The system decides everything else: it analyzes the image, builds a candidate set of encodes for
the chosen format, checks each against the original (pixel-identical or SSIM), and returns the
**smallest file that passes**, with a report of what it chose and why.

Everything runs in the browser (Vercel free tier, no server). Metadata (EXIF/GPS) is always
stripped; the image is never resized.

## Non-goals

- Resizing, manual quality sliders, target-KB (current controls are removed).
- Butteraugli / LPIPS (no practical browser build) — SSIM only.
- jpegli, zopflipng, ect, pngcrush, optipng, jpegtran (no maintained browser WASM).
- Parallel worker pool (single worker; revisit only if measured too slow).

## Architecture

One Web Worker runs the whole pipeline; each format's WASM codec is lazy-loaded on first use.

```
src/tools/image-compressor/
  page.tsx                     drop zone, format picker, queue rows, Download all
  hooks/useImageCompressor.ts  worker lifecycle, queue state, progress, results
  workers/compress.worker.ts   runs pipeline per job, posts progress/result
  lib/
    decode.ts     File -> { frames: {data: ImageData, delayMs}[], width, height, sourceMime }
    analyze.ts    -> { hasAlpha, animated, colorCount, flatRatio, cls: photo|ui|flat }
    ssim.ts       luma SSIM (8x8 windows) + alpha SSIM; per-frame min for animations
    select.ts     pure: build candidate families, run with injected encoders, pick winner
    encoders/
      png.ts      oxipng lossless; imagequant -> oxipng; APNG via upng-js
      jpeg.ts     mozjpeg
      webp.ts     lossless / near-lossless / lossy; animated WebP RIFF muxer
      gif.ts      gifenc (+ imagequant palette) -> gifsicle
      bmp.ts      hand-written: 24/32-bit, 8-bit, RLE8, RLE4
```

New dependencies (all lazy-loaded): `@jsquash/oxipng`, `@jsquash/jpeg`, `@jsquash/webp`,
libimagequant WASM, `gifsicle-wasm-browser`, `upng-js`, `gifuct-js`, `gifenc`, `fflate`.

### Decode

- Static: `createImageBitmap` -> OffscreenCanvas -> ImageData (sRGB).
- Animated GIF: `gifuct-js` (all browsers), frames composited per disposal method.
- Animated WebP/APNG: `ImageDecoder` (WebCodecs). If unavailable (Safari): first frame + warning.

### Analyze (on a copy downscaled to <= 512 px)

- `hasAlpha`: any pixel alpha < 255. `animated`: frames > 1.
- `colorCount`: exact unique RGBA count, capped at 4096.
- `flatRatio`: fraction of pixels identical to their right neighbour.
- Class: `flat` if colorCount <= 256; else `ui` if flatRatio >= 0.5; else `photo`.

### Pass checks

- **Lossless candidate:** pixel-identical RGBA; pixels with alpha 0 compare alpha only.
- **Lossy candidate:** luma SSIM of both images composited over white >= threshold, and if
  `hasAlpha`, alpha-channel SSIM >= 0.99.
- Thresholds: `photo` 0.99; `ui` / `flat` 0.995.
- Animated: the minimum per-frame SSIM must pass.

### Selection rule

1. Candidates are grouped into families (a lossless family, and lossy ladders).
2. Within a ladder, try the **most aggressive setting first**; the first passing setting is that
   family's result (assumes size is monotonic in quality).
3. Winner = smallest passing result across families.
4. If output format == input format and the winner is not smaller than the original file,
   return the original bytes, marked "already optimal".
5. If nothing passes: return the highest-SSIM candidate, marked "below quality target".

### Candidate ladders

| Output | Lossless family | Lossy ladder (most aggressive first) | Notes |
|---|---|---|---|
| PNG | oxipng level 4 | imagequant 64 -> 128 -> 256 colours, then oxipng | Animated -> APNG (upng): cnum 0 (lossless), then 256 |
| JPG | — | mozjpeg q 85 -> 88 -> 90 -> 92 -> 95 | Alpha flattened on white + warning; `ui`/`flat` warns "JPEG not ideal"; animated -> first frame + warning |
| WebP | lossless (method 4); skipped for `photo` | `ui`/`flat`/alpha: near-lossless 60 -> 80. `photo`: lossy q 75 -> 80 -> 85 -> 90 -> 95 | Animated: one setting for all frames, muxed to RIFF `ANIM`/`ANMF` |
| GIF | GIF input: gifsicle `-O3` on original bytes. Else if <= 256 colours: exact palette via gifenc -> `-O3` | gifsicle `--lossy` 80 -> 40 -> 20 | > 256 colours: imagequant 256 + dither; warn "GIF is limited to 256 colours" |
| BMP | 24-bit (32-bit BI_BITFIELDS if alpha); <= 256 colours: 8-bit + RLE8; <= 16 colours: RLE4 | — | Animated -> first frame + warning |

## UI (TinyPNG-style)

- Format picker: segmented `radiogroup` PNG / JPG / WebP / GIF / BMP, remembered in localStorage.
- Large full-width dashed drop zone (click, drag-and-drop, Ctrl+V paste); `<button>` + hidden
  `<input type="file" multiple>`.
- Compression starts on drop — no Compress button. Files are processed sequentially.
- One row per file: name, original size, progress bar + live step text ("mozjpeg q88…"),
  output size, % saved, download button. Expand a row for: chosen pipeline, mode
  (lossless / visually lossless / below target / already optimal), SSIM, warnings, and a
  before/after slider comparison.
- Changing the format re-runs all files in the list.
- Footer: total saved + "Download all (.zip)" via fflate, lazy-loaded on click; filenames keep
  their stem with the new extension.
- Limits: max 20 files, 50 MB per file; over-limit files get an error row.
- Row progress is `aria-live`; design-system tokens; dark mode supported.

Report example (expanded row):

```
banner.png  1.02 MB -> 412 KB  (-59.6%)
Pipeline: imagequant 128c -> oxipng    Mode: visually lossless    SSIM: 0.9971
```

## Error handling

- Errors are per file; a failed file shows a red row and the queue continues.
- Decode failure -> "Can't read this image in your browser".
- Codec WASM fails to load -> that format's button disabled with tooltip.
- Single encoder throws or exceeds 30 s -> candidate skipped, logged in row details; worker is
  terminated and recreated if it wedges.
- Memory guard: refuse > 40 MP static, or width x height x frames > 400 MP animated.
- Every job has an id; results for stale ids (file removed / format changed) are ignored.

## Testing

Jest/jsdom cannot run the WASM codecs, so logic is kept in pure, injectable units:

- `analyze.ts`: synthetic ImageData -> photo / ui / flat, alpha, colour-count cap.
- `ssim.ts`: identical -> 1.0; increasing noise -> monotonically lower; alpha handled.
- `select.ts` (fake encoders): aggressive-first early exit, smallest-across-families,
  return-original rule, below-target fallback, a throwing encoder doesn't break others.
- `bmp.ts`: header bytes; RLE8 round-trip via a tiny test decoder.
- WebP muxer: RIFF / ANIM / ANMF chunk layout and sizes.
- UI (RTL, worker mocked): drop 2 files -> 2 rows; format radiogroup; error row; Download all
  enabled when done.
- Manual real-codec smoke test in the browser on 5 samples (photo, screenshot, alpha icon,
  animated GIF, flat illustration); sizes + SSIM recorded in the PR.

## Removals

Current scale / colour-depth / target-KB controls and the legacy `compressImage` /
`resizeImage` / `compressImageV2` exports (only used by `__tests__/tools.image-compressor.test.tsx`,
which is rewritten).
