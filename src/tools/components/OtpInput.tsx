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
  resendTime = 0
}) => {
  // State to track OTP digits
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  
  // State to track countdown timer
  const [countdown, setCountdown] = useState<number>(resendTime);
  
  // Refs for individual input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Ref for the hidden input used for autofill
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  
  // Initialize refs array based on length
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Focus first input on mount if autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
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
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1].focus();
      }
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
    if (digit && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
    
    // Check if OTP is complete
    const otpValue = newOtp.join('');
    if (otpValue.length === length && onComplete && !newOtp.includes('')) {
      onComplete(otpValue);
    }
  };

  // Handle key press for backspace and arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      // Move to previous field on backspace if current field is empty
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      // Navigate left
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1 && inputRefs.current[index + 1]) {
      // Navigate right
      inputRefs.current[index + 1].focus();
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
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1].focus();
      }
      
      // Trigger onComplete callback
      if (onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* True dtac header with back button and title */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button 
            className="p-2 mr-4"
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="flex items-center">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3d/True_Dtac_Logo.png" alt="true dtac logo" className="h-6" />
        </div>
      </div>
      
      {/* Description text with phone number */}
      <div className="w-full text-left mb-8">
        <p className="text-gray-700 text-lg">
          {description} <span className="font-bold">{phoneNumber}</span>
        </p>
      </div>
      
      {/* OTP Input fields - circular design */}
      <div className="flex justify-center space-x-4 mb-8">
        {Array.from({ length }, (_, index) => (
          <div 
            key={index}
            className="relative w-16 h-16 flex items-center justify-center"
          >
            <input
              type="tel"
              inputMode="numeric"
              maxLength={1}
              ref={el => inputRefs.current[index] = el}
              value={otp[index] || ''}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={disabled}
              className={`
                w-full h-full rounded-full bg-gray-100 
                text-center text-xl font-bold border-none
                focus:outline-none focus:ring-2 focus:ring-blue-500
                disabled:opacity-60 disabled:cursor-not-allowed
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
          <p className="text-gray-700 font-medium">Reference code {referenceCode}</p>
        </div>
      )}
      
      {/* Expiry notice */}
      <div className="text-center mb-2">
        <p className="text-gray-700">This OTP will expire in {expiryTime}</p>
      </div>
      
      {/* Resend timer */}
      <div className="text-center">
        <p className="text-gray-700">
          Didn't receive the OTP? Try again in{' '}
          <span className="text-red-500 font-bold">{countdown}</span> secs
        </p>
      </div>

      {/* Hidden input for autofill */}
      <div className="relative w-0 h-0 overflow-hidden">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          ref={hiddenInputRef}
          onChange={handleHiddenInputChange}
          className="opacity-0 absolute"
        />
      </div>
    </div>
  );
};

export default OtpInput;