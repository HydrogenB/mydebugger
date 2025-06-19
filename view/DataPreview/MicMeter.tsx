/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Microphone Meter Component - Real-time audio level visualization
 */
import React, { useEffect, useRef, useState } from 'react';
import { MdMicOff } from 'react-icons/md';

interface MicMeterProps {
  stream: MediaStream;
  onStop: () => void;
}

function MicMeter({ stream, onStop }: MicMeterProps) {
  const [level, setLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!stream) return undefined;    // Create audio context and analyser
    const AudioContextClass = window.AudioContext || (window as Window & { 
      webkitAudioContext?: typeof AudioContext 
    }).webkitAudioContext;
    
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
    
    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.3;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for more accurate volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const normalizedLevel = Math.min(rms / 128, 1); // Normalize to 0-1
      
      setLevel(normalizedLevel);
      animationRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext.state !== 'closed') {
        audioContext.close().catch(() => {
          // Ignore close errors
        });
      }
    };
  }, [stream]);

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioContextRef.current?.state === 'running') {
        audioContextRef.current.suspend().catch(() => {
          // Ignore suspend errors
        });
      } else if (!document.hidden && audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {
          // Ignore resume errors
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const getBarColor = () => {
    if (level < 0.3) return 'bg-green-500';
    if (level < 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const micLabel = stream.getAudioTracks()[0]?.label || 'Unknown Microphone';

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Audio Level
        </div>
        <button
          type="button"
          onClick={onStop}
          className="bg-red-500/80 hover:bg-red-600/80 text-white p-1 rounded transition-colors"
        >
          <MdMicOff className="w-4 h-4" />
        </button>
      </div>

      {/* VU Meter */}
      <div className="relative">
        <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${getBarColor()}`}
            style={{ width: `${level * 100}%` }}
          />
        </div>
        
        {/* Level indicators */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Numeric level */}
      <div className="text-center">
        <div className="text-lg font-mono font-bold text-gray-800 dark:text-gray-200">
          {Math.round(level * 100)}%
        </div>
        <div className="text-xs text-gray-500 truncate" title={micLabel}>
          {micLabel}
        </div>
      </div>

      {/* Peak indicator */}
      {level > 0.9 && (
        <div className="text-center text-red-500 text-sm font-semibold animate-pulse">
          ⚠ PEAK
        </div>
      )}
    </div>
  );
}

export default MicMeter;
