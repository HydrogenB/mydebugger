/**
 * QR Code Tool Type Definitions
 */

/**
 * Represents a saved QR code configuration
 */
export interface SavedQRCode {
  id: string;
  url: string;
  nickname: string;
  createdAt: number;
  qrCodeUrl: string;
  settings: QRCodeSettings;
}

/**
 * Configuration settings for QR code generation
 */
export interface QRCodeSettings {
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  darkColor: string;
  lightColor: string;
}

/**
 * Props for the QRCodeGenerator component
 */
export interface QRCodeGeneratorProps {
  initialLink?: string;
}
