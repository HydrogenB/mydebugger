/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Camera Preview Component - Live camera feed with FPS counter
 */
import React, { useEffect, useRef, useState } from 'react';
import { MdStopCircle } from 'react-icons/md';

interface CameraPreviewProps {
  stream: MediaStream;
  onStop: () => void;
}

function CameraPreview({ stream, onStop }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return undefined;

    video.srcObject = stream;
    video.play().catch(() => {
      // Ignore play errors - they're common in tests
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
      
      requestAnimationFrame(updateFps);
    };
    
    const animationId = requestAnimationFrame(updateFps);

    return () => {
      cancelAnimationFrame(animationId);
      if (video.srcObject) {
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

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full max-w-[240px] h-[180px] object-cover"
        autoPlay
        muted
        playsInline
      />
      
      {/* FPS Counter Overlay */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {fps} FPS
      </div>
      
      {/* Stop Button */}
      <div className="absolute top-2 right-2">
        <button
          type="button"
          onClick={onStop}
          className="bg-red-500/80 hover:bg-red-600/80 text-white p-1 rounded transition-colors"
        >
          <MdStopCircle className="w-4 h-4" />
        </button>
      </div>
      
      {/* Video Info */}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {stream.getVideoTracks()[0]?.label || 'Unknown Camera'}
      </div>
    </div>
  );
}

export default CameraPreview;
