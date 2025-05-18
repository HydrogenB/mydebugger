import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSettings, SavedQRCode } from '../types';
import {
  generateQRCode,
  loadSavedQRCodes,
  saveQRCode,
  deleteQRCode,
  saveCosmeticOptions,
  loadCosmeticOptions
} from '../utils';

/**
 * Custom hook for QR Code generator functionality
 */
export const useQRCodeGenerator = (initialLinkParam?: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract link from URL if not provided directly
  const searchParams = new URLSearchParams(location.search);
  const initialLink = initialLinkParam || searchParams.get('link') || '';
  
  // Form input state
  const [input, setInput] = useState<string>('');
  const [encodedLink, setEncodedLink] = useState<string>('');
  
  // QR Code settings
  const [settings, setSettings] = useState<QRCodeSettings>({
    size: 256,
    errorCorrection: 'M' as 'L' | 'M' | 'Q' | 'H',
    darkColor: '#000000',
    lightColor: '#FFFFFF'
  });
  
  // UI state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isRunningLink, setIsRunningLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showCosmeticOptions, setShowCosmeticOptions] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Collection related state
  const [savedQRCodes, setSavedQRCodes] = useState<SavedQRCode[]>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>('');
  
  // Large QR code modal state
  const [showLargeQRModal, setShowLargeQRModal] = useState<boolean>(false);

  /**
   * Handles form input changes
   */
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);
  
  /**
   * Updates QR code settings
   */
  const updateSettings = useCallback((newSettings: Partial<QRCodeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveCosmeticOptions(updated, showCosmeticOptions);
      return updated;
    });
  }, [showCosmeticOptions]);
  
  /**
   * Toggles cosmetic options visibility
   */
  const toggleCosmeticOptions = useCallback(() => {
    setShowCosmeticOptions(prev => {
      const newValue = !prev;
      saveCosmeticOptions(settings, newValue);
      return newValue;
    });
  }, [settings]);

  /**
   * Generates a QR code from the current input
   */
  const handleGenerateQRCode = useCallback(async () => {
    if (!input.trim()) return;
    
    try {
      // Update URL with the current link parameter
      const params = new URLSearchParams(location.search);
      params.set('link', input);
      navigate({ search: params.toString() }, { replace: true });
      
      // Generate encoded link for display
      setEncodedLink(input);
      
      // Generate QR code
      const qrCodeData = await generateQRCode(input, settings);
      setQrCodeUrl(qrCodeData);
      
      // Update history state
      window.history.replaceState(
        { ...window.history.state, qrcode: { link: input } },
        '',
        window.location.href
      );
    } catch (error) {
      console.error('Error generating QR code:', error);
      showToast('Failed to generate QR code');
    }
  }, [input, settings, location.search, navigate]);
  
  /**
   * Saves the current QR code
   */
  const handleSaveQRCode = useCallback(() => {
    if (!qrCodeUrl || !encodedLink) return;
    
    const newCode: SavedQRCode = {
      id: Date.now().toString(),
      url: encodedLink,
      nickname: nickname || encodedLink.substring(0, 30),
      createdAt: Date.now(),
      qrCodeUrl,
      settings: { ...settings }
    };
    
    saveQRCode(newCode);
    setSavedQRCodes(prev => [newCode, ...prev]);
    setShowSaveModal(false);
    setNickname('');
    showToast('QR Code saved successfully');
  }, [qrCodeUrl, encodedLink, nickname, settings]);
  
  /**
   * Deletes a saved QR code
   */
  const handleDeleteQRCode = useCallback((id: string) => {
    const updatedCodes = deleteQRCode(id);
    setSavedQRCodes(updatedCodes);
    showToast('QR Code deleted');
  }, []);
  
  /**
   * Displays a toast message
   */
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // Initialize with URL params and saved options
  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    
    // Load saved cosmetic options
    const { settings: savedSettings, showCosmeticOptions: savedShowOptions } = loadCosmeticOptions();
    setSettings(savedSettings);
    setShowCosmeticOptions(savedShowOptions);
    
    // Load saved QR codes
    setSavedQRCodes(loadSavedQRCodes());
    
    // Handle URL query parameter for link
    if (initialLink) {
      try {
        // First try to decode the URL in case it's already URL encoded
        const decodedLink = decodeURIComponent(initialLink);
        
        // Ensure the link has a valid protocol
        try {
          new URL(decodedLink);
          setInput(decodedLink);
        } catch {
          // If no protocol, add https:// prefix
          setInput(`https://${decodedLink}`);
        }
      } catch (e) {
        setInput(initialLink);
      }
    }
  }, [initialLink]);
  
  // Generate QR code when input changes and settings
  useEffect(() => {
    if (input) {
      handleGenerateQRCode();
    }
  }, [input, settings, handleGenerateQRCode]);

  return {
    // State
    input,
    encodedLink,
    settings,
    qrCodeUrl,
    isRunningLink,
    toastMessage,
    showCosmeticOptions,
    isMobile,
    savedQRCodes,
    showSaveModal,
    nickname,
    showLargeQRModal,
    
    // Actions
    setInput: handleInputChange,
    updateSettings,
    toggleCosmeticOptions,
    generateQRCode: handleGenerateQRCode,
    saveQRCode: handleSaveQRCode,
    deleteQRCode: handleDeleteQRCode,
    setShowSaveModal,
    setNickname,
    setShowLargeQRModal,
    setIsRunningLink,
    showToast
  };
};
