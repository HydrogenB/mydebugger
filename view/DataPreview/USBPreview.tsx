/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * USB Preview Component - Shows connected USB devices
 */
import React, { useState } from 'react';
import { FiHardDrive, FiX, FiRefreshCw } from 'react-icons/fi';

interface USBDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
  usbVersionMajor: number;
  usbVersionMinor: number;
  usbVersionSubminor: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  configurations: USBConfiguration[];
}

interface USBConfiguration {
  configurationValue: number;
  configurationName?: string;
  interfaces: USBInterface[];
}

interface USBInterface {
  interfaceNumber: number;
  alternates: USBAlternateInterface[];
}

interface USBAlternateInterface {
  alternateSetting: number;
  interfaceClass: number;
  interfaceSubclass: number;
  interfaceProtocol: number;
  interfaceName?: string;
  endpoints: USBEndpoint[];
}

interface USBEndpoint {
  endpointNumber: number;
  direction: 'in' | 'out';
  type: 'bulk' | 'interrupt' | 'isochronous';
  packetSize: number;
}

interface USBNavigator extends Navigator {
  usb?: {
    requestDevice: (options: { filters: unknown[] }) => Promise<USBDevice>;
    getDevices: () => Promise<USBDevice[]>;
  };
}

interface USBPreviewProps {
  device?: USBDevice;
  onStop: () => void;
}

function USBPreview({ device, onStop }: USBPreviewProps) {
  const [deviceInfo, setDeviceInfo] = useState<USBDevice | null>(device || null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string>('');

  const scanForDevices = async () => {
    const usbNavigator = navigator as USBNavigator;
    if (!usbNavigator.usb) {
      setError('WebUSB API not available');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const newDevice = await usbNavigator.usb.requestDevice({
        filters: []
      });

      setDeviceInfo(newDevice);
    } catch (err) {
      if ((err as Error).message.includes('No device selected')) {
        setError('Device selection cancelled');
      } else {
        setError(`USB error: ${(err as Error).message}`);
      }
    } finally {
      setScanning(false);
    }
  };

  const getDeviceClass = (classCode: number): string => {
    const deviceClasses: Record<number, string> = {
      0: 'Interface-specific',
      1: 'Audio',
      2: 'Communication',
      3: 'HID',
      5: 'Physical',
      6: 'Image',
      7: 'Printer',
      8: 'Mass Storage',
      9: 'Hub',
      10: 'CDC Data',
      11: 'Smart Card',
      13: 'Content Security',
      14: 'Video',
      15: 'Personal Healthcare',
      16: 'Audio/Video',
      17: 'Billboard',
      18: 'USB Type-C Bridge',
      220: 'Diagnostic',
      224: 'Wireless Controller',
      239: 'Miscellaneous',
      254: 'Application Specific',
      255: 'Vendor Specific'
    };
    return deviceClasses[classCode] || `Unknown (${classCode})`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiHardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            USB Device
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
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Device Information:</div>
            
            {deviceInfo.productName && (
              <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                {deviceInfo.productName}
              </div>
            )}
            
            {deviceInfo.manufacturerName && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Manufacturer: {deviceInfo.manufacturerName}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Vendor ID:</span>
                <span className="ml-1 font-mono">0x{deviceInfo.vendorId.toString(16).padStart(4, '0')}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Product ID:</span>
                <span className="ml-1 font-mono">0x{deviceInfo.productId.toString(16).padStart(4, '0')}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">USB Version:</span>
                <span className="ml-1">{deviceInfo.usbVersionMajor}.{deviceInfo.usbVersionMinor}.{deviceInfo.usbVersionSubminor}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Class:</span>
                <span className="ml-1">{getDeviceClass(deviceInfo.deviceClass)}</span>
              </div>
            </div>

            {deviceInfo.serialNumber && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Serial: {deviceInfo.serialNumber}
              </div>
            )}

            <div className="text-xs text-gray-600 dark:text-gray-400">
              Configurations: {deviceInfo.configurations.length}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={scanForDevices}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning for devices...' : 'Scan for USB Devices'}
          </button>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>• Click scan to discover connected USB devices</div>
            <div>• Only devices with WebUSB support will appear</div>
            <div>• Device selection dialog will show available options</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default USBPreview;
