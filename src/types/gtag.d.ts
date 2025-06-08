// Global declaration for Google Analytics gtag
interface Window {
  gtag?: (
    command: string,
    action: string,
    params?: {
      [key: string]: any;
    }
  ) => void;
}