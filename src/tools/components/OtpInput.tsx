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
  title = 'Enter verification code',
  description = 'We sent a code to your phone'
}) => {
  // State to track OTP digits
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  
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
      <h3 className="text-lg font-medium text-center mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      
      <div className="flex flex-col items-center">
        {/* Individual OTP inputs */}
        <div className="flex gap-2 mb-2">
          {Array.from({ length }, (_, index) => (
            <input
              key={index}
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
                w-12 h-12 text-center text-xl font-bold rounded-md border border-gray-300 
                dark:border-gray-600 dark:bg-gray-800 
                focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50
                disabled:opacity-60 disabled:cursor-not-allowed
                ${inputClassName}
              `}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
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
        
        {/* Keyboard selection suggestion UI - Visual aid for users */}
        <div className="mt-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              If suggested, tap the code from your keyboard to auto-fill
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpInput;