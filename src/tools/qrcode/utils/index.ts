import QRCode from 'qrcode';
import { QRCodeSettings, SavedQRCode } from '../types';

/**
 * Generates a QR code as a data URL
 * @param text The text/link to encode
 * @param settings QR code generation settings
 * @returns A Promise resolving to the generated QR code data URL
 */
export const generateQRCode = async (
  text: string,
  settings: QRCodeSettings
): Promise<string> => {
  try {
    const { size, errorCorrection, darkColor, lightColor } = settings;
    
    const options = {
      errorCorrectionLevel: errorCorrection as QRCode.QRCodeErrorCorrectionLevel,
      type: 'image/png',
      width: size,
      margin: 1,
      color: {
        dark: darkColor,
        light: lightColor
      }
    };
    
    return await QRCode.toDataURL(text, options);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Loads saved QR codes from local storage
 * @returns Array of saved QR codes
 */
export const loadSavedQRCodes = (): SavedQRCode[] => {
  try {
    const savedCodes = localStorage.getItem('savedQRCodes');
    return savedCodes ? JSON.parse(savedCodes) : [];
  } catch (error) {
    console.error('Error loading saved QR codes:', error);
    return [];
  }
};

/**
 * Saves a QR code to local storage
 * @param code The QR code object to save
 */
export const saveQRCode = (code: SavedQRCode): void => {
  try {
    const existingCodes = loadSavedQRCodes();
    const updatedCodes = [code, ...existingCodes];
    localStorage.setItem('savedQRCodes', JSON.stringify(updatedCodes));
  } catch (error) {
    console.error('Error saving QR code:', error);
  }
};

/**
 * Deletes a saved QR code from local storage
 * @param id ID of the QR code to delete
 * @returns Updated array of saved QR codes
 */
export const deleteQRCode = (id: string): SavedQRCode[] => {
  try {
    const existingCodes = loadSavedQRCodes();
    const updatedCodes = existingCodes.filter(code => code.id !== id);
    localStorage.setItem('savedQRCodes', JSON.stringify(updatedCodes));
    return updatedCodes;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return loadSavedQRCodes();
  }
};

/**
 * Saves QR code cosmetic options to local storage
 * @param settings QR code settings to save
 * @param showOptions Whether to show cosmetic options
 */
export const saveCosmeticOptions = (
  settings: QRCodeSettings,
  showOptions: boolean
): void => {
  try {
    const options = {
      ...settings,
      showCosmeticOptions: showOptions
    };
    localStorage.setItem('qrCosmeticOptions', JSON.stringify(options));
  } catch (error) {
    console.error('Error saving cosmetic options:', error);
  }
};

/**
 * Loads saved QR code cosmetic options from local storage
 * @returns Saved QR code settings and UI options
 */
export const loadCosmeticOptions = (): {
  settings: QRCodeSettings;
  showCosmeticOptions: boolean;
} => {
  try {
    const savedOptions = localStorage.getItem('qrCosmeticOptions');
    if (savedOptions) {
      const options = JSON.parse(savedOptions);
      return {
        settings: {
          size: options.size || 256,
          errorCorrection: options.errorCorrection || 'M',
          darkColor: options.darkColor || '#000000',
          lightColor: options.lightColor || '#FFFFFF'
        },
        showCosmeticOptions: options.showCosmeticOptions || false
      };
    }
  } catch (error) {
    console.error('Error loading cosmetic options:', error);
  }
  
  // Return defaults if no saved options or error
  return {
    settings: {
      size: 256,
      errorCorrection: 'M',
      darkColor: '#000000',
      lightColor: '#FFFFFF'
    },
    showCosmeticOptions: false
  };
};
