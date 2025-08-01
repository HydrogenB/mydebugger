/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * HID Device Preview Component - Display connected HID device info
 */
import React, { useState, useEffect } from 'react';
import { FiHardDrive, FiStopCircle, FiActivity, FiZap } from 'react-icons/fi';

interface HIDDevice {
  vendorId: number;
  productId: number;
  productName?: string;
  opened: boolean;
  collections: Array<{
    usage: number;
    usagePage: number;
  }>;
  addEventListener?: (event: string, handler: (e: { data: DataView }) => void) => void;
  removeEventListener?: (event: string, handler: (e: { data: DataView }) => void) => void;
}

interface HIDPreviewProps {
  device: HIDDevice;
  onStop: () => void;
}

function HIDPreview({ device, onStop }: HIDPreviewProps) {
  const [inputData, setInputData] = useState<number[]>([]);
  const [inputCount, setInputCount] = useState(0);

  useEffect(() => {
    if (!device?.addEventListener) return;

    const handleInputReport = (event: { data: DataView }) => {
      const bytes = Array.from(new Uint8Array(event.data.buffer));
      setInputData(bytes.slice(0, 8)); // Show first 8 bytes
      setInputCount(prev => prev + 1);
    };

    device.addEventListener('inputreport', handleInputReport);

    return () => {
      if (device.removeEventListener) {
        device.removeEventListener('inputreport', handleInputReport);
      }
    };
  }, [device]);

  const getDeviceType = () => {
    if (!device.collections?.length) return 'Unknown';
    
    const collection = device.collections[0];
    const { usagePage, usage } = collection;
    
    if (usagePage === 1) {
      switch (usage) {
        case 2: return 'Mouse';
        case 6: return 'Keyboard';
        case 4: return 'Joystick';
        case 5: return 'Gamepad';
        case 8: return 'Multi-axis Controller';
        default: return 'Generic Desktop';
      }
    }
    
    return `Usage Page: ${usagePage}, Usage: ${usage}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiHardDrive className="w-4 h-4 text-purple-500" />
          <span className="font-medium text-gray-900 dark:text-white">HID Device</span>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="text-red-500 hover:text-red-600 p-1 rounded"
        >
          <FiStopCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Device Type:</span>
          <span className="font-medium text-gray-900 dark:text-white">{getDeviceType()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Product Name:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {device.productName || 'Unknown Device'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Vendor ID:</span>
          <span className="font-mono text-gray-900 dark:text-white">
            0x{device.vendorId?.toString(16).toUpperCase().padStart(4, '0')}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Product ID:</span>
          <span className="font-mono text-gray-900 dark:text-white">
            0x{device.productId?.toString(16).toUpperCase().padStart(4, '0')}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-medium ${device.opened ? 'text-green-600' : 'text-gray-500'}`}>
            {device.opened ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Input Reports:</span>
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <FiActivity className="w-3 h-3" />
            {inputCount}
          </span>
        </div>
      </div>

      {inputData.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <FiZap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Latest Input Data:
            </span>
          </div>
          <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {inputData.map((byte, i) => (
              <span key={i} className="mr-2">
                {byte.toString(16).toUpperCase().padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Human Interface Device connected and ready for input
      </div>
    </div>
  );
}

export default HIDPreview;
