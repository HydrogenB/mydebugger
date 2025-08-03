/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Camera Preview Component - Live camera feed with FPS counter and controls
 */
// @ts-nocheck
import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

// Import icons with type assertion
const Icons = {
  StopCircle: (props: any) => <MdStopCircle {...props} />,
  FlipCameraIos: (props: any) => <MdFlipCameraIos {...props} />,
  FlashOn: (props: any) => <MdFlashOn {...props} />,
  FlashOff: (props: any) => <MdFlashOff {...props} />
} as const;

// Import icons dynamically to avoid type issues
const { StopCircle, FlipCameraIos, FlashOn, FlashOff } = Icons;

// Type declarations for MediaTrackConstraints with torch support
interface MediaTrackConstraintsWithTorch extends MediaTrackConstraints {
  advanced?: Array<{
    torch?: boolean;
  }>;
}

// Type for track with torch capabilities
interface MediaStreamTrackWithTorch extends MediaStreamTrack {
  getCapabilities?: () => MediaTrackCapabilities & { torch?: boolean };
  applyConstraints: (constraints: MediaTrackConstraintsWithTorch) => Promise<void>;
}

interface CameraPreviewProps {
  stream: MediaStream;
  onStop: () => void;
}

function CameraPreview({ stream, onStop }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [fps, setFps] = useState(0);
  const [isMirrored, setIsMirrored] = useState(true);
  const [flashSupported, setFlashSupported] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const animationFrameId = useRef<number>();

  // Check for flash/torch support
  useEffect(() => {
    if (!stream) return;
    
    const track = stream.getVideoTracks()[0] as MediaStreamTrackWithTorch;
    if (track?.getCapabilities) {
      const capabilities = track.getCapabilities();
      setFlashSupported(!!capabilities?.torch);
    }
  }, [stream]);

  // Toggle flash/torch
  const toggleFlash = useCallback(async () => {
    if (!stream) return;
    
    const track = stream.getVideoTracks()[0] as MediaStreamTrackWithTorch;
    if (!track?.applyConstraints) return;
    
    try {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }]
      });
      setFlashOn(!flashOn);
    } catch (err: unknown) {
      console.error('Error toggling flash:', err);
      setError('Flash not supported on this device');
      setFlashSupported(false);
    }
  }, [stream, flashOn]);

  // Toggle mirror effect
  const toggleMirror = useCallback(() => {
    setIsMirrored(!isMirrored);
  }, [isMirrored]);

  // Setup video stream and FPS counter
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    // Store stream reference for cleanup
    streamRef.current = stream;
    
    // Set video source
    video.srcObject = stream;
    
    // Handle play errors
    const handlePlayError = (e: ErrorEvent) => {
      console.error('Error playing video:', e);
      setError('Failed to start camera preview');
    };
    
    video.addEventListener('error', handlePlayError as any);
    
    // Start playing
    video.play().catch((err) => {
      console.error('Error playing video:', err);
      setError('Failed to start camera preview. Please check permissions.');
    });

    // FPS counter
    const updateFps = () => {
      frameCountRef.current += 1;
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      
      if (elapsed >= 1000) {
        setFps(Math.round(frameCountRef.current / (elapsed / 1000)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationFrameId.current = requestAnimationFrame(updateFps);
    };
    
    animationFrameId.current = requestAnimationFrame(updateFps);

    // Cleanup
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      video.removeEventListener('error', handlePlayError as any);
      
      if (video.srcObject) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stream]);

  useEffect(() => {
    // Pause video when tab is hidden to save resources
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      
      if (document.hidden) {
        video.pause();
      } else if (stream) {
        video.play().catch(() => {
          // Ignore play errors
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle taking a photo
  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.save();
    if (isMirrored) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore();

    // Create download link
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `camera-photo-${new Date().toISOString()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.9);
  }, [isMirrored]);

  if (error) {
    return (
      <div className="bg-black/90 text-white p-6 rounded-lg shadow-lg">
        <div className="text-red-400 font-medium mb-2">Camera Error</div>
        <p className="text-sm mb-4">{error}</p>
        <button
          onClick={onStop}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          Close Preview
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden shadow-xl">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-auto max-h-[70vh] object-cover ${isMirrored ? 'transform -scale-x-100' : ''}`}
        autoPlay
        playsInline
        muted
      />
      
      {/* Overlay controls */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="text-white/90 text-sm bg-black/50 px-3 py-1.5 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>{fps} FPS</span>
          </div>
          
          <div className="flex space-x-2">
            {flashSupported && (
              <button
                onClick={toggleFlash}
                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                aria-label={flashOn ? 'Turn off flash' : 'Turn on flash'}
              >
                {flashOn ? <FlashOn size={20} /> : <FlashOff size={20} />}
              </button>
            )}
            
            <button
              onClick={toggleMirror}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              aria-label={isMirrored ? 'Disable mirror' : 'Enable mirror'}
            >
              <FlipCameraIos size={20} />
            </button>
            
            <button
              onClick={onStop}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
              aria-label="Stop camera preview"
            >
              <StopCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-center space-x-4">
          <button
            onClick={takePhoto}
            className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 hover:bg-white/30 transition-colors flex items-center justify-center"
            aria-label="Take photo"
          >
            <div className="w-12 h-12 rounded-full bg-white"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraPreview;
