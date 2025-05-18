import React from 'react';
import { QRCodeSettings } from '../types';

interface QRCodeSettingsProps {
  settings: QRCodeSettings;
  onUpdateSettings: (settings: Partial<QRCodeSettings>) => void;
}

/**
 * Component for QR code generation settings
 */
const QRCodeSettings: React.FC<QRCodeSettingsProps> = ({ settings, onUpdateSettings }) => {
  const { size, errorCorrection, darkColor, lightColor } = settings;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        QR Code Settings
      </h3>
      
      <div className="space-y-4">
        {/* Size slider */}
        <div className="flex flex-col space-y-1">
          <div className="flex justify-between">
            <label htmlFor="size" className="text-xs text-gray-600 dark:text-gray-400">
              Size: {size}px
            </label>
            <span className="text-xs text-gray-500">
              {size < 200 ? 'Small' : size < 400 ? 'Medium' : 'Large'}
            </span>
          </div>
          <input
            id="size"
            type="range"
            min="128"
            max="512"
            step="16"
            value={size}
            onChange={(e) => onUpdateSettings({ size: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        
        {/* Error correction level */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-600 dark:text-gray-400">
            Error Correction Level
          </label>
          <div className="grid grid-cols-4 gap-1">
            {['L', 'M', 'Q', 'H'].map(level => (
              <button
                key={level}
                onClick={() => onUpdateSettings({ 
                  errorCorrection: level as 'L' | 'M' | 'Q' | 'H' 
                })}
                className={`py-1 text-xs rounded-md ${
                  errorCorrection === level 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {errorCorrection === 'L' && 'Low - 7% recovery'}
            {errorCorrection === 'M' && 'Medium - 15% recovery'}
            {errorCorrection === 'Q' && 'Quartile - 25% recovery'}
            {errorCorrection === 'H' && 'High - 30% recovery'}
          </span>
        </div>
        
        {/* Color pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="darkColor" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Dark Color
            </label>
            <div className="flex space-x-2">
              <input
                id="darkColor"
                type="color"
                value={darkColor}
                onChange={(e) => onUpdateSettings({ darkColor: e.target.value })}
                className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={darkColor}
                onChange={(e) => onUpdateSettings({ darkColor: e.target.value })}
                className="flex-1 text-xs p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="lightColor" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Light Color
            </label>
            <div className="flex space-x-2">
              <input
                id="lightColor"
                type="color"
                value={lightColor}
                onChange={(e) => onUpdateSettings({ lightColor: e.target.value })}
                className="h-8 w-8 rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={lightColor}
                onChange={(e) => onUpdateSettings({ lightColor: e.target.value })}
                className="flex-1 text-xs p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeSettings;
