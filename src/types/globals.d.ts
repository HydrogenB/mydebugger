// Types for global objects and custom properties
// This file adds type definitions for things that aren't covered by the default TypeScript types

// Environment variable types
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_NAME: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_VERSION: string;
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_ENABLE_BETA_FEATURES: string;
    NEXT_PUBLIC_DISABLE_ANALYTICS: string;
  }
}

// Window object extensions
interface Window {
  // Add any custom properties on the window object
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}

// Image types for Next.js
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.gif' {
  const content: any;
  export default content;
}

declare module '*.webp' {
  const content: any;
  export default content;
}

// CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
