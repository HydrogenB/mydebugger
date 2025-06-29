/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createHandModel,
  loadPeopleModel,
  loadPoseModel,
  detectFrame,
  HumanModels,
  DetectionResult,
} from '../model/humanTracker';

export interface UseHumanTracker {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  showPose: boolean;
  setShowPose: (v: boolean) => void;
  showHands: boolean;
  setShowHands: (v: boolean) => void;
  showPeople: boolean;
  setShowPeople: (v: boolean) => void;
  status: string;
}

const useHumanTracker = (): UseHumanTracker => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showPose, setShowPose] = useState(true);
  const [showHands, setShowHands] = useState(true);
  const [showPeople, setShowPeople] = useState(true);
  const [status, setStatus] = useState('Loading models...');
  const modelsRef = useRef<HumanModels>({});

  const loop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!video || !canvas || !ctx) return;
    const res: DetectionResult = await detectFrame(video, modelsRef.current);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (showPeople && res.people) {
      ctx.strokeStyle = 'lime';
      ctx.lineWidth = 2;
      res.people.forEach((p) => {
        const [x, y, w, h] = p.bbox;
        ctx.strokeRect(x, y, w, h);
      });
    }
    if (showPose && res.pose) {
      ctx.fillStyle = 'cyan';
      res.pose.keypoints.forEach((k) => {
        if (k.score && k.score > 0.5) {
          ctx.fillRect(k.position.x - 2, k.position.y - 2, 4, 4);
        }
      });
    }
    if (showHands && res.hands) {
      ctx.fillStyle = 'magenta';
      res.hands.forEach((landmarks) => {
        landmarks.forEach((pt) => {
          ctx.fillRect(
            pt.x * canvas.width - 2,
            pt.y * canvas.height - 2,
            4,
            4,
          );
        });
      });
    }
    requestAnimationFrame(loop);
  }, [showPeople, showPose, showHands]);

useEffect(() => {
    let active = true;
    (async () => {
      const [pose, people] = await Promise.all([
        loadPoseModel(),
        loadPeopleModel(),
      ]);
      const hands = createHandModel(
        (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      );
      modelsRef.current = { pose, people, hands };
      if (!active) return;
      setStatus('Requesting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('Running');
      requestAnimationFrame(loop);
    })();
    return () => {
      active = false;
    };
  }, [loop]);

  return {
    videoRef,
    canvasRef,
    showPose,
    setShowPose,
    showHands,
    setShowHands,
    showPeople,
    setShowPeople,
    status,
  };
};

export default useHumanTracker;
