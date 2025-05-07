import React, { useState } from 'react';
import Card from '../components/Card';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import InfoBox from '../components/InfoBox';
import TextInput from '../components/TextInput';

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
  
  return (
    <Card title="OTP Auto-Fill Demo" isElevated>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-medium mb-4">True dtac OTP Verification</h3>
            
            {/* Device frame */}
            <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
              {/* Phone status bar */}
              <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                <div>11:48</div>
                <div className="flex items-center gap-2">
                  <span>57%</span>
                </div>
              </div>
              
              {/* True dtac OTP UI */}
              <div className="p-5">
                <OtpInput
                  length={6}
                  onComplete={setOtpValue}
                  title="OTP Verification"
                  description="OTP SMS has been sent to"
                  phoneNumber={phoneNumber}
                  referenceCode="eTGqx"
                  expiryTime="10 minutes"
                  resendTime={11}
                  className="w-full"
                  inputClassName="bg-gray-50"
                  autofillHint={autofillHint}
                  onResend={handleResend}
                />
              </div>
            </div>
            
            {/* Autofill test controls */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Autofill Testing Controls</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <TextInput
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    fullWidth
                  />
                </div>
                
                <div>
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
                
                {/* Demo controls */}
                <div className="flex flex-wrap gap-3 pt-2">
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
            </div>
            
            {showSuccessMessage && (
              <div className="mt-4">
                <InfoBox 
                  title={isVerified ? "Verification Successful" : "OTP Resent"} 
                  variant="success"
                >
                  {isVerified 
                    ? "The OTP code has been successfully verified." 
                    : "A new OTP code has been sent to your phone."}
                </InfoBox>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-medium mb-4">Implementation Details</h3>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h4>Key Features</h4>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Uses <code>autocomplete</code> attribute for browser autofill support</li>
                <li>Circular input fields matching the True dtac design</li>
                <li>Functioning countdown timer for resend option</li>
                <li>Auto-advances focus when typing</li>
                <li>Supports paste functionality</li>
                <li>Shows reference code and expiration information</li>
                <li>Support for changing autofill hint values</li>
                <li>Dynamic button state based on countdown timer</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                How OTP Auto-fill Works
              </h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 dark:text-blue-300 space-y-2 pl-2">
                <li>The component uses visible circular inputs for each digit</li>
                <li>A hidden input with <code>autoComplete</code> attribute captures autofill from keyboard suggestions</li>
                <li>When the browser offers an autofill suggestion, tapping it will populate all fields</li>
                <li>No SMS permissions required - relies on browser's native implementation</li>
              </ol>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-md p-4">
              <h4 className="font-medium text-amber-800 mb-2">
                Browser Support
              </h4>
              <p className="text-sm text-amber-700">
                OTP autofill is supported in modern browsers on mobile devices. For the keyboard suggestion 
                to appear, the message format typically needs to include the verification code in a specific 
                format that browsers can recognize.
              </p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Sample Usage:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto">
{`<OtpInput
  length={6}
  onComplete={(code) => console.log(code)}
  phoneNumber="${phoneNumber}"
  referenceCode="eTGqx"
  resendTime={60}
  autofillHint="${autofillHint}"
  onResend={() => console.log('Resending OTP')}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OtpInputDemo;