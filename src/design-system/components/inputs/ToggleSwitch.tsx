/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';

export interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
}

/**
 * ToggleSwitch - Accessible toggle component styled as a switch.
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  className = '',
}) => {
  const buttonClasses = `relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
    checked ? 'bg-primary-600' : 'bg-gray-200'
  }`;
  const circleClasses = `inline-block h-4 w-4 transform rounded-full bg-white transition ${
    checked ? 'translate-x-5' : 'translate-x-1'
  }`;
  return (
    <label htmlFor={id} className={`inline-flex items-center gap-2 cursor-pointer ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={buttonClasses}
      >
        <span className={circleClasses} />
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
};

export default ToggleSwitch;
