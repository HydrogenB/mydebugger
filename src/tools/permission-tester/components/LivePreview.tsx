/**
 * © 2025 MyDebugger Contributors – MIT License
 * Live preview components for each permission type.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../../design-system/components/inputs';

// ---------------------------------------------------------------------------
// CameraPreview
// ---------------------------------------------------------------------------
function CameraPreview({ data }: { data: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = data;
    el.play().catch(() => {});
    const track = data.getVideoTracks()[0];
    if (track) {
      const s = track.getSettings();
      setInfo(`${s.width ?? '?'}×${s.height ?? '?'} @ ${s.frameRate ?? '?'} fps`);
    }
    return () => {
      el.srcObject = null;
    };
  }, [data]);

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full rounded-lg bg-black max-h-48 object-contain"
      />
      {info && <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{info}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MicMeter
// ---------------------------------------------------------------------------
function MicMeter({ data }: { data: MediaStream }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(data);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(buf);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const c = canvas.getContext('2d');
      if (!c) return;
      c.clearRect(0, 0, canvas.width, canvas.height);
      const barW = canvas.width / buf.length;
      buf.forEach((val, i) => {
        const h = (val / 255) * canvas.height;
        c.fillStyle = `hsl(${200 + i * 2}, 80%, 55%)`;
        c.fillRect(i * barW, canvas.height - h, barW - 1, h);
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      ctx.close();
    };
  }, [data]);

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Microphone Level</p>
      <canvas ref={canvasRef} width={280} height={60} className="w-full rounded bg-gray-900" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// GeoPanel
// ---------------------------------------------------------------------------
function GeoPanel({ data }: { data: GeolocationPosition }) {
  const [pos, setPos] = useState(data);
  const refresh = () => {
    navigator.geolocation.getCurrentPosition(p => setPos(p), () => {}, { enableHighAccuracy: true });
  };
  const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;

  return (
    <div className="space-y-2">
      <table className="text-xs w-full">
        <tbody>
          {[
            ['Latitude', latitude.toFixed(6)],
            ['Longitude', longitude.toFixed(6)],
            ['Accuracy', `${accuracy?.toFixed(0)} m`],
            altitude != null ? ['Altitude', `${altitude.toFixed(1)} m`] : null,
            speed != null ? ['Speed', `${speed.toFixed(1)} m/s`] : null,
            heading != null ? ['Heading', `${heading.toFixed(0)}°`] : null,
          ]
            .filter((row): row is string[] => row !== null)
            .map(([label, value]) => (
              <tr key={label as string} className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{label}</td>
                <td className="py-1 font-mono text-gray-900 dark:text-white">{value}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="flex gap-2 flex-wrap">
        <Button size="xs" variant="secondary" onClick={refresh}>Refresh</Button>
        <Button size="xs" variant="ghost" href={osmUrl} target="_blank" rel="noopener noreferrer">
          View on Map ↗
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SensorTable (accel / gyro / magneto)
// ---------------------------------------------------------------------------
function SensorTable({ data }: { data: { x: number; y: number; z: number; sensor: any } }) {
  const [vals, setVals] = useState({ x: data.x, y: data.y, z: data.z });
  useEffect(() => {
    const s = data.sensor;
    if (!s) return;
    const handler = () => setVals({ x: s.x, y: s.y, z: s.z });
    s.addEventListener('reading', handler);
    return () => s.removeEventListener('reading', handler);
  }, [data.sensor]);

  return (
    <table className="text-xs w-full">
      <tbody>
        {(['x', 'y', 'z'] as const).map(axis => (
          <tr key={axis} className="border-b border-gray-100 dark:border-gray-700">
            <td className="py-1 pr-3 text-gray-500 dark:text-gray-400 uppercase">{axis}</td>
            <td className="py-1 font-mono text-gray-900 dark:text-white">
              {(vals[axis] ?? 0).toFixed(4)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// LightSpark
// ---------------------------------------------------------------------------
function LightSpark({ data }: { data: { illuminance: number; sensor: any } }) {
  const [lux, setLux] = useState(data.illuminance);
  useEffect(() => {
    const s = data.sensor;
    if (!s) return;
    const handler = () => setLux(s.illuminance);
    s.addEventListener('reading', handler);
    return () => s.removeEventListener('reading', handler);
  }, [data.sensor]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl">💡</span>
      <div>
        <p className="text-2xl font-bold text-yellow-500">{lux?.toFixed(1) ?? '—'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">lux</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ComputePressurePanel
// ---------------------------------------------------------------------------
function ComputePressurePanel({ data }: { data: { state: string; time: number; observer: any } }) {
  const [state, setState] = useState(data.state);
  const [count, setCount] = useState(1);
  useEffect(() => {
    const obs = data.observer;
    if (!obs) return;
    // We can't re-observe easily; just show current state
  }, [data]);

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 dark:text-gray-400">CPU pressure state</p>
      <p className={`text-lg font-bold capitalize ${state === 'nominal' ? 'text-green-500' : state === 'fair' ? 'text-yellow-500' : 'text-red-500'}`}>
        {state}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">Samples: {count}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// IdlePanel
// ---------------------------------------------------------------------------
function IdlePanel({ data }: { data: { userState: string; screenState: string; detector: any } }) {
  const [userState, setUserState] = useState(data.userState);
  const [screenState, setScreenState] = useState(data.screenState);
  useEffect(() => {
    const det = data.detector;
    if (!det) return;
    const handler = () => {
      setUserState(det.userState);
      setScreenState(det.screenState);
    };
    det.addEventListener('change', handler);
    return () => det.removeEventListener('change', handler);
  }, [data.detector]);

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="rounded bg-gray-100 dark:bg-gray-700 p-2 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-1">User</p>
        <p className={`font-bold capitalize ${userState === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>{userState ?? '—'}</p>
      </div>
      <div className="rounded bg-gray-100 dark:bg-gray-700 p-2 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-1">Screen</p>
        <p className={`font-bold capitalize ${screenState === 'unlocked' ? 'text-green-500' : 'text-red-500'}`}>{screenState ?? '—'}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ClipboardPanel
// ---------------------------------------------------------------------------
function ClipboardPanel({ data }: { data: { text?: string; written?: string } }) {
  const [readText, setReadText] = useState(data.text ?? '');
  const [writeStatus, setWriteStatus] = useState('');

  const handleRead = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setReadText(t.slice(0, 200));
    } catch {
      setReadText('Read failed');
    }
  };

  const handleWrite = async () => {
    try {
      await navigator.clipboard.writeText('MyDebugger clipboard test ✓');
      setWriteStatus('Written!');
      setTimeout(() => setWriteStatus(''), 2000);
    } catch {
      setWriteStatus('Write failed');
    }
  };

  return (
    <div className="space-y-2">
      {readText && (
        <p className="text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded p-2 break-all">{readText}</p>
      )}
      <div className="flex gap-2">
        <Button size="xs" variant="secondary" onClick={handleRead}>Read Clipboard</Button>
        <Button size="xs" variant="secondary" onClick={handleWrite}>Write Test</Button>
      </div>
      {writeStatus && <p className="text-xs text-green-600 dark:text-green-400">{writeStatus}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NotificationPanel
// ---------------------------------------------------------------------------
function NotificationPanel({ data: _ }: { data: unknown }) {
  const [title, setTitle] = useState('MyDebugger');
  const [body, setBody] = useState('This is a test notification.');
  const [status, setStatus] = useState('');

  const send = () => {
    if (Notification.permission !== 'granted') { setStatus('Permission not granted'); return; }
    new Notification(title, { body });
    setStatus('Sent!');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div className="space-y-2">
      <input
        className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 dark:text-white"
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Body"
      />
      <div className="flex items-center gap-2">
        <Button size="xs" variant="primary" onClick={send}>Send Test</Button>
        {status && <span className="text-xs text-green-600 dark:text-green-400">{status}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BluetoothPanel
// ---------------------------------------------------------------------------
function BluetoothPanel({ data }: { data: { name?: string; id?: string; connected?: boolean } }) {
  return (
    <table className="text-xs w-full">
      <tbody>
        {[['Name', data.name || '(unnamed)'], ['ID', data.id], ['Connected', data.connected ? 'Yes' : 'No']]
          .map(([k, v]) => (
            <tr key={k as string} className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{k}</td>
              <td className="py-1 font-mono text-gray-900 dark:text-white">{v as string}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// USBPanel
// ---------------------------------------------------------------------------
function USBPanel({ data }: { data: { productName?: string; manufacturerName?: string; serialNumber?: string; vendorId?: number; productId?: number } }) {
  return (
    <table className="text-xs w-full">
      <tbody>
        {[
          ['Product', data.productName],
          ['Manufacturer', data.manufacturerName],
          ['Serial', data.serialNumber],
          ['Vendor ID', data.vendorId ? `0x${data.vendorId.toString(16)}` : undefined],
          ['Product ID', data.productId ? `0x${data.productId.toString(16)}` : undefined],
        ]
          .filter(([, v]) => v != null)
          .map(([k, v]) => (
            <tr key={k as string} className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{k}</td>
              <td className="py-1 font-mono text-gray-900 dark:text-white">{String(v)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// SerialPanel
// ---------------------------------------------------------------------------
function SerialPanel({ data }: { data: { usbVendorId?: number; usbProductId?: number } }) {
  return (
    <table className="text-xs w-full">
      <tbody>
        {[
          ['USB Vendor ID', data.usbVendorId != null ? `0x${data.usbVendorId.toString(16)}` : 'N/A'],
          ['USB Product ID', data.usbProductId != null ? `0x${data.usbProductId.toString(16)}` : 'N/A'],
        ].map(([k, v]) => (
          <tr key={k as string} className="border-b border-gray-100 dark:border-gray-700">
            <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{k}</td>
            <td className="py-1 font-mono text-gray-900 dark:text-white">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// HIDPanel
// ---------------------------------------------------------------------------
function HIDPanel({ data }: { data: { productName?: string; vendorId?: number; productId?: number } }) {
  return (
    <table className="text-xs w-full">
      <tbody>
        {[
          ['Product', data.productName],
          ['Vendor ID', data.vendorId != null ? `0x${data.vendorId.toString(16)}` : undefined],
          ['Product ID', data.productId != null ? `0x${data.productId.toString(16)}` : undefined],
        ]
          .filter(([, v]) => v != null)
          .map(([k, v]) => (
            <tr key={k as string} className="border-b border-gray-100 dark:border-gray-700">
              <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{k}</td>
              <td className="py-1 font-mono text-gray-900 dark:text-white">{String(v)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// MIDIPanel
// ---------------------------------------------------------------------------
function MIDIPanel({ data }: { data: { inputs: string[]; outputs: string[] } }) {
  return (
    <div className="space-y-2 text-xs">
      <div>
        <p className="font-medium text-gray-600 dark:text-gray-400 mb-1">Inputs ({data.inputs.length})</p>
        {data.inputs.length === 0
          ? <p className="text-gray-400">None</p>
          : data.inputs.map((name, i) => <p key={i} className="font-mono">{name}</p>)}
      </div>
      <div>
        <p className="font-medium text-gray-600 dark:text-gray-400 mb-1">Outputs ({data.outputs.length})</p>
        {data.outputs.length === 0
          ? <p className="text-gray-400">None</p>
          : data.outputs.map((name, i) => <p key={i} className="font-mono">{name}</p>)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NFCPanel
// ---------------------------------------------------------------------------
function NFCPanel({ data }: { data: { reader: any; records: any[] } }) {
  const [records, setRecords] = useState<any[]>(data.records ?? []);
  useEffect(() => {
    const r = data.reader;
    if (!r) return;
    const handler = (e: any) => {
      setRecords(prev => [...prev, ...e.message.records].slice(-5));
    };
    r.addEventListener('reading', handler);
    return () => r.removeEventListener('reading', handler);
  }, [data.reader]);

  return (
    <div className="text-xs space-y-1">
      <p className="text-gray-500 dark:text-gray-400">Scanning for NFC tags… (last 5 records)</p>
      {records.length === 0
        ? <p className="italic text-gray-400">No records yet</p>
        : records.map((r, i) => (
          <div key={i} className="font-mono bg-gray-100 dark:bg-gray-700 rounded p-1">
            {r.recordType}: {r.data ? String(r.data) : '(binary)'}
          </div>
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SpeakerPanel
// ---------------------------------------------------------------------------
function SpeakerPanel({ data }: { data: Array<{ label: string; deviceId: string; groupId: string }> }) {
  return (
    <div className="text-xs space-y-1">
      <p className="font-medium text-gray-600 dark:text-gray-400">{data.length} audio output device(s)</p>
      {data.map((d, i) => (
        <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded p-2">
          <p className="font-medium">{d.label || `Device ${i + 1}`}</p>
          <p className="text-gray-500 dark:text-gray-400 truncate">{d.deviceId}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WakeLockPanel
// ---------------------------------------------------------------------------
function WakeLockPanel({ data }: { data: { type: string; released: boolean; sentinel: any } }) {
  const [released, setReleased] = useState(data.released);
  const release = async () => {
    if (data.sentinel && !data.sentinel.released) {
      await data.sentinel.release();
      setReleased(true);
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">Type: {data.type}</p>
      <p className={`text-sm font-medium ${released ? 'text-red-500' : 'text-green-500'}`}>
        {released ? 'Released' : 'Active — screen will not sleep'}
      </p>
      {!released && <Button size="xs" variant="danger" onClick={release}>Release Wake Lock</Button>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StoragePanel
// ---------------------------------------------------------------------------
function StoragePanel({ data }: { data: { persisted: boolean; quota?: number; usage?: number } }) {
  const fmt = (b?: number) => b != null ? `${(b / 1024 / 1024).toFixed(2)} MB` : 'N/A';
  return (
    <table className="text-xs w-full">
      <tbody>
        {[
          ['Persisted', data.persisted ? 'Yes' : 'No'],
          ['Quota', fmt(data.quota)],
          ['Usage', fmt(data.usage)],
        ].map(([k, v]) => (
          <tr key={k as string} className="border-b border-gray-100 dark:border-gray-700">
            <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{k}</td>
            <td className="py-1 font-mono text-gray-900 dark:text-white">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// FontsPanel
// ---------------------------------------------------------------------------
function FontsPanel({ data }: { data: { count: number; sample: string[] } }) {
  return (
    <div className="text-xs space-y-1">
      <p className="text-gray-500 dark:text-gray-400">{data.count} fonts installed</p>
      <p className="font-medium text-gray-700 dark:text-gray-300">Sample:</p>
      {data.sample.map((f, i) => <p key={i} className="font-mono">{f}</p>)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WindowManagementPanel
// ---------------------------------------------------------------------------
function WindowManagementPanel({ data }: { data: { screens: number; currentScreen: string } }) {
  return (
    <table className="text-xs w-full">
      <tbody>
        {[['Screens', String(data.screens)], ['Current', data.currentScreen]].map(([k, v]) => (
          <tr key={k} className="border-b border-gray-100 dark:border-gray-700">
            <td className="py-1 pr-3 text-gray-500 dark:text-gray-400">{k}</td>
            <td className="py-1 font-mono text-gray-900 dark:text-white">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Generic JSON fallback
// ---------------------------------------------------------------------------
function GenericPanel({ data }: { data: unknown }) {
  const d = data as Record<string, unknown>;
  const displayData = { ...d };
  // Remove non-serializable sensor/reader/observer refs
  delete displayData.sensor;
  delete displayData.reader;
  delete displayData.observer;
  delete displayData.detector;
  delete displayData.sentinel;
  return (
    <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded p-2 overflow-auto max-h-40">
      {JSON.stringify(displayData, null, 2)}
    </pre>
  );
}

// ---------------------------------------------------------------------------
// LivePreview (exported)
// ---------------------------------------------------------------------------
export interface LivePreviewProps {
  id: string;
  data: unknown;
}

export function LivePreview({ id, data }: LivePreviewProps) {
  if (!data) return null;

  switch (id) {
    case 'camera':
    case 'display-capture':
      return <CameraPreview data={data as MediaStream} />;
    case 'microphone':
      return <MicMeter data={data as MediaStream} />;
    case 'geolocation':
      return <GeoPanel data={data as GeolocationPosition} />;
    case 'accelerometer':
    case 'gyroscope':
    case 'magnetometer':
      return <SensorTable data={data as { x: number; y: number; z: number; sensor: any }} />;
    case 'ambient-light-sensor':
      return <LightSpark data={data as { illuminance: number; sensor: any }} />;
    case 'bluetooth':
      return <BluetoothPanel data={data as any} />;
    case 'usb':
      return <USBPanel data={data as any} />;
    case 'serial':
      return <SerialPanel data={data as any} />;
    case 'hid':
      return <HIDPanel data={data as any} />;
    case 'midi':
      return <MIDIPanel data={data as any} />;
    case 'nfc':
      return <NFCPanel data={data as any} />;
    case 'speaker-selection':
      return <SpeakerPanel data={data as any} />;
    case 'persistent-storage':
      return <StoragePanel data={data as any} />;
    case 'local-fonts':
      return <FontsPanel data={data as any} />;
    case 'notifications':
    case 'push':
      return <NotificationPanel data={data} />;
    case 'clipboard-read':
    case 'clipboard-write':
      return <ClipboardPanel data={data as any} />;
    case 'idle-detection':
      return <IdlePanel data={data as any} />;
    case 'compute-pressure':
      return <ComputePressurePanel data={data as any} />;
    case 'screen-wake-lock':
      return <WakeLockPanel data={data as any} />;
    case 'window-management':
      return <WindowManagementPanel data={data as any} />;
    default:
      return <GenericPanel data={data} />;
  }
}
