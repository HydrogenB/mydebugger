/**
 * © 2026 MyDebugger Contributors – MIT License
 */

export interface MuxFrame {
  webp: Uint8Array;
  delayMs: number;
}

const fourcc = (b: Uint8Array, o: number) => String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3]);
const ascii = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));

const concat = (parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  parts.forEach((p) => {
    out.set(p, o);
    o += p.length;
  });
  return out;
};

const u24 = (b: Uint8Array, o: number, value: number) => {
  b[o] = value & 0xff;
  b[o + 1] = (value >> 8) & 0xff;
  b[o + 2] = (value >> 16) & 0xff;
};

const chunk = (id: string, payload: Uint8Array): Uint8Array => {
  const out = new Uint8Array(8 + payload.length + (payload.length & 1));
  out.set(ascii(id), 0);
  new DataView(out.buffer).setUint32(4, payload.length, true);
  out.set(payload, 8);
  return out;
};

/** The ALPH / VP8 / VP8L chunks of a still WebP, i.e. an ANMF frame body. */
export const frameChunks = (webp: Uint8Array): Uint8Array => {
  if (webp.length < 12 || fourcc(webp, 0) !== 'RIFF' || fourcc(webp, 8) !== 'WEBP') {
    throw new Error('Not a WebP file');
  }
  const view = new DataView(webp.buffer, webp.byteOffset, webp.byteLength);
  const parts: Uint8Array[] = [];
  let o = 12;
  while (o + 8 <= webp.length) {
    const id = fourcc(webp, o);
    const size = view.getUint32(o + 4, true);
    const total = 8 + size + (size & 1);
    if (id === 'ALPH' || id === 'VP8 ' || id === 'VP8L') parts.push(webp.subarray(o, o + total));
    o += total;
  }
  return concat(parts);
};

/** Full-canvas frames, no blending, loop forever. */
export const muxAnimatedWebP = (frames: MuxFrame[], width: number, height: number, alpha: boolean): Uint8Array => {
  const vp8x = new Uint8Array(10);
  vp8x[0] = 0x02 | (alpha ? 0x10 : 0);
  u24(vp8x, 4, width - 1);
  u24(vp8x, 7, height - 1);
  const anim = new Uint8Array(6); // transparent background, loop count 0 = forever

  const anmf = frames.map((f) => {
    const body = frameChunks(f.webp);
    const payload = new Uint8Array(16 + body.length);
    u24(payload, 6, width - 1);
    u24(payload, 9, height - 1);
    u24(payload, 12, Math.min(0xffffff, Math.max(0, Math.round(f.delayMs))));
    payload[15] = 0x02; // do not blend; no dispose
    payload.set(body, 16);
    return chunk('ANMF', payload);
  });

  const inner = concat([ascii('WEBP'), chunk('VP8X', vp8x), chunk('ANIM', anim), ...anmf]);
  const out = new Uint8Array(8 + inner.length);
  out.set(ascii('RIFF'), 0);
  new DataView(out.buffer).setUint32(4, inner.length, true);
  out.set(inner, 8);
  return out;
};
