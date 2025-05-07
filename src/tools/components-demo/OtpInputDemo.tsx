import React, { useState } from 'react';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';

// Temporary placeholder components for components not yet migrated to the design system
type OtpType = 'sms' | 'email' | 'app' | 'generic';

// Placeholder OtpInput component
const OtpInput = ({ length = 6, onComplete, title, phoneNumber, emailAddress, referenceCode, expiryTime, resendTime, className = "", inputClassName = "", autofillHint = "one-time-code", onResend, compact = false, showHeader = true, otpType = "sms" }) => (
  <div className={className}>
    <div className={`text-center ${compact ? 'mb-3' : 'mb-6'}`}>
      {showHeader && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
      <p className="text-sm text-gray-600">
        {otpType === 'sms' && phoneNumber && `A verification code has been sent to ${phoneNumber}`}
        {otpType === 'email' && emailAddress && `A verification code has been sent to ${emailAddress}`}
        {otpType === 'app' && 'Enter the code from your authenticator app'}
        {otpType === 'generic' && 'Enter your verification code'}
      </p>
    </div>
    <div className="flex justify-center gap-2 my-4">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          className={`w-10 h-12 text-center border border-gray-300 rounded-md ${inputClassName}`}
          maxLength={1}
          onChange={(e) => {
            if (e.target.value && e.target.nextElementSibling) {
              (e.target.nextElementSibling as HTMLElement).focus();
            }
          }}
        />
      ))}
    </div>
    <div className="text-center mt-4">
      <button 
        className="text-blue-600 text-sm"
        onClick={onResend}
      >
        Resend Code
      </button>
    </div>
  </div>
);

// Placeholder TextInput component
const TextInput = ({ value, onChange, placeholder, fullWidth }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`border border-gray-300 rounded-md px-3 py-2 ${fullWidth ? 'w-full' : ''}`}
  />
);

// Placeholder Switch component
const Switch = ({ checked, onChange, label = "" }) => (
  <button 
    className={`w-10 h-5 relative rounded-full ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
    onClick={() => onChange(!checked)}
  >
    <span 
      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${checked ? 'translate-x-5' : ''}`}
    />
    {label && <span className="ml-2">{label}</span>}
  </button>
);

// Placeholder InfoBox component
const InfoBox = ({ title, variant = "info", children }) => (
  <div className={`p-4 rounded-md ${variant === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'} border`}>
    <h4 className="font-medium mb-1">{title}</h4>
    <div className="text-sm">{children}</div>
  </div>
);

/**
 * Demo page for OTP input component with autofill functionality
 */
const OtpInputDemo: React.FC = () => {
  const [otpValue, setOtpValue] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [autofillHint, setAutofillHint] = useState<string>('one-time-code');
  const [phoneNumber, setPhoneNumber] = useState<string>('0945656671');
  const [emailAddress, setEmailAddress] = useState<string>('user@example.com');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [otpType, setOtpType] = useState<OtpType>('sms');
  
  // Reset demo state
  const handleReset = () => {
    setOtpValue('');
    setIsVerified(false);
    setIsVerifying(false);
    setShowSuccessMessage(false);
  };
  
  // Handle OTP verification demo
  const handleVerify = () => {
    if (!otpValue || otpValue.length !== 6) {
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate API verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setShowSuccessMessage(true);
    }, 1500);
  };

  // Handle simulated resend
  const handleResend = () => {
    // Show a brief message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Get contact info based on selected OTP type
  const getContactInfo = () => {
    switch(otpType) {
      case 'sms': return phoneNumber;
      case 'email': return emailAddress;
      default: return '';
    }
  };
  
  return (
    <Card title="OTP Auto-Fill Demo" isElevated>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-medium mb-5">OTP Verification</h3>
            
            {/* Device frame */}
            <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
              {/* Phone status bar */}
              <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                <div>11:48</div>
                <div className="flex items-center gap-2">
                  <span>57%</span>
                </div>
              </div>
              
              {/* OTP UI */}
              <div className="p-5">
                <OtpInput
                  length={6}
                  onComplete={setOtpValue}
                  title={`${otpType.toUpperCase()} Verification`}
                  phoneNumber={phoneNumber}
                  emailAddress={emailAddress}
                  referenceCode="eTGqx"
                  expiryTime="10 minutes"
                  resendTime={11}
                  className="w-full"
                  inputClassName="bg-gray-50"
                  autofillHint={autofillHint}
                  onResend={handleResend}
                  compact={isCompact}
                  showHeader={showHeader}
                  otpType={otpType}
                />
              </div>
            </div>
            
            {/* Demo controls section */}
            {showSuccessMessage && (
              <div className="mt-4 mb-2">
                <InfoBox 
                  title={isVerified ? "Verification Successful" : "Code Resent"} 
                  variant="success"
                >
                  {isVerified 
                    ? "The verification code has been successfully verified." 
                    : `A new verification code has been sent to your ${otpType === 'email' ? 'email' : 'phone'}.`}
                </InfoBox>
              </div>
            )}
            
            <div className="flex mt-4 gap-3 justify-center">
              <Button 
                variant="outline-primary"
                onClick={handleReset}
                disabled={isVerifying}
              >
                Reset Demo
              </Button>

              <Button
                onClick={handleVerify}
                isLoading={isVerifying}
                loadingText="Verifying..."
                disabled={!otpValue || otpValue.length !== 6 || isVerified}
              >
                {isVerified ? 'Verified' : 'Verify Code'}
              </Button>
            </div>
          </div>
          
          {/* Right Column - Settings and Info */}
          <div>
            <h3 className="text-xl font-medium mb-4">OTP Settings & Information</h3>
            
            {/* OTP type selection */}
            <div className="bg-white rounded-lg p-5 border border-gray-200 mb-6">
              <h4 className="font-medium text-gray-700 mb-4">OTP Type</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                  className={`px-4 py-2 rounded-md flex flex-col items-center justify-center ${otpType === 'sms' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200'} border`}
                  onClick={() => setOtpType('sms')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v10h14V5H4zm3 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
                  </svg>
                  <span className="text-sm">SMS</span>
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-md flex flex-col items-center justify-center ${otpType === 'email' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200'} border`}
                  onClick={() => setOtpType('email')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-sm">Email</span>
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-md flex flex-col items-center justify-center ${otpType === 'app' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200'} border`}
                  onClick={() => setOtpType('app')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0A7 7 0 003.636 6.91L3.9 7.35A1 1 0 012.05 8.14l-1.8-3.2a1 1 0 011.41-1.3l3.2 1.8a1 1 0 01.14 1.85l-.44.26z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 2a8 8 0 108 8 1 1 0 112 0A10 10 0 110 10a1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">App</span>
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-md flex flex-col items-center justify-center ${otpType === 'generic' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-600 border-gray-200'} border`}
                  onClick={() => setOtpType('generic')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Generic</span>
                </button>
              </div>
            </div>
            
            {/* Autofill test controls */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mb-6">
              <h4 className="font-medium text-gray-700 mb-4 text-lg">Settings</h4>
              
              <div className="grid grid-cols-1 gap-4 divide-y divide-gray-200">
                {/* Phone or email input based on type */}
                <div className="pb-3">
                  {otpType === 'email' ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <TextInput
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="Enter email address"
                        fullWidth
                      />
                    </>
                  ) : otpType === 'sms' ? (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <TextInput
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                        fullWidth
                      />
                    </>
                  ) : null}
                </div>
                
                <div className="py-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Autofill Hint
                  </label>
                  <select
                    value={autofillHint}
                    onChange={(e) => setAutofillHint(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="one-time-code">one-time-code</option>
                    <option value="sms-otp">sms-otp</option>
                    <option value="otp">otp</option>
                    <option value="one-time-password">one-time-password</option>
                    <option value="verification-code">verification-code</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Different browsers may support different autofill hint values
                  </p>
                </div>
                
                {/* Display options */}
                <div className="py-3 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Compact Mode</span>
                    <Switch 
                      checked={isCompact} 
                      onChange={setIsCompact}
                      label=""
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Show Header</span>
                    <Switch 
                      checked={showHeader} 
                      onChange={setShowHeader}
                      label=""
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Implementation details section */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h4 className="font-medium text-gray-800 mb-3">Sample Usage</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto">
{`<OtpInput
  length={6}
  onComplete={(code) => console.log(code)}
  ${otpType === 'sms' ? `phoneNumber="${phoneNumber}"` :
    otpType === 'email' ? `emailAddress="${emailAddress}"` : ''}
  referenceCode="eTGqx"
  resendTime={60}
  autofillHint="${autofillHint}"
  compact={${isCompact}}
  showHeader={${showHeader}}
  otpType="${otpType}"
  onResend={() => console.log('Resending code')}
/>`}
              </pre>
              
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Next.js Implementation</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This component uses the Web OTP API standard for automatic code filling from 
                  SMS. The hidden input with <code>autoComplete="{autofillHint}"</code> enables 
                  the browser to suggest the verification code from messages.
                </p>
                
                <div className="bg-amber-50 rounded-md p-3 mb-3">
                  <h5 className="font-medium text-amber-800 mb-1 text-sm">SMS Format for Auto-detection</h5>
                  <p className="text-xs text-amber-700">
                    For best results with browsers that support WebOTP, format your SMS messages like this:
                  </p>
                  <pre className="bg-amber-100 rounded p-2 text-xs mt-1 text-amber-800 overflow-x-auto">
                    Your verification code is: 123456
                    
                    @example.com #123456
                  </pre>
                </div>
                
                <div className="bg-blue-50 rounded-md p-3">
                  <h5 className="font-medium text-blue-800 mb-1 text-sm">Next.js Compliance</h5>
                  <p className="text-xs text-blue-700">
                    This implementation follows Next.js best practices for form components, including 
                    proper accessibility attributes, controlled inputs, and React state management.
                    For server-side rendering, the component properly handles hydration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OtpInputDemo;