/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Light Spark Component - Ambient light sensor sparkline visualization
 */
import React, { useEffect, useRef, useState } from 'react';
import { MdWbSunny, MdStop } from 'react-icons/md';

interface LightReading {
  illuminance: number;
  timestamp: number;
}

interface LightSparkProps {
  sensor: {
    illuminance?: number;
    addEventListener: (event: string, handler: () => void) => void;
    removeEventListener: (event: string, handler: () => void) => void;
    start: () => void;
    stop: () => void;
  };
  onStop: () => void;
}

function LightSpark({ sensor, onStop }: LightSparkProps) {
  const [readings, setReadings] = useState<LightReading[]>([]);
  const [currentLux, setCurrentLux] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const maxReadings = 30; // 30 seconds of data at 1Hz

  useEffect(() => {
    if (!sensor) return undefined;

    const handleReading = () => {
      const illuminance = sensor.illuminance || 0;
      const timestamp = Date.now();
      
      setCurrentLux(illuminance);
      setIsActive(true);
      
      setReadings(prev => {
        const newReadings = [...prev, { illuminance, timestamp }];
        return newReadings.slice(-maxReadings);
      });
    };

    const handleError = () => {
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

  // Draw sparkline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || readings.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Calculate bounds
    const values = readings.map(r => r.illuminance);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Draw sparkline
    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b'; // amber-500
    ctx.lineWidth = 2;

    readings.forEach((reading, index) => {
      const x = (index / (readings.length - 1)) * width;
      const y = height - ((reading.illuminance - minValue) / range) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.fill();

    // Draw current value dot
    if (readings.length > 0) {
      const lastReading = readings[readings.length - 1];
      const x = width;
      const y = height - ((lastReading.illuminance - minValue) / range) * height;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }
  }, [readings]);

  const getLightLevel = (lux: number) => {
    if (lux < 1) return { level: 'Very Dark', color: 'text-gray-800' };
    if (lux < 10) return { level: 'Dark', color: 'text-gray-600' };
    if (lux < 50) return { level: 'Dim', color: 'text-yellow-600' };
    if (lux < 200) return { level: 'Indoor', color: 'text-yellow-500' };
    if (lux < 500) return { level: 'Bright Indoor', color: 'text-amber-500' };
    if (lux < 1000) return { level: 'Overcast', color: 'text-orange-500' };
    if (lux < 10000) return { level: 'Daylight', color: 'text-yellow-400' };
    return { level: 'Direct Sun', color: 'text-yellow-300' };
  };

  const lightInfo = currentLux !== null ? getLightLevel(currentLux) : null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdWbSunny className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-amber-800 dark:text-amber-200">
            Light Sensor
          </span>
          {isActive && (
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          )}
        </div>
        <button
          type="button"
          onClick={onStop}
          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          title="Stop sensor"
        >
          <MdStop className="w-4 h-4" />
        </button>
      </div>

      {/* Current reading */}
      {currentLux !== null && lightInfo && (
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
            {Math.round(currentLux)} lux
          </div>
          <div className={`text-sm font-medium ${lightInfo.color}`}>
            {lightInfo.level}
          </div>
        </div>
      )}

      {/* Sparkline */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={50}
          className="w-full h-12 border border-amber-200 dark:border-amber-700 rounded"
        />
        {readings.length < 2 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Collecting data...
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {readings.length > 0 && (
          <>
            {readings.length} readings • 
            Range: {Math.round(Math.min(...readings.map(r => r.illuminance)))} - 
            {Math.round(Math.max(...readings.map(r => r.illuminance)))} lux
          </>
        )}
      </div>
    </div>
  );
}

export default LightSpark;
