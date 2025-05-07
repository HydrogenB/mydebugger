import React, { useState, useRef, useEffect } from 'react';

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
  referenceCode?: string;
  expiryTime?: string;
  resendTime?: number;
  autofillHint?: string;
  onResend?: () => void;
}

/**
 * OTP Input component with autofill support
 * Uses autocomplete="one-time-code" to enable browser autofill from SMS
 */
const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  autoFocus = true,
  disabled = false,
  className = '',
  inputClassName = '',
  title = 'OTP Verification',
  description = 'OTP SMS has been sent to',
  phoneNumber = '',
  referenceCode = '',
  expiryTime = '10 minutes',
  resendTime = 0,
  autofillHint = 'one-time-code',
  onResend
}) => {
  // State to track OTP digits
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  
  // State to track countdown timer
  const [countdown, setCountdown] = useState<number>(resendTime);
  
  // Refs for individual input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Ref for the hidden input used for autofill
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

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

  return (
    <div className={`flex flex-col ${className}`}>
      {/* True dtac header with back button and title */}
      <div className="w-full flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            className="p-2 mr-2 text-blue-600"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3d/True_Dtac_Logo.png" alt="true dtac logo" className="h-8" />
        </div>
      </div>
      
      {/* Description text with phone number */}
      <div className="w-full mb-8">
        <p className="text-gray-700 text-lg">
          {description} <span className="font-bold">{phoneNumber}</span>
        </p>
      </div>
      
      {/* OTP Input fields - circular design */}
      <div className="flex justify-center space-x-4 mb-6">
        {Array.from({ length }, (_, index) => (
          <div 
            key={index}
            className="relative w-14 h-14 flex items-center justify-center"
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
                text-center text-xl font-semibold
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
        <div className="text-center mb-2">
          <p className="text-gray-600 font-medium">Reference code {referenceCode}</p>
        </div>
      )}
      
      {/* Expiry notice */}
      <div className="text-center mb-3">
        <p className="text-gray-600">This OTP will expire in {expiryTime}</p>
      </div>
      
      {/* Resend timer/button */}
      <div className="text-center mb-6">
        {countdown > 0 ? (
          <p className="text-gray-700">
            Didn't receive the OTP? Try again in{' '}
            <span className="text-red-500 font-bold">{countdown}</span> secs
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-blue-600 font-medium hover:text-blue-800 focus:outline-none"
            disabled={!onResend}
          >
            Resend OTP
          </button>
        )}
      </div>

      {/* Hidden input for autofill */}
      <div className="relative w-0 h-0 overflow-hidden">
        <input
          type="text"
          inputMode="numeric"
          autoComplete={autofillHint}
          ref={hiddenInputRef}
          onChange={handleHiddenInputChange}
          className="opacity-0 absolute"
        />
      </div>
    </div>
  );
};

export default OtpInput;