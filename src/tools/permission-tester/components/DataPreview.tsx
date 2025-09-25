/**
 * ? 2025 MyDebugger Contributors – MIT License
 *
 * Shared live preview components for Permission Tester
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { IdleDetectorLike } from '../lib/permissions';

type SerialPortLike = {
  getInfo?: () => { usbVendorId?: number; usbProductId?: number };
  close?: () => Promise<void>;
};

type HidDeviceLike = {
  productName?: string;
  vendorId?: number;
  productId?: number;
};

type MidiPortLike = { id: string; name?: string };

type MidiAccessLike = {
  inputs: Map<string, MidiPortLike>;
  outputs: Map<string, MidiPortLike>;
};

interface BasicPreviewProps {
  onStop: () => void;
}

export const CameraPreview: React.FC<{ stream: MediaStream; onStop: () => void }> = ({ stream, onStop }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.srcObject = stream;
    video.play().catch(() => undefined);
    return () => {
      video.pause();
      video.srcObject = null;
    };
  }, [stream]);

  const settings = stream.getVideoTracks()[0]?.getSettings();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Camera Preview</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Stop
        </button>
      </div>
      <div className="bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-48 object-cover" playsInline muted autoPlay />
      </div>
      {settings ? (
        <div className="text-xs text-gray-500 space-y-1">
          <p>Resolution: {settings.width}x{settings.height}</p>
          <p>Frame rate: {settings.frameRate ?? 'N/A'} fps</p>
          {settings.deviceId ? <p>Device: {settings.deviceId}</p> : null}
        </div>
      ) : null}
    </div>
  );
};

export const MicMeter: React.FC<{ stream: MediaStream; onStop: () => void }> = ({ stream, onStop }) => {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;

    const update = () => {
      analyser.getByteFrequencyData(data);
      const average = data.reduce((sum, value) => sum + value, 0) / data.length;
      setLevel(average / 255);
      raf = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(raf);
      audioContext.close().catch(() => undefined);
    };
  }, [stream]);

  const percent = Math.round(level * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Microphone Activity</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Stop
        </button>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Input level</div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{percent}%</div>
      </div>
    </div>
  );
};

interface GeoPanelProps extends BasicPreviewProps {
  position: GeolocationPosition;
  onRefresh?: () => Promise<void> | void;
}

export const GeoPanel: React.FC<GeoPanelProps> = ({ position, onRefresh, onStop }) => {
  const { coords, timestamp } = position;
  const mapHref = `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}&zoom=15`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Current Location</h4>
        <div className="flex items-center gap-2">
          {onRefresh ? (
            <button
              type="button"
              onClick={() => onRefresh()}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Refresh
            </button>
          ) : null}
          <button
            type="button"
            onClick={onStop}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Stop
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-500">Latitude</div>
          <div className="font-mono">{coords.latitude.toFixed(6)}</div>
        </div>
        <div>
          <div className="text-gray-500">Longitude</div>
          <div className="font-mono">{coords.longitude.toFixed(6)}</div>
        </div>
        <div>
          <div className="text-gray-500">Accuracy</div>
          <div>{coords.accuracy} m</div>
        </div>
        {coords.altitude ? (
          <div>
            <div className="text-gray-500">Altitude</div>
            <div>{coords.altitude} m</div>
          </div>
        ) : null}
        <div className="col-span-2 text-gray-500 text-xs">
          Last updated {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
      <a
        href={mapHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
      >
        View on OpenStreetMap
      </a>
    </div>
  );
};

interface SensorTableProps extends BasicPreviewProps {
  sensor: {
    x?: number;
    y?: number;
    z?: number;
    timestamp?: number;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
    start: () => void;
    stop: () => void;
  };
  sensorType: 'accelerometer' | 'gyroscope' | 'magnetometer';
}

export const SensorTable: React.FC<SensorTableProps> = ({ sensor, sensorType, onStop }) => {
  const [reading, setReading] = useState({ x: 0, y: 0, z: 0, timestamp: Date.now() });

  useEffect(() => {
    const update = () => {
      setReading({
        x: sensor.x ?? 0,
        y: sensor.y ?? 0,
        z: sensor.z ?? 0,
        timestamp: sensor.timestamp ?? Date.now(),
      });
    };

    sensor.addEventListener('reading', update);
    sensor.start();
    update();

    return () => {
      sensor.removeEventListener('reading', update);
      sensor.stop();
    };
  }, [sensor]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">{sensorType.toUpperCase()} Readings</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Stop
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-1">Axis</th>
            <th className="py-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {(['x', 'y', 'z'] as const).map(axis => (
            <tr key={axis} className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-1 text-gray-500 uppercase">{axis}</td>
              <td className="py-1 font-mono">{reading[axis]?.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Updated {new Date(reading.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

interface LightSparkProps extends BasicPreviewProps {
  sensor: {
    illuminance?: number;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
    start: () => void;
    stop: () => void;
  };
}

export const LightSpark: React.FC<LightSparkProps> = ({ sensor, onStop }) => {
  const [lux, setLux] = useState(sensor.illuminance ?? 0);

  useEffect(() => {
    const update = () => setLux(sensor.illuminance ?? 0);
    sensor.addEventListener('reading', update);
    sensor.start();
    update();

    return () => {
      sensor.removeEventListener('reading', update);
      sensor.stop();
    };
  }, [sensor]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Ambient Light</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Stop
        </button>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="text-2xl font-semibold text-yellow-700 dark:text-yellow-300">{lux.toFixed(2)} lux</div>
        <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
          Brightness levels are approximate and depend on device capabilities.
        </div>
      </div>
    </div>
  );
};

interface ComputePressureProps extends BasicPreviewProps {
  data: { observer: { disconnect(): void }; readings: unknown[] };
}

export const ComputePressure: React.FC<ComputePressureProps> = ({ data, onStop }) => {
  const [sampleCount, setSampleCount] = useState(data.readings.length);

  useEffect(() => {
    const id = setInterval(() => {
      setSampleCount(data.readings.length);
    }, 1000);

    return () => {
      clearInterval(id);
      data.observer.disconnect();
    };
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Compute Pressure</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Stop
        </button>
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
        Observing CPU pressure… collected <strong>{sampleCount}</strong> samples.
      </div>
    </div>
  );
};

interface IdlePanelProps extends BasicPreviewProps {
  detector: IdleDetectorLike;
}

export const IdlePanel: React.FC<IdlePanelProps> = ({ detector, onStop }) => {
  const [state, setState] = useState({
    user: detector.userState ?? 'active',
    screen: detector.screenState ?? 'unlocked',
  });

  useEffect(() => {
    const update = () => setState({
      user: detector.userState ?? 'active',
      screen: detector.screenState ?? 'unlocked',
    });

    detector.addEventListener?.('change', update as EventListener);
    return () => {
      detector.removeEventListener?.('change', update as EventListener);
      detector.stop?.();
    };
  }, [detector]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Idle Detector</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Stop
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-gray-500">User state</div>
          <div className="font-medium">{state.user}</div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-gray-500">Screen state</div>
          <div className="font-medium">{state.screen}</div>
        </div>
      </div>
    </div>
  );
};

interface WindowPanelProps extends BasicPreviewProps {
  win: Window;
  onClose: () => void;
}

export const WindowPanel: React.FC<WindowPanelProps> = ({ win, onClose, onStop }) => {
  const [dimensions, setDimensions] = useState({
    width: win.innerWidth,
    height: win.innerHeight,
  });

  useEffect(() => {
    const watcher = () => setDimensions({ width: win.innerWidth, height: win.innerHeight });
    win.addEventListener('resize', watcher);
    return () => win.removeEventListener('resize', watcher);
  }, [win]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Window Manager</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded"
          >
            Focus
          </button>
          <button
            type="button"
            onClick={onStop}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        <p>URL: {win.location.href}</p>
        <p>Size: {dimensions.width} ? {dimensions.height}</p>
      </div>
    </div>
  );
};

export const ClipboardPreview: React.FC<BasicPreviewProps> = ({ onStop }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900 dark:text-white">Clipboard Access</h4>
      <button
        type="button"
        onClick={onStop}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Close
      </button>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Clipboard access granted. Use the buttons below to read or write clipboard contents.
    </p>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={async () => {
          try {
            const text = await navigator.clipboard.readText();
            // eslint-disable-next-line no-alert
            alert(`Clipboard: ${text}`);
          } catch (error) {
            console.error(error);
          }
        }}
        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
      >
        Read text
      </button>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText('MyDebugger clipboard test').catch(() => undefined)}
        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded"
      >
        Write sample
      </button>
    </div>
  </div>
);

interface NotificationPreviewProps extends BasicPreviewProps {
  onTest?: () => void;
}

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({ onStop, onTest }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900 dark:text-white">Notifications Ready</h4>
      <button
        type="button"
        onClick={onStop}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Close
      </button>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300">
      Notifications are enabled. Trigger a test notification to verify delivery.
    </p>
    <button
      type="button"
      onClick={() => onTest?.()}
      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
    >
      Send test notification
    </button>
  </div>
);

interface BluetoothPreviewProps extends BasicPreviewProps {
  device: { id: string; name?: string; gatt?: { connected: boolean } };
}

export const BluetoothPreview: React.FC<BluetoothPreviewProps> = ({ device, onStop }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900 dark:text-white">Bluetooth Device</h4>
      <button
        type="button"
        onClick={onStop}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Disconnect
      </button>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
      <p><strong>Name:</strong> {device.name ?? 'Unknown device'}</p>
      <p><strong>ID:</strong> {device.id}</p>
      <p><strong>Connected:</strong> {device.gatt?.connected ? 'Yes' : 'No'}</p>
    </div>
  </div>
);

interface UsbPreviewProps extends BasicPreviewProps {
  device: {
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
    vendorId?: number;
    productId?: number;
  };
}

export const USBPreview: React.FC<UsbPreviewProps> = ({ device, onStop }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900 dark:text-white">USB Device</h4>
      <button
        type="button"
        onClick={onStop}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Disconnect
      </button>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
      <p><strong>Product:</strong> {device.productName ?? 'Unknown'}</p>
      <p><strong>Manufacturer:</strong> {device.manufacturerName ?? 'Unknown'}</p>
      {device.serialNumber ? <p><strong>Serial:</strong> {device.serialNumber}</p> : null}
      {device.vendorId ? <p><strong>Vendor ID:</strong> {device.vendorId}</p> : null}
      {device.productId ? <p><strong>Product ID:</strong> {device.productId}</p> : null}
    </div>
  </div>
);

export const ScreenWakeLockPreview: React.FC<{ wakeLock: { released: boolean; release: () => Promise<void> }; onStop: () => void }> = ({ wakeLock, onStop }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900 dark:text-white">Screen Wake Lock</h4>
      <button
        type="button"
        onClick={async () => {
          await wakeLock.release().catch(() => undefined);
          onStop();
        }}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Release
      </button>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300">
      Wake lock is currently <strong>{wakeLock.released ? 'released' : 'active'}</strong>.
    </div>
  </div>
);

export const SerialPreview: React.FC<{ port: SerialPortLike; onStop: () => void }> = ({ port, onStop }) => {
  const info = port.getInfo?.();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Serial Port</h4>
        <button
          type="button"
          onClick={async () => {
            await port.close?.().catch(() => undefined);
            onStop();
          }}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Disconnect
        </button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        <p>USB Vendor ID: {info?.usbVendorId ?? 'Unknown'}</p>
        <p>USB Product ID: {info?.usbProductId ?? 'Unknown'}</p>
      </div>
    </div>
  );
};

export const HIDPreview: React.FC<{ device: HidDeviceLike; onStop: () => void }> = ({ device, onStop }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900 dark:text-white">HID Device</h4>
      <button
        type="button"
        onClick={onStop}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Disconnect
      </button>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
      <p><strong>Product:</strong> {device.productName ?? 'Unknown'}</p>
      <p><strong>Vendor ID:</strong> {device.vendorId ?? 'N/A'}</p>
      <p><strong>Product ID:</strong> {device.productId ?? 'N/A'}</p>
    </div>
  </div>
);

export const MIDIPreview: React.FC<{ access: MidiAccessLike; onStop: () => void }> = ({ access, onStop }) => {
  const inputs = useMemo(() => Array.from(access.inputs.values()), [access.inputs]);
  const outputs = useMemo(() => Array.from(access.outputs.values()), [access.outputs]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">MIDI Access</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Close
        </button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
        <div>
          <div className="font-medium">Inputs ({inputs.length})</div>
          <ul className="list-disc list-inside text-xs">
            {inputs.map(input => (
              <li key={input.id}>{input.name ?? input.id}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-medium">Outputs ({outputs.length})</div>
          <ul className="list-disc list-inside text-xs">
            {outputs.map(output => (
              <li key={output.id}>{output.name ?? output.id}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const NFCPreview: React.FC<{ reader: { scan(): Promise<void>; addEventListener: (event: string, handler: (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer; mediaType?: string }> } }) => void) => void; removeEventListener: (event: string, handler: (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer; mediaType?: string }> } }) => void) => void; }; onStop: () => void }> = ({ reader, onStop }) => {
  const [records, setRecords] = useState<string[]>([]);

  useEffect(() => {
    const handler = (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer; mediaType?: string }> } }) => {
      const readable = event.message.records.map(record => record.recordType).join(', ');
      setRecords(prev => [...prev, readable]);
    };

    reader.addEventListener('reading', handler as never);
    reader.scan().catch(() => undefined);

    return () => {
      reader.removeEventListener('reading', handler as never);
    };
  }, [reader]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">NFC Reader</h4>
        <button
          type="button"
          onClick={onStop}
          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Stop
        </button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Hold an NFC tag near your device to capture messages.
      </div>
      {records.length ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs font-mono space-y-1">
          {records.slice(-5).map((record, index) => (
            <div key={index}>{record}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const SpeakerSelectionPreview: React.FC<{ device: { deviceId: string; label: string; kind: string; groupId: string }; onStop: () => void }> = ({ device, onStop }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-gray-900 dark:text-white">Speaker Device</h4>
      <button
        type="button"
        onClick={onStop}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Close
      </button>
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
      <p><strong>Label:</strong> {device.label || 'Default speaker'}</p>
      <p><strong>Device ID:</strong> {device.deviceId}</p>
      <p><strong>Kind:</strong> {device.kind}</p>
      <p><strong>Group:</strong> {device.groupId}</p>
    </div>
  </div>
);

export default {
  CameraPreview,
  MicMeter,
  GeoPanel,
  SensorTable,
  LightSpark,
  ComputePressure,
  IdlePanel,
  WindowPanel,
  ClipboardPreview,
  NotificationPreview,
  BluetoothPreview,
  USBPreview,
  ScreenWakeLockPreview,
  SerialPreview,
  HIDPreview,
  MIDIPreview,
  NFCPreview,
  SpeakerSelectionPreview,
};
