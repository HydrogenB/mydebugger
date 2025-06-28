/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { ToggleSwitch } from '../src/design-system/components/inputs';
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
        <ToggleSwitch id="pose-toggle" checked={showPose} onChange={setShowPose} label="Pose" />
        <ToggleSwitch id="hand-toggle" checked={showHands} onChange={setShowHands} label="Hands" />
        <ToggleSwitch id="people-toggle" checked={showPeople} onChange={setShowPeople} label="People" />
        <div>{status}</div>
      </div>
    </div>
  );
}

export default HumanTrackerView;
