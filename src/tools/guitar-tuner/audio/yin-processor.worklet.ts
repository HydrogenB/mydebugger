/**
 * © 2025 MyDebugger Contributors – MIT License
 */

// AudioWorklet global types are available from lib.dom.d.ts
// Provide ambient declarations to satisfy TypeScript when compiling in app context.
/// <reference lib="dom" />
declare const sampleRate: number;
declare function registerProcessor(name: string, processorCtor: any): void;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  constructor(options?: any);
}

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;

function freqToNoteData(f: number, a4 = 440) {
  const midi = 69 + 12 * Math.log2(f / a4);
  const nearest = Math.round(midi);
  const cents = (midi - nearest) * 100;
  const name = NOTE_NAMES[((nearest % 12) + 12) % 12];
  const octave = Math.floor(nearest / 12) - 1;
  return { note: `${name}${octave}`, cents };
}

// Simple first-order high-pass IIR
class HPF1 {
  private a0: number; private a1: number; private b1: number;
  private x1 = 0; private y1 = 0;
  constructor(sr: number, fc = 70) {
    const w = Math.tan(Math.PI * fc / sr);
    const k = 1 / (1 + w);
    this.a0 = k;
    this.a1 = -k;
    this.b1 = (1 - w) * k;
  }
  proc(x: number) {
    const y = this.a0 * x + this.a1 * this.x1 - this.b1 * this.y1;
    this.x1 = x; this.y1 = y; return y;
  }
}

// Simple biquad notch (IIR) at f0 with Q
class Notch2 {
  private a0: number; private a1: number; private a2: number;
  private b1: number; private b2: number;
  private x1 = 0; private x2 = 0; private y1 = 0; private y2 = 0;
  constructor(sr: number, f0 = 50, Q = 12) {
    const w0 = 2 * Math.PI * f0 / sr;
    const cos = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * Q);
    const b0 = 1;
    const b1 = -2 * cos;
    const b2 = 1;
    const a0 = 1 + alpha;
    const a1 = -2 * cos;
    const a2 = 1 - alpha;
    // Normalize
    this.a0 = b0 / a0; this.a1 = b1 / a0; this.a2 = b2 / a0;
    this.b1 = a1 / a0; this.b2 = a2 / a0;
  }
  proc(x: number) {
    const y = this.a0*x + this.a1*this.x1 + this.a2*this.x2 - this.b1*this.y1 - this.b2*this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
}

function yinDetect(buf: Float32Array, sr: number, threshold = 0.15) {
  const N = buf.length;
  const maxTau = Math.min(Math.floor(sr / 70), N - 1); // up to ~70 Hz fundamental
  const diff = new Float32Array(maxTau + 1);

  // Difference function d(tau)
  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0;
    for (let i = 0; i < N - tau; i++) {
      const d = buf[i] - buf[i + tau];
      sum += d * d;
    }
    diff[tau] = sum;
  }

  // Cumulative mean normalized difference d'(tau)
  let running = 0;
  let bestTau = -1;
  let bestVal = 1;
  for (let tau = 1; tau <= maxTau; tau++) {
    running += diff[tau];
    const cmnd = diff[tau] * tau / (running || 1);
    const val = 1 - (cmnd || 0);
    if (val > threshold) {
      // Local minima search around tau
      if (val < bestVal) {
        bestVal = val; bestTau = tau;
      }
      if (bestTau !== -1 && tau - bestTau > 2) break; // early exit past min neighborhood
    }
    if (val < bestVal) { bestVal = val; bestTau = tau; }
  }
  if (bestTau <= 0) return { f0: 0, confidence: 0 };

  // Parabolic interpolation for sub-sample accuracy
  const tau = bestTau;
  const d0 = tau > 1 ? diff[tau - 1] : diff[tau];
  const d1 = diff[tau];
  const d2 = tau < maxTau ? diff[tau + 1] : diff[tau];
  const denom = (d0 - 2*d1 + d2);
  const shift = denom !== 0 ? 0.5 * (d0 - d2) / denom : 0;
  const tauInterp = Math.max(1, tau + shift);

  const f0 = sr / tauInterp;
  const confidence = Math.max(0, Math.min(1, 1 - (diff[tau] / (running / tau))));
  return { f0, confidence };
}

function toNotePayload(f0: number, conf: number, a4 = 440) {
  if (!isFinite(f0) || f0 <= 0) return null;
  const { note, cents } = freqToNoteData(f0, a4);
  return { freqHz: f0, note, cents, confidence: conf };
}

class YinProcessor extends AudioWorkletProcessor {
  private down = 3;
  private targetSR = 16000;
  private buf = new Float32Array(4096);
  private write = 0;
  private confEMA = 0;
  private hpf: HPF1;
  private notch50: Notch2;
  private notch60: Notch2;
  private a4 = 440;

  constructor(options: any) {
    super();
    const sr = sampleRate; // input SR
    const opts = options?.processorOptions || {};
    this.targetSR = Math.max(8000, Math.min(24000, opts.targetSR || 16000));
    this.down = Math.max(1, Math.round(sr / this.targetSR));

    this.hpf = new HPF1(sr, opts.highpassHz || 70);
    const dsr = sr / this.down;
    this.notch50 = new Notch2(dsr, opts.notchHz || 50, 20);
    this.notch60 = new Notch2(dsr, 60, 20);

    // Listen for control messages (e.g., calibration changes)
    this.port.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as any;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'calibration' && typeof msg.a4 === 'number') {
        const v = msg.a4;
        if (v >= 415 && v <= 466) this.a4 = v;
      }
    };
  }

  process(inputs: Float32Array[][]) {
    const ch = inputs[0]?.[0];
    if (!ch) return true;

    // Downsample with simple decimation and pre-filter HPF
    for (let i = 0; i < ch.length; i += this.down) {
      if (this.write >= this.buf.length) this.write = 0;
      const x = this.hpf.proc(ch[i]);
      // Apply notches in downsampled domain
      const y = this.notch60.proc(this.notch50.proc(x));
      this.buf[this.write++] = y;
    }

    // Run YIN when enough samples
    if (this.write > 2048) {
      const dsr = sampleRate / this.down;
      const { f0, confidence } = yinDetect(this.buf, dsr, 0.15);
      this.confEMA = 0.8 * this.confEMA + 0.2 * confidence;
      const msg = toNotePayload(f0, this.confEMA, this.a4);
      if (msg) this.port.postMessage(msg);
      this.write = 0; // reset for fresh frame
    }
    return true;
  }
}

registerProcessor('yin-processor', YinProcessor);
