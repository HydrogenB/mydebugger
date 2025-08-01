/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Speaker Selection Preview Component - Display selected audio output device
 */
import React, { useState, useEffect } from 'react';
import { FiVolume2, FiStopCircle, FiSpeaker, FiPlay } from 'react-icons/fi';

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
  groupId: string;
}

interface SpeakerSelectionPreviewProps {
  device: MediaDeviceInfo;
  onStop: () => void;
}

function SpeakerSelectionPreview({ device, onStop }: SpeakerSelectionPreviewProps) {
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context
    const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: AudioContext }).webkitAudioContext)();
    setAudioContext(ctx);

    return () => {
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    };
  }, []);

  const playTestTone = async () => {
    if (!audioContext || !device) return;

    setIsTestPlaying(true);
    
    try {
      // Create a test tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure tone
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      oscillator.type = 'sine';
      
      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      // Play for 500ms
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Wait for playback to finish
      setTimeout(() => {
        setIsTestPlaying(false);
      }, 600);
      
    } catch (error) {
      setIsTestPlaying(false);
    }
  };

  const getDeviceTypeIcon = () => {
    const label = device.label.toLowerCase();
    if (label.includes('headphone') || label.includes('headset')) {
      return '🎧';
    }
    if (label.includes('bluetooth')) {
      return '📱';
    }
    if (label.includes('speaker')) {
      return '🔊';
    }
    return '🎵';
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiVolume2 className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-gray-900 dark:text-white">Audio Output</span>
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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{getDeviceTypeIcon()}</span>
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">
              {device.label || 'Unknown Device'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Selected Audio Output
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Device ID:</span>
          <span className="font-mono text-xs text-gray-900 dark:text-white">
            {device.deviceId.substring(0, 8)}...
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Type:</span>
          <span className="font-medium text-gray-900 dark:text-white capitalize">
            {device.kind.replace('audio', '')}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Group ID:</span>
          <span className="font-mono text-xs text-gray-900 dark:text-white">
            {device.groupId.substring(0, 8)}...
          </span>
        </div>
      </div>

      {/* Test Audio Button */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={playTestTone}
          disabled={isTestPlaying || !audioContext}
          className="w-full flex items-center justify-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded transition-colors"
        >
          {isTestPlaying ? (
            <>
              <FiSpeaker className="w-4 h-4 animate-pulse" />
              Playing Test Tone...
            </>
          ) : (
            <>
              <FiPlay className="w-4 h-4" />
              Test Audio Output
            </>
          )}
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Audio output device selected - click test to verify it&apos;s working
      </div>
    </div>
  );
}

export default SpeakerSelectionPreview;
