import React from 'react';
import { DeviceProfile } from '../types';

interface DeviceSelectorProps {
  devices: DeviceProfile[];
  selectedDevice: string;
  onSelectDevice: (deviceId: string) => void;
}

/**
 * Device selector component for simulating different devices
 */
const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices,
  selectedDevice,
  onSelectDevice
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Device
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
              selectedDevice === device.id
                ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400'
                : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
            onClick={() => onSelectDevice(device.id)}
          >
            <div className="text-center">
              <div className={`text-2xl mb-1 ${selectedDevice === device.id ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {getDeviceIcon(device.type)}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {device.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {device.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get device icon
const getDeviceIcon = (deviceType: string): string => {
  switch (deviceType.toLowerCase()) {
    case 'mobile':
    case 'phone':
      return '📱';
    case 'tablet':
      return '📱';
    case 'desktop':
      return '🖥️';
    case 'bot':
    case 'crawler':
      return '🤖';
    default:
      return '💻';
  }
};

export default DeviceSelector;
