/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * MIDI Preview Component - Display MIDI device info and messages
 */
import React, { useState, useEffect } from 'react';
import { FiMusic, FiStopCircle, FiActivity, FiVolume2 } from 'react-icons/fi';

interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  sysexEnabled: boolean;
}

interface MIDIInput {
  name: string;
  manufacturer: string;
  state: string;
  connection: string;
  onmidimessage?: (event: { data: Uint8Array }) => void;
}

interface MIDIOutput {
  name: string;
  manufacturer: string;
  state: string;
  connection: string;
}

interface MIDIPreviewProps {
  midiAccess: MIDIAccess;
  onStop: () => void;
}

function MIDIPreview({ midiAccess, onStop }: MIDIPreviewProps) {
  const [midiMessages, setMidiMessages] = useState<Array<{ time: number; data: number[] }>>([]);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (!midiAccess?.inputs) return;

    const messageHandlers = new Map();

    // Set up MIDI message listeners for all inputs
    midiAccess.inputs.forEach((input, id) => {
      const handler = (event: { data: Uint8Array }) => {
        const data = Array.from(event.data);
        setMidiMessages(prev => [...prev.slice(-9), { time: Date.now(), data }]); // Keep last 10
        setMessageCount(count => count + 1);
      };
      
      messageHandlers.set(id, handler);
      if (input.onmidimessage !== undefined) {
        input.onmidimessage = handler;
      }
    });

    return () => {
      // Cleanup
      midiAccess.inputs.forEach((input, id) => {
        const handler = messageHandlers.get(id);
        if (handler && input.onmidimessage) {
          input.onmidimessage = undefined;
        }
      });
    };
  }, [midiAccess]);

  const formatMIDIMessage = (data: number[]) => {
    if (data.length === 0) return 'Empty';
    
    const [status, ...dataBytes] = data;
    const channel = (status & 0x0F) + 1;
    const messageType = status & 0xF0;
    
    switch (messageType) {
      case 0x90: return `Note On Ch.${channel} - Note: ${dataBytes[0]}, Vel: ${dataBytes[1]}`;
      case 0x80: return `Note Off Ch.${channel} - Note: ${dataBytes[0]}, Vel: ${dataBytes[1]}`;
      case 0xB0: return `Control Change Ch.${channel} - CC: ${dataBytes[0]}, Val: ${dataBytes[1]}`;
      case 0xC0: return `Program Change Ch.${channel} - Program: ${dataBytes[0]}`;
      case 0xE0: return `Pitch Bend Ch.${channel} - Value: ${(dataBytes[1] << 7) | dataBytes[0]}`;
      default: return `Unknown (${status.toString(16).toUpperCase()})`;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiMusic className="w-4 h-4 text-green-500" />
          <span className="font-medium text-gray-900 dark:text-white">MIDI Access</span>
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
          <span className="text-gray-600 dark:text-gray-400">Input Devices:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {midiAccess?.inputs?.size || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Output Devices:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {midiAccess?.outputs?.size || 0}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">SysEx Enabled:</span>
          <span className={`font-medium ${midiAccess?.sysexEnabled ? 'text-green-600' : 'text-red-600'}`}>
            {midiAccess?.sysexEnabled ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Messages Received:</span>
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <FiActivity className="w-3 h-3" />
            {messageCount}
          </span>
        </div>
      </div>

      {/* Device List */}
      {midiAccess?.inputs && midiAccess.inputs.size > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <FiVolume2 className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Input Devices:
            </span>
          </div>
          <div className="space-y-1">
            {Array.from(midiAccess.inputs.values()).map((input, i) => (
              <div key={i} className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="font-medium">{input.name}</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {input.manufacturer} - {input.state}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent MIDI Messages */}
      {midiMessages.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <FiActivity className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Recent Messages:
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {midiMessages.slice(-5).map((msg, i) => (
              <div key={i} className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                <div className="font-mono">{formatMIDIMessage(msg.data)}</div>
                <div className="text-gray-500 text-xs">
                  {new Date(msg.time).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        MIDI access enabled - play MIDI devices to see live data
      </div>
    </div>
  );
}

export default MIDIPreview;
