/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { UseHumanTracker } from '../viewmodel/useHumanTracker';

export function HumanTrackerView({
  videoRef,
  canvasRef,
  showPose,
  setShowPose,
  showHands,
  setShowHands,
  showPeople,
  setShowPeople,
  status,
}: UseHumanTracker) {
  return (
    <div className={`${TOOL_PANEL_CLASS} relative`}>
      <video ref={videoRef} className="w-full" autoPlay playsInline>
        <track kind="captions" />
      </video>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute top-2 right-2 bg-white/95 rounded-md p-2 space-y-1 text-sm">
        <label htmlFor="pose-toggle" className="flex items-center gap-2">
          <input id="pose-toggle" type="checkbox" checked={showPose} onChange={(e) => setShowPose(e.target.checked)} />
          Pose
        </label>
        <label htmlFor="hand-toggle" className="flex items-center gap-2">
          <input id="hand-toggle" type="checkbox" checked={showHands} onChange={(e) => setShowHands(e.target.checked)} />
          Hands
        </label>
        <label htmlFor="people-toggle" className="flex items-center gap-2">
          <input id="people-toggle" type="checkbox" checked={showPeople} onChange={(e) => setShowPeople(e.target.checked)} />
          People
        </label>
        <div>{status}</div>
      </div>
    </div>
  );
}

export default HumanTrackerView;
