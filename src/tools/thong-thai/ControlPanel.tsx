/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Card } from '../../design-system/components/layout';
import { Button, TextInput, SelectInput } from '../../design-system/components/inputs';

export interface LabelMap {
  title: string;
  description: string;
  size: string;
  width: string;
  height: string;
  wave: string;
  amplitude: string;
  wavelength: string;
  speed: string;
  bg: string;
  colorsLabel: string;
  stripeTop: string;
  stripeUpper: string;
  stripeCenter: string;
  stripeLower: string;
  stripeBottom: string;
  preview: string;
  animate: string;
  pause: string;
  exportSection: string;
  exportPng: string;
  exportWebm: string;
  stop: string;
  download: string;
  seconds: string;
  fps: string;
}

export interface Option {
  value: string;
  label: string;
}

interface ControlPanelProps {
  labels: LabelMap;
  // Dimension & display
  width: number;
  height: number;
  bgColor: string;
  pixelRatio: number;
  onWidthChange: (v: string) => void;
  onHeightChange: (v: string) => void;
  onBgChange: (v: string) => void;
  onPixelRatioChange: (v: string) => void;

  // Wave
  amplitude: number;
  wavelength: number;
  speed: number;
  isAnimating: boolean;
  onAmplitudeChange: (v: string) => void;
  onWavelengthChange: (v: string) => void;
  onSpeedChange: (v: string) => void;
  onToggleAnimate: () => void;

  // Colors
  colors: string[];
  colorOptions: Option[];
  onUpdateColor: (index: number, value: string) => void;

  // Export
  onPngExport: () => void;
  isRecording: boolean;
  recordDuration: number;
  recordFps: number;
  onRecordDurationChange: (v: string) => void;
  onRecordFpsChange: (v: string) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  labels,
  width,
  height,
  bgColor,
  pixelRatio,
  onWidthChange,
  onHeightChange,
  onBgChange,
  onPixelRatioChange,
  amplitude,
  wavelength,
  speed,
  isAnimating,
  onAmplitudeChange,
  onWavelengthChange,
  onSpeedChange,
  onToggleAnimate,
  colors,
  colorOptions,
  onUpdateColor,
  onPngExport,
  isRecording,
  recordDuration,
  recordFps,
  onRecordDurationChange,
  onRecordFpsChange,
  onStartRecording,
  onStopRecording,
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <Card title={labels.size} isElevated>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <TextInput label={labels.width} value={String(width)} onChange={(e) => onWidthChange(e.target.value)} type="number" min={64} max={4096} />
          </div>
          <div>
            <TextInput label={labels.height} value={String(height)} onChange={(e) => onHeightChange(e.target.value)} type="number" min={64} max={4096} />
          </div>
          <div>
            <TextInput label={labels.bg} value={bgColor} onChange={(e) => onBgChange(e.target.value)} type="text" />
          </div>
          <div>
            <SelectInput
              label="Pixel Ratio"
              value={String(pixelRatio)}
              onChange={(e) => onPixelRatioChange(e.target.value)}
              options={[
                { value: '1', label: '1x' },
                { value: '2', label: '2x' },
                { value: '3', label: '3x' },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card title={labels.wave} isElevated>
        <div className="grid grid-cols-2 gap-3">
          <TextInput label={labels.amplitude} value={String(amplitude)} onChange={(e) => onAmplitudeChange(e.target.value)} type="number" min={0} max={200} />
          <TextInput label={labels.wavelength} value={String(wavelength)} onChange={(e) => onWavelengthChange(e.target.value)} type="number" min={10} max={2000} />
          <TextInput label={labels.speed} value={String(speed)} onChange={(e) => onSpeedChange(e.target.value)} type="number" step="0.0005" min={0} max={0.05} />
          <div className="flex items-end">
            <Button variant="primary" onClick={onToggleAnimate}>
              {isAnimating ? labels.pause : labels.animate}
            </Button>
          </div>
        </div>
      </Card>

      <Card title={labels.colorsLabel} isElevated>
        <div className="grid grid-cols-1 gap-3">
          <SelectInput label={`${labels.stripeTop}`} value={colors[0]} onChange={(e) => onUpdateColor(0, e.target.value)} options={colorOptions} />
          <SelectInput label={`${labels.stripeUpper}`} value={colors[1]} onChange={(e) => onUpdateColor(1, e.target.value)} options={colorOptions} />
          <SelectInput label={`${labels.stripeCenter}`} value={colors[2]} onChange={(e) => onUpdateColor(2, e.target.value)} options={colorOptions} />
          <SelectInput label={`${labels.stripeLower}`} value={colors[3]} onChange={(e) => onUpdateColor(3, e.target.value)} options={colorOptions} />
          <SelectInput label={`${labels.stripeBottom}`} value={colors[4]} onChange={(e) => onUpdateColor(4, e.target.value)} options={colorOptions} />
        </div>
      </Card>

      <Card title={labels.exportSection} isElevated>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onPngExport}>{labels.exportPng}</Button>
          </div>
          <div className="grid grid-cols-3 gap-2 items-end">
            <TextInput label={`${labels.fps}`} value={String(recordFps)} onChange={(e) => onRecordFpsChange(e.target.value)} type="number" min={10} max={60} />
            <TextInput label={`${labels.seconds}`} value={String(recordDuration)} onChange={(e) => onRecordDurationChange(e.target.value)} type="number" min={1} max={30} />
            <div className="flex gap-2">
              {!isRecording && (
                <Button variant="primary" onClick={onStartRecording}>{labels.exportWebm}</Button>
              )}
              {isRecording && (
                <Button variant="warning" onClick={onStopRecording}>{labels.stop}</Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ControlPanel;
