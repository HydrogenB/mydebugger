// Design system animation tokens and utilities

/**
 * Animation foundations for the design system
 * 
 * This file provides standardized animation tokens and utilities that can be used
 * across all components in the design system to ensure consistency in motion design.
 * 
 * All animations include support for reduced motion preferences by providing alternative
 * animations or durations that respect user preferences for reduced motion.
 */

// Standard durations in milliseconds
export const durations = {
  instant: 0,
  extraFast: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  extraSlow: 800,
};

// Standard easing functions
export const easings = {
  // Standard easings
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Custom cubic-bezier easings
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  
  // Spring-like easings
  spring: 'cubic-bezier(0.5, 0, 0.1, 1.2)',
  bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// CSS keyframe animations to be used in component classes
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,
  slideInRight: `
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `,
  slideInLeft: `
    @keyframes slideInLeft {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
  `,
  slideInUp: `
    @keyframes slideInUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `,
  slideInDown: `
    @keyframes slideInDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
  `,
  bounceIn: `
    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      70% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
  // Add new tooltip animations with GPU acceleration
  tooltipFadeDown: `
    @keyframes tooltipFadeDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  tooltipFadeUp: `
    @keyframes tooltipFadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  tooltipFadeLeft: `
    @keyframes tooltipFadeLeft {
      from { opacity: 0; transform: translateX(8px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `,
  tooltipFadeRight: `
    @keyframes tooltipFadeRight {
      from { opacity: 0; transform: translateX(-8px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `,
  // Scale animations
  scaleIn: `
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
  scaleOut: `
    @keyframes scaleOut {
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(0.9); opacity: 0; }
    }
  `,
};

// Animation style definitions that can be imported into components
export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease forwards',
  },
  fadeOut: {
    animation: 'fadeOut 0.3s ease forwards',
  },
  slideInRight: {
    animation: 'slideInRight 0.3s ease forwards',
  },
  slideInLeft: {
    animation: 'slideInLeft 0.3s ease forwards',
  },
  slideInUp: {
    animation: 'slideInUp 0.3s ease forwards',
  },
  slideInDown: {
    animation: 'slideInDown 0.3s ease forwards',
  },
  bounceIn: {
    animation: 'bounceIn 0.5s ease forwards',
  },
  spin: {
    animation: 'spin 1s linear infinite',
  },
  pulse: {
    animation: 'pulse 2s ease infinite',
  },
  scaleIn: {
    animation: 'scaleIn 0.3s ease-out forwards',
  },
  scaleOut: {
    animation: 'scaleOut 0.3s ease-in forwards',
  },
};

// Utility function to generate animation classes for Tailwind
export const animationClasses = {
  'animate-fade-in': 'animate-fadeIn',
  'animate-fade-out': 'animate-fadeOut',
  'animate-slide-in-right': 'animate-slideInRight',
  'animate-slide-in-left': 'animate-slideInLeft',
  'animate-slide-in-up': 'animate-slideInUp',
  'animate-slide-in-down': 'animate-slideInDown',
  'animate-bounce-in': 'animate-bounceIn',
  'animate-spin': 'animate-spin',
  'animate-pulse': 'animate-pulse',
  'animate-scale-in': 'animate-scaleIn',
  'animate-scale-out': 'animate-scaleOut',
  'animate-tooltip-fade-down': 'animate-tooltipFadeDown',
  'animate-tooltip-fade-up': 'animate-tooltipFadeUp',
  'animate-tooltip-fade-left': 'animate-tooltipFadeLeft',
  'animate-tooltip-fade-right': 'animate-tooltipFadeRight',
};

/**
 * Guidelines for using animations in components:
 * 
 * 1. Use standard durations and easing functions for consistency
 * 2. Always include motion-reduce alternatives:
 *    - For transitions: motion-reduce:transition-none
 *    - For animations: motion-reduce:animate-none
 *    - For transforms: motion-reduce:transform-none
 * 3. Use GPU-accelerated properties (transform, opacity) for better performance
 * 4. Apply consistent timing across similar interactions:
 *    - Micro-interactions: extraFast (100ms)
 *    - Button feedback: fast (200ms)
 *    - Modal/drawer transitions: normal (300ms)
 *    - Page transitions: slow (500ms)
 * 5. For looping animations, keep them subtle and use longer durations
 * 
 * Example usage:
 * ```tsx
 * // In a component
 * <button className="transition-colors duration-200 motion-reduce:transition-none">Click me</button>
 * <div className="animate-fade-in motion-reduce:animate-none">Animated content</div>
 * ```
 */

// Helpers for building consistent animation strings
export const buildTransition = (properties: string[], duration: number = durations.normal, easing: string = easings.easeInOut): string => {
  return `${properties.join(', ')} ${duration}ms ${easing}`;
};

// Helper to get appropriate duration for reduced motion preferences
export const getReducedMotionDuration = (originalDuration: number): number => {
  // For reduced motion preferences, make all animations faster
  return Math.min(originalDuration, durations.fast);
};