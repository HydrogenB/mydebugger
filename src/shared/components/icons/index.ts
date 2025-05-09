import React from 'react';
import {
  HiCheckCircle,
  HiChevronDown, // Changed from HiChevronUpDown
  HiPlusCircle,
  HiShieldCheck,
  HiDocumentReport,
  HiMenuAlt3,
  HiCode
} from 'react-icons/hi';

// Icon component props interface
interface IconProps {
  className?: string;
}

// Helper function to create SVG icon components without JSX
function createIconComponent(pathD: string) {
  return function IconComponent({ className = '' }: IconProps) {
    return React.createElement(
      'svg', 
      { 
        xmlns: 'http://www.w3.org/2000/svg', 
        viewBox: '0 0 24 24', 
        fill: 'none', 
        stroke: 'currentColor', 
        className: className 
      },
      React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 1.5,
        d: pathD
      })
    );
  };
}

// Re-export with your component names
export const CheckCircleIcon = HiCheckCircle;
export const ChevronUpDownIcon = HiChevronDown; // Changed from HiChevronUpDown
export const PlusCircleIcon = HiPlusCircle;
export const ShieldCheckIcon = HiShieldCheck;
export const DocumentReportIcon = HiDocumentReport;
export const MenuIcon = HiMenuAlt3;
export const CodeIcon = HiCode;

// Add any additional icons you need
