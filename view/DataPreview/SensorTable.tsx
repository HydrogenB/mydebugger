/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Sensor Table Component - Real-time sensor data display
 */
import React, { useEffect, useState } from 'react';
import { MdSensors, MdStop } from 'react-icons/md';

interface SensorReading {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface SensorTableProps {
  sensor: {
    x?: number;
    y?: number;
    z?: number;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
    start: () => void;
    stop: () => void;
  };
  sensorType: 'accelerometer' | 'gyroscope' | 'magnetometer';
  onStop: () => void;
}

function SensorTable({ sensor, sensorType, onStop }: SensorTableProps) {
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (!sensor) return undefined;

    const handleReading = () => {
      const newReading: SensorReading = {
        x: sensor.x || 0,
        y: sensor.y || 0,
        z: sensor.z || 0,
        timestamp: Date.now()
      };

      setReading(newReading);
      setIsActive(true);

      // Track which values changed for highlighting
      setLastUpdate(prev => {
        const updates: { [key: string]: number } = {};
        if (prev.x !== newReading.x) updates.x = Date.now();
        if (prev.y !== newReading.y) updates.y = Date.now();
        if (prev.z !== newReading.z) updates.z = Date.now();
        return { ...prev, ...updates };
      });
    };    const handleError = () => {
      setIsActive(false);
    };

    sensor.addEventListener('reading', handleReading);
    sensor.addEventListener('error', handleError);

    try {
      sensor.start();
    } catch (error) {
      setIsActive(false);
    }

    return () => {
      sensor.removeEventListener('reading', handleReading);
      sensor.removeEventListener('error', handleError);
      try {
        sensor.stop();
      } catch {
        // Ignore stop errors
      }
    };
  }, [sensor]);

  const getSensorConfig = () => {
    switch (sensorType) {
      case 'accelerometer':
        return {
          title: 'Accelerometer',
          unit: 'm/s²',
          icon: <MdSensors className="w-5 h-5 text-purple-600" />,
          color: 'purple'
        };
      case 'gyroscope':
        return {
          title: 'Gyroscope',
          unit: 'rad/s',
          icon: <MdSensors className="w-5 h-5 text-green-600" />,
          color: 'green'
        };
      case 'magnetometer':
        return {
          title: 'Magnetometer',
          unit: 'μT',
          icon: <MdSensors className="w-5 h-5 text-blue-600" />,
          color: 'blue'
        };
      default:
        return {
          title: 'Sensor',
          unit: '',
          icon: <MdSensors className="w-5 h-5 text-gray-600" />,
          color: 'gray'
        };
    }
  };

  const config = getSensorConfig();

  const formatValue = (value: number) => value.toFixed(3);

  const isRecentlyUpdated = (axis: string) => {
    const updateTime = lastUpdate[axis];
    return updateTime && Date.now() - updateTime < 150;
  };

  const getHighestDelta = () => {
    if (!reading) return null;
    
    const values = { x: Math.abs(reading.x), y: Math.abs(reading.y), z: Math.abs(reading.z) };
    return Object.entries(values).reduce((max, [axis, value]) => 
      value > max.value ? { axis, value } : max, 
      { axis: '', value: 0 }
    ).axis;
  };

  const highestAxis = getHighestDelta();

  return (
    <div className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 rounded-lg p-4 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`font-medium text-${config.color}-800 dark:text-${config.color}-200`}>
            {config.title}
          </span>
          {isActive && (
            <div className={`w-2 h-2 bg-${config.color}-500 rounded-full animate-pulse`} />
          )}
        </div>
        <button
          type="button"
          onClick={onStop}
          className={`text-${config.color}-600 hover:text-${config.color}-800 dark:text-${config.color}-400 dark:hover:text-${config.color}-200`}
          title="Stop sensor"
        >
          <MdStop className="w-4 h-4" />
        </button>
      </div>

      {/* Data table */}
      {reading ? (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <div>Axis</div>
            <div>Value</div>
            <div>Unit</div>
            <div>Status</div>
          </div>
          
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div 
              key={axis}
              className={`grid grid-cols-4 gap-2 text-sm py-1 px-2 rounded transition-colors ${
                isRecentlyUpdated(axis) 
                  ? `bg-yellow-200 dark:bg-yellow-800/30` 
                  : 'bg-white/50 dark:bg-black/10'
              }`}
            >
              <div className="font-semibold uppercase">
                {axis}
                {highestAxis === axis && (
                  <span className="ml-1 text-xs text-red-500">MAX</span>
                )}
              </div>
              <div className="font-mono font-bold">
                {formatValue(reading[axis])}
              </div>
              <div className="text-gray-500">
                {config.unit}
              </div>
              <div>
                {isRecentlyUpdated(axis) && (
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    UPDATED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          {isActive ? 'Waiting for sensor data...' : 'Sensor inactive'}
        </div>
      )}

      {/* Frequency info */}
      {reading && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center border-t pt-2">
          Last update: {new Date(reading.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default SensorTable;
