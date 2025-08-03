/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Microphone Preview Component - Audio level meter with visualization
 */
// @ts-nocheck
import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

// Import icons with type assertion
const Icons = {
  Mic: (props: any) => <MdMic {...props} />,
  MicOff: (props: any) => <MdMicOff {...props} />,
  StopCircle: (props: any) => <MdStopCircle {...props} />
} as const;

// Import icons dynamically to avoid type issues
const { Mic, MicOff, StopCircle } = Icons;

interface MicrophonePreviewProps {
  stream: MediaStream;
  onStop: () => void;
}

const MicrophonePreview: React.FC<MicrophonePreviewProps> = ({ 
  stream, 
  onStop 
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameId = useRef<number>();
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!stream) return;

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let dataArray: Uint8Array | null = null;

    const initAudio = async () => {
      try {
        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        // Create analyzer node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        // Connect stream to analyzer
        source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        // Start analyzing
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateLevel = () => {
          if (!analyser || !dataArray) return;
          
          analyser.getByteFrequencyData(dataArray);
          const level = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(level);
          
          animationFrameId.current = requestAnimationFrame(updateLevel);
        };
        
        updateLevel();
        
      } catch (err) {
        console.error('Error initializing audio:', err);
        setError('Failed to initialize audio. Please check your microphone permissions.');
      }
    };
    
    initAudio();
    
    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      if (source) {
        source.disconnect();
      }
      
      if (analyser) {
        analyser.disconnect();
      }
      
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream]);

  // Toggle mute state
  const toggleMute = () => {
    if (!stream) return;
    
    const tracks = stream.getAudioTracks();
    tracks.forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  // Calculate bar heights for visualization
  const barCount = 20;
  const barHeights = Array(barCount).fill(0).map((_, i) => {
    const level = Math.min(100, Math.max(0, audioLevel * 2 - i * (100 / barCount)));
    return Math.max(2, level); // Minimum height for visibility
  });

  return (
    <div className="relative bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Microphone Preview</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className={`p-2 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={onStop}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
            aria-label="Stop"
          >
            <StopCircle size={20} />
          </button>
        </div>
      </div>
      
      {error ? (
        <div className="text-red-400 text-sm mb-4">{error}</div>
      ) : (
        <div className="flex items-end justify-center h-32 gap-1 mb-4">
          {barHeights.map((height, i) => (
            <div 
              key={i}
              className="w-2 bg-blue-500 rounded-t transition-all duration-100"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {/* Audio level meter */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Input Level</span>
          <span className="font-mono">{Math.round(audioLevel * 100 / 255)}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(100, (audioLevel / 255) * 100)}%` }}
          />
        </div>
        
        {/* Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Status</span>
          <span className="flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${isMuted ? 'bg-red-500' : 'bg-green-500'}`} />
            {isMuted ? 'Muted' : 'Listening'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MicrophonePreview;
