import React, { useState, useRef, useEffect } from 'react';

export type OtpType = 'sms' | 'email' | 'app' | 'generic';

export interface OtpInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  title?: string;
  description?: string;
  phoneNumber?: string;
  emailAddress?: string;
  referenceCode?: string;
  expiryTime?: string;
  resendTime?: number;
  autofillHint?: string;
  onResend?: () => void;
  compact?: boolean;
  showHeader?: boolean;
  otpType?: OtpType;
}

/**
 * OTP Input component with autofill support
 * Uses autocomplete attributes to enable browser autofill based on OTP type
 * Compliant with Next.js best practices and WebOTP API standards
 */
const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  autoFocus = true,
  disabled = false,
  className = '',
  inputClassName = '',
  title = 'Verification Code',
  description = '',
  phoneNumber = '',
  emailAddress = '',
  referenceCode = '',
  expiryTime = '10 minutes',
  resendTime = 0,
  autofillHint,
  onResend,
  compact = false,
  showHeader = true,
  otpType = 'sms'
}) => {
  // State to track OTP digits
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  
  // State to track countdown timer
  const [countdown, setCountdown] = useState<number>(resendTime);
  
  // Refs for individual input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Ref for the hidden input used for autofill
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  // Determine the appropriate autofill hint based on OTP type if not explicitly provided
  const effectiveAutofillHint = autofillHint || (
    otpType === 'sms' ? 'one-time-code' :
    otpType === 'email' ? 'one-time-code email' : 
    'one-time-code'
  );

  // Determine the contact information based on OTP type
  const contactInfo = 
    otpType === 'sms' ? phoneNumber :
    otpType === 'email' ? emailAddress :
    otpType === 'app' ? 'your authenticator app' : '';
  
  // Determine description text based on OTP type if not provided
  const effectiveDescription = description || (
    otpType === 'sms' ? 'Verification code sent to' :
    otpType === 'email' ? 'Verification code sent to' :
    otpType === 'app' ? 'Enter the code from your authenticator app' :
    'Enter verification code'
  );

  // Helper function to safely focus an input element
  const safelyFocusInput = (index: number) => {
    const inputElement = inputRefs.current[index];
    if (inputElement) {
      inputElement.focus();
    }
  };
  
  // Initialize refs array based on length
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Focus first input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      safelyFocusInput(0);
    }
  }, [autoFocus]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle hidden input change for autofill
  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // If value appears to be an OTP (numeric and proper length)
    if (value.length === length && /^\d+$/.test(value)) {
      const otpArray = value.split('');
      setOtp(otpArray);
      
      // Trigger onComplete callback with the full OTP
      if (onComplete) {
        onComplete(value);
      }
      
      // Focus last input to give visual feedback
      safelyFocusInput(length - 1);
    }
  };

  // Handle change in individual inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Allow only one character per input
    const digit = value.slice(-1);
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Auto advance to next input if a character was entered
    if (digit && index < length - 1) {
      safelyFocusInput(index + 1);
    }
    
    // Check if OTP is complete
    const otpValue = newOtp.join('');
    if (otpValue.length === length && onComplete && !newOtp.includes('')) {
      onComplete(otpValue);
    }
  };

  // Handle key press for backspace and arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous field on backspace if current field is empty
      safelyFocusInput(index - 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Navigate left
      safelyFocusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // Navigate right
      safelyFocusInput(index + 1);
    }
  };

  // Handle paste for the entire OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data matches expected OTP format
    if (pastedData.length === length && /^\d+$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      setOtp(otpArray);
      
      // Focus last input
      safelyFocusInput(length - 1);
      
      // Trigger onComplete callback
      if (onComplete) {
        onComplete(pastedData);
      }
    }
  };
  
  // Handle resend click
  const handleResend = () => {
    if (countdown > 0 || !onResend) return;
    
    if (onResend) {
      onResend();
      setCountdown(resendTime); // Reset countdown
    }
  };

  // Calculate input field size based on compact mode
  const inputSize = compact ? 'w-12 h-12' : 'w-14 h-14';
  const spacing = compact ? 'space-x-2' : 'space-x-4';
  const fontSize = compact ? 'text-lg' : 'text-xl';

  // OTP input type icon based on otpType
  const getOtpTypeIcon = () => {
    switch (otpType) {
      case 'sms':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v10h14V5H4zm3 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
          </svg>
        );
      case 'email':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        );
      case 'app':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0A7 7 0 003.636 6.91L3.9 7.35A1 1 0 012.05 8.14l-1.8-3.2a1 1 0 011.41-1.3l3.2 1.8a1 1 0 01.14 1.85l-.44.26z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 2a8 8 0 108 8 1 1 0 112 0A10 10 0 110 10a1 1 0 012 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with back button and title - only shown when showHeader is true */}
      {showHeader && (
        <div className="w-full flex items-center mb-6">
          <div className="flex items-center">
            <button 
              className="p-2 mr-2 text-blue-600"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-600 p-1.5 rounded-full mr-2">
                {getOtpTypeIcon()}
              </span>
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            </div>
          </div>
        </div>
      )}
      
      {/* Description text with contact info */}
      <div className={`w-full ${compact ? 'mb-4' : 'mb-8'}`}>
        <p className={`text-gray-700 ${compact ? 'text-base' : 'text-lg'}`}>
          {effectiveDescription} {contactInfo && (
            <span className="font-bold">{contactInfo}</span>
          )}
        </p>
      </div>
      
      {/* OTP Input fields - circular design */}
      <div className={`flex justify-center ${spacing} ${compact ? 'mb-4' : 'mb-6'}`}>
        {Array.from({ length }, (_, index) => (
          <div 
            key={index}
            className={`relative ${inputSize} flex items-center justify-center`}
          >
            <input
              type="tel"
              inputMode="numeric"
              maxLength={1}
              pattern="[0-9]*"
              ref={el => inputRefs.current[index] = el}
              value={otp[index] || ''}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={disabled}
              className={`
                w-full h-full rounded-full bg-gray-50 border border-gray-200
                text-center ${fontSize} font-semibold
                focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-sm
                ${inputClassName}
              `}
              aria-label={`Digit ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {/* Reference code */}
      {referenceCode && (
        <div className={`text-center ${compact ? 'mb-1' : 'mb-2'}`}>
          <p className={`text-gray-600 font-medium ${compact ? 'text-sm' : ''}`}>Reference code {referenceCode}</p>
        </div>
      )}
      
      {/* Expiry notice */}
      {expiryTime && (
        <div className={`text-center ${compact ? 'mb-2' : 'mb-3'}`}>
          <p className={`text-gray-600 ${compact ? 'text-sm' : ''}`}>This code will expire in {expiryTime}</p>
        </div>
      )}
      
      {/* Resend timer/button */}
      {onResend && (
        <div className={`text-center ${compact ? 'mb-4' : 'mb-6'}`}>
          {countdown > 0 ? (
            <p className={`text-gray-700 ${compact ? 'text-sm' : ''}`}>
              Didn't receive the code? Try again in{' '}
              <span className="text-red-500 font-bold">{countdown}</span> secs
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 font-medium hover:text-blue-800 focus:outline-none"
            >
              Resend code
            </button>
          )}
        </div>
      )}

      {/* Hidden input for autofill */}
      <div className="relative w-0 h-0 overflow-hidden">
        <input
          type="text"
          inputMode="numeric"
          autoComplete={effectiveAutofillHint}
          ref={hiddenInputRef}
          onChange={handleHiddenInputChange}
          className="opacity-0 absolute"
        />
      </div>
    </div>
  );
};

export default OtpInput;