/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Bluetooth Preview Component - Shows connected Bluetooth devices
 */
import React, { useState, useEffect } from 'react';
import { FiBluetooth, FiX, FiRefreshCw } from 'react-icons/fi';

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
  };
}

interface BluetoothNavigator extends Navigator {
  bluetooth?: {
    requestDevice: (options: {
      acceptAllDevices?: boolean;
      optionalServices?: string[];
    }) => Promise<BluetoothDevice>;
  };
}

interface BluetoothPreviewProps {
  device?: BluetoothDevice;
  onStop: () => void;
}

interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
  gatt?: {
    connected: boolean;
  };
}

function BluetoothPreview({ device, onStop }: BluetoothPreviewProps) {
  const [deviceInfo, setDeviceInfo] = useState<BluetoothDeviceInfo | null>(null);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (device) {
      setDeviceInfo({
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: device.gatt?.connected || false,
        gatt: device.gatt ? { connected: device.gatt.connected } : undefined
      });
    }
  }, [device]);

  const scanForDevices = async () => {
    const bluetoothNavigator = navigator as BluetoothNavigator;
    if (!bluetoothNavigator.bluetooth) {
      setError('Bluetooth API not available');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const newDevice = await bluetoothNavigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      setDeviceInfo({
        id: newDevice.id,
        name: newDevice.name || 'Unknown Device',
        connected: newDevice.gatt?.connected || false,
        gatt: newDevice.gatt ? { connected: newDevice.gatt.connected } : undefined
      });
    } catch (err) {
      if ((err as Error).message.includes('User cancelled')) {
        setError('Device selection cancelled');
      } else {
        setError(`Bluetooth error: ${(err as Error).message}`);
      }
    } finally {
      setScanning(false);
    }
  };

  const connectToDevice = async () => {
    if (!device?.gatt) {
      setError('No GATT server available');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      await device.gatt.connect();
      setDeviceInfo(prev => prev ? {
        ...prev,
        connected: true,
        gatt: { connected: true }
      } : null);
    } catch (err) {
      setError(`Connection failed: ${(err as Error).message}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectDevice = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
      setDeviceInfo(prev => prev ? {
        ...prev,
        connected: false,
        gatt: { connected: false }
      } : null);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBluetooth className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bluetooth Device
          </h4>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-xs">
          {error}
        </div>
      )}

      {deviceInfo ? (
        <div className="bg-white dark:bg-gray-900 p-3 rounded border space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Device Information:</div>
            <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">{deviceInfo.name}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">ID: {deviceInfo.id}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                deviceInfo.connected 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {deviceInfo.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {!deviceInfo.connected ? (
              <button
                type="button"
                onClick={connectToDevice}
                disabled={connecting || !device?.gatt}
                className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            ) : (
              <button
                type="button"
                onClick={disconnectDevice}
                className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={scanForDevices}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning for devices...' : 'Scan for Bluetooth Devices'}
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>• Click scan to discover nearby Bluetooth devices</div>
            <div>• Make sure Bluetooth is enabled on your device</div>
            <div>• Some devices may require pairing first</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BluetoothPreview;
