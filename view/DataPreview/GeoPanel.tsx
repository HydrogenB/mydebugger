/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Geolocation Panel Component - Display coordinates and map link
 */
import React, { useEffect, useState } from 'react';
import { MdLocationOn, MdOpenInNew, MdRefresh } from 'react-icons/md';

interface GeolocationData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

interface GeoPanelProps {
  position: GeolocationPosition;
  onRefresh: () => void;
}

function GeoPanel({ position, onRefresh }: GeoPanelProps) {
  const [history, setHistory] = useState<GeolocationData[]>([]);

  useEffect(() => {
    const data: GeolocationData = {
      coords: position.coords,
      timestamp: position.timestamp
    };
    
    setHistory(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 samples
  }, [position]);

  const formatCoordinate = (value: number, precision = 6) => 
    value.toFixed(precision);

  const formatTimestamp = (timestamp: number) => 
    new Date(timestamp).toLocaleTimeString();

  const openInMaps = () => {
    const { latitude, longitude } = position.coords;
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const { coords } = position;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MdLocationOn className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-800 dark:text-blue-200">
            Current Location
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            title="Refresh location"
          >
            <MdRefresh className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={openInMaps}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            title="Open in Google Maps"
          >
            <MdOpenInNew className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current coordinates */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600 dark:text-gray-400">Latitude</div>
          <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">
            {formatCoordinate(coords.latitude)}°
          </div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Longitude</div>
          <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">
            {formatCoordinate(coords.longitude)}°
          </div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
          <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">
            ±{Math.round(coords.accuracy)}m
          </div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Updated</div>
          <div className="font-mono text-gray-900 dark:text-gray-100">
            {formatTimestamp(position.timestamp)}
          </div>
        </div>
      </div>

      {/* Additional data if available */}
      {(coords.altitude !== null && coords.altitude !== undefined) && (
        <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-blue-200 dark:border-blue-700">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Altitude</div>
            <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(coords.altitude)}m
            </div>
          </div>
          {coords.speed !== null && coords.speed !== undefined && (
            <div>
              <div className="text-gray-600 dark:text-gray-400">Speed</div>
              <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(coords.speed * 3.6)} km/h
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Recent positions
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">            {history.slice(1).map((item) => (
              <div 
                key={item.timestamp} 
                className="text-xs font-mono text-gray-500 dark:text-gray-400"
              >
                {formatCoordinate(item.coords.latitude, 4)}°, {formatCoordinate(item.coords.longitude, 4)}° 
                <span className="ml-2 text-gray-400">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GeoPanel;
