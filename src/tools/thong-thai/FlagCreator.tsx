/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../design-system/components/layout';
import { useTranslation } from '../../context/TranslationContext';
import ControlPanel, { LabelMap, Option } from './ControlPanel';
import FlagPreview from './FlagPreview';

// Thai flag default colors
const THAI_RED = '#A51931';
const THAI_WHITE = '#FFFFFF';
const THAI_BLUE = '#2D2A4A';

// Stripe ratios for Thai flag: 1:1:2:1:1 (top to bottom)
const THAI_STRIPE_RATIOS = [1, 1, 2, 1, 1];

const colorOptions: Option[] = [
  { value: THAI_RED, label: 'Red' },
  { value: THAI_WHITE, label: 'White' },
  { value: THAI_BLUE, label: 'Blue' },
  // Extras for customization
  { value: '#FF0000', label: 'Bright Red' },
  { value: '#0000FF', label: 'Bright Blue' },
  { value: '#000000', label: 'Black' },
  { value: '#FFD700', label: 'Gold' },
];

const numberFromInput = (v: string, fallback: number, min?: number, max?: number) => {
  const n = Number(v);
  if (Number.isNaN(n)) return fallback;
  if (typeof min === 'number' && n < min) return min;
  if (typeof max === 'number' && n > max) return max;
  return n;
};

const useAnimationFrame = (callback: (time: number) => void, isRunning: boolean) => {
  const reqRef = useRef<number | null>(null);

  const animate = useCallback((time: number) => {
    callback(time);
    if (isRunning) {
      reqRef.current = requestAnimationFrame(animate);
    }
  }, [callback, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    reqRef.current = requestAnimationFrame(animate);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [animate, isRunning]);
};

const FlagCreator: React.FC = () => {
  const { t } = useTranslation();

  // Canvas and rendering state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, setWidth] = useState<number>(640);
  const [height, setHeight] = useState<number>(400);
  const [colors, setColors] = useState<string[]>([
    THAI_RED,
    THAI_WHITE,
    THAI_BLUE,
    THAI_WHITE,
    THAI_RED,
  ]);
  const [amplitude, setAmplitude] = useState<number>(10); // px
  const [wavelength, setWavelength] = useState<number>(200); // px
  const [speed, setSpeed] = useState<number>(0.0025); // radians per ms
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [pixelRatio, setPixelRatio] = useState<number>(1);

  // WebM recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(5); // seconds
  const [recordFps, setRecordFps] = useState<number>(30);
  const [recordUrl, setRecordUrl] = useState<string | null>(null);

  // Derived
  const stripeHeights = useMemo(() => {
    const sum = THAI_STRIPE_RATIOS.reduce((a, b) => a + b, 0);
    const unit = height / sum;
    let y = 0;
    return THAI_STRIPE_RATIOS.map((ratio) => {
      const h = unit * ratio;
      const start = y;
      y += h;
      return { start, end: start + h };
    });
  }, [height]);

  const drawFrame = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = pixelRatio || 1;
    // Ensure canvas backing store size matches desired resolution
    const targetW = Math.floor(width * dpr);
    const targetH = Math.floor(height * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    // Clear
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Waving parameters
    const A = amplitude * dpr;
    const k = (Math.PI * 2) / Math.max(1, wavelength * dpr);
    const phase = time * speed;

    // Draw per vertical column for smooth waving stripes
    const columnWidth = Math.max(1, Math.floor(dpr));
    for (let x = 0; x < canvas.width; x += columnWidth) {
      const delta = A * Math.sin(k * x + phase);
      // Draw stripes top to bottom
      for (let i = 0; i < stripeHeights.length; i++) {
        const seg = stripeHeights[i];
        const start = Math.floor(seg.start * dpr + delta);
        const end = Math.floor(seg.end * dpr + delta);
        const h = end - start;
        if (h <= 0) continue;
        ctx.fillStyle = colors[i] || '#000000';
        ctx.fillRect(x, start, columnWidth, h);
      }
    }
  }, [amplitude, bgColor, colors, height, pixelRatio, speed, stripeHeights, wavelength, width]);

  useAnimationFrame(drawFrame, isAnimating || isRecording);

  const handlePngExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thong-thai.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }, []);

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      const stream = canvas.captureStream(recordFps);
      recordedChunksRef.current = [];
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
      let mimeType = '';
      for (const mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) { mimeType = mt; break; }
      }
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);

      // Auto stop after duration
      window.setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }, Math.max(1, recordDuration) * 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  }, [isRecording, recordDuration, recordFps]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // UI labels via translations (with sensible fallbacks)
  const labels: LabelMap = {
    title: t('thongThai.title', 'Thong Thai Flag Creator'),
    description: t('thongThai.description', 'Create, animate, and export the Thai national flag.'),
    size: t('thongThai.size', 'Size'),
    width: t('thongThai.width', 'Width'),
    height: t('thongThai.height', 'Height'),
    wave: t('thongThai.wave', 'Wave'),
    amplitude: t('thongThai.amplitude', 'Amplitude'),
    wavelength: t('thongThai.wavelength', 'Wavelength'),
    speed: t('thongThai.speed', 'Speed'),
    bg: t('thongThai.bg', 'Background'),
    colorsLabel: t('thongThai.colors', 'Colors'),
    stripeTop: t('thongThai.stripeTop', 'Top'),
    stripeUpper: t('thongThai.stripeUpper', 'Upper'),
    stripeCenter: t('thongThai.stripeCenter', 'Center'),
    stripeLower: t('thongThai.stripeLower', 'Lower'),
    stripeBottom: t('thongThai.stripeBottom', 'Bottom'),
    preview: t('thongThai.preview', 'Preview'),
    animate: t('thongThai.animate', 'Animate'),
    pause: t('thongThai.pause', 'Pause'),
    exportSection: t('thongThai.export', 'Export'),
    exportPng: t('thongThai.exportPng', 'Export PNG'),
    exportWebm: t('thongThai.exportWebm', 'Record WebM'),
    stop: t('thongThai.stop', 'Stop'),
    download: t('thongThai.download', 'Download'),
    seconds: t('thongThai.seconds', 'seconds'),
    fps: t('thongThai.fps', 'FPS'),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ControlPanel
        labels={labels}
        width={width}
        height={height}
        bgColor={bgColor}
        pixelRatio={pixelRatio}
        onWidthChange={(v) => setWidth(numberFromInput(v, width, 64, 4096))}
        onHeightChange={(v) => setHeight(numberFromInput(v, height, 64, 4096))}
        onBgChange={(v) => setBgColor(v)}
        onPixelRatioChange={(v) => setPixelRatio(numberFromInput(v, pixelRatio, 1, 4))}
        amplitude={amplitude}
        wavelength={wavelength}
        speed={speed}
        isAnimating={isAnimating}
        onAmplitudeChange={(v) => setAmplitude(numberFromInput(v, amplitude, 0, 200))}
        onWavelengthChange={(v) => setWavelength(numberFromInput(v, wavelength, 10, 2000))}
        onSpeedChange={(v) => setSpeed(numberFromInput(v, speed, 0, 0.05))}
        onToggleAnimate={() => setIsAnimating((s) => !s)}
        colors={colors}
        colorOptions={colorOptions}
        onUpdateColor={(index, value) => setColors((prev) => prev.map((c, i) => (i === index ? value : c)))}
        onPngExport={handlePngExport}
        isRecording={isRecording}
        recordDuration={recordDuration}
        recordFps={recordFps}
        onRecordDurationChange={(v) => setRecordDuration(numberFromInput(v, recordDuration, 1, 30))}
        onRecordFpsChange={(v) => setRecordFps(numberFromInput(v, recordFps, 10, 60))}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
      />

      <div className="lg:col-span-2">
        <Card title={labels.preview} isElevated>
          <FlagPreview canvasRef={canvasRef} />
          {recordUrl && (
            <div className="mt-3 flex gap-2">
              <a className="text-primary-600 dark:text-primary-400 underline" href={recordUrl} download="thong-thai.webm">{labels.download}</a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FlagCreator;
