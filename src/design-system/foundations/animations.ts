// Design system animation tokens and utilities

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
};