/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * NFC Preview Component - Display NFC reading status and data
 */
import React, { useState, useEffect } from 'react';
import { FiWifi, FiStopCircle, FiActivity, FiTag } from 'react-icons/fi';

interface NDEFReader {
  scan: () => Promise<void>;
  addEventListener: (event: string, handler: (event: { message: { records: NDEFRecord[] } }) => void) => void;
  removeEventListener: (event: string, handler: (event: { message: { records: NDEFRecord[] } }) => void) => void;
}

interface NDEFRecord {
  recordType: string;
  data: ArrayBuffer;
  mediaType?: string;
}

interface NFCPreviewProps {
  reader: NDEFReader;
  onStop: () => void;
}

function NFCPreview({ reader, onStop }: NFCPreviewProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [ndefRecords, setNdefRecords] = useState<NDEFRecord[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!reader) return;

    const handleReading = (event: { message: { records: NDEFRecord[] } }) => {
      setNdefRecords(event.message.records);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date());
    };

    const handleReadingError = () => {
      setIsScanning(false);
    };

    reader.addEventListener('reading', handleReading);
    reader.addEventListener('readingerror', handleReadingError);

    // Start scanning
    setIsScanning(true);
    reader.scan().catch(() => {
      setIsScanning(false);
    });

    return () => {
      reader.removeEventListener('reading', handleReading);
      reader.removeEventListener('readingerror', handleReadingError);
      setIsScanning(false);
    };
  }, [reader]);

  const formatRecordData = (record: NDEFRecord) => {
    const decoder = new TextDecoder();
    try {
      return decoder.decode(record.data);
    } catch {
      return `Binary data (${record.data.byteLength} bytes)`;
    }
  };

  const getRecordTypeDisplay = (recordType: string) => {
    switch (recordType) {
      case 'text': return 'Text';
      case 'url': return 'URL';
      case 'mime': return 'MIME';
      case 'absolute-url': return 'Absolute URL';
      case 'empty': return 'Empty';
      default: return recordType;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiWifi className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">NFC Reader</span>
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
          <span className={`font-medium ${isScanning ? 'text-green-600' : 'text-gray-500'}`}>
            {isScanning ? 'Scanning...' : 'Stopped'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Tags Read:</span>
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <FiActivity className="w-3 h-3" />
            {scanCount}
          </span>
        </div>

        {lastScanTime && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Last Scan:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {lastScanTime.toLocaleTimeString()}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Records:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {ndefRecords.length}
          </span>
        </div>
      </div>

      {/* Latest NDEF Records */}
      {ndefRecords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <FiTag className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              NDEF Records:
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {ndefRecords.map((record, i) => (
              <div key={i} className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getRecordTypeDisplay(record.recordType)}
                  </span>
                  {record.mediaType && (
                    <span className="text-gray-500">{record.mediaType}</span>
                  )}
                </div>
                <div className="text-gray-600 dark:text-gray-400 break-all">
                  {formatRecordData(record)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {isScanning ? 'Bring an NFC tag near your device to read data' : 'NFC scanning stopped'}
      </div>
    </div>
  );
}

export default NFCPreview;
