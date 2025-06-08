/**
 * Helper utilities for authentication setup
 */

export const getBaseUrl = () => {
  // Check if we're in the browser and get the base URL from window
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // For Vercel preview environments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For local development
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Default fallback
  return 'http://localhost:3000';
};

export const getAuthUrl = (path = '') => {
  return `${getBaseUrl()}${path}`;
};
