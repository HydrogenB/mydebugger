/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Serial Port Preview Component - Display connected serial device info
 */
import React, { useState, useEffect } from 'react';
import { FiMonitor, FiCpu, FiStopCircle, FiActivity } from 'react-icons/fi';

interface SerialPortInfo {
  usbVendorId?: number;
  usbProductId?: number;
}

interface SerialPort {
  readable: ReadableStream | null;
  getInfo(): SerialPortInfo;
}

interface SerialPreviewProps {
  port: SerialPort;
  onStop: () => void;
}

function SerialPreview({ port, onStop }: SerialPreviewProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [portInfo, setPortInfo] = useState<SerialPortInfo | null>(null);
  const [dataCount, setDataCount] = useState(0);

  useEffect(() => {
    if (!port) return;

    const updatePortInfo = () => {
      setPortInfo(port.getInfo());
      setIsConnected(port.readable !== null);
    };

    updatePortInfo();

    // Monitor data flow (if connected)
    if (port.readable) {
      const reader = port.readable.getReader();
      let count = 0;
      
      const readLoop = async () => {
        try {
          // eslint-disable-next-line no-constant-condition
          while (true) {
            // eslint-disable-next-line no-await-in-loop
            const { done } = await reader.read();
            if (done) break;
            count += 1;
            setDataCount(count);
          }
        } catch (error) {
          // Connection ended or error
        }
      };
      
      readLoop();
      
      // eslint-disable-next-line consistent-return
      return () => {
        reader.cancel();
        reader.releaseLock();
      };
    }
  }, [port]);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiMonitor className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">Serial Port</span>
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
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {portInfo && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">USB Vendor ID:</span>
              <span className="font-mono text-gray-900 dark:text-white">
                {portInfo.usbVendorId ? `0x${portInfo.usbVendorId.toString(16).toUpperCase()}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">USB Product ID:</span>
              <span className="font-mono text-gray-900 dark:text-white">
                {portInfo.usbProductId ? `0x${portInfo.usbProductId.toString(16).toUpperCase()}` : 'N/A'}
              </span>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Data Packets:</span>
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <FiActivity className="w-3 h-3" />
            {dataCount}
          </span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Serial port device connected and ready for communication
      </div>
    </div>
  );
}

export default SerialPreview;
