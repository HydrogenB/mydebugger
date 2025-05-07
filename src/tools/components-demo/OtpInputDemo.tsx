import React, { useState } from 'react';
import Card from '../components/Card';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import InfoBox from '../components/InfoBox';

/**
 * Demo page for OTP input component with autofill functionality
 */
const OtpInputDemo: React.FC = () => {
  const [otpValue, setOtpValue] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  
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
  
  return (
    <Card title="OTP Auto-Fill Demo" isElevated>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">OTP Input with Auto-fill</h3>
            <p className="text-gray-600 dark:text-gray-300">
              This demo showcases an OTP input component that supports keyboard auto-fill suggestions
              without requiring SMS permissions or SMS Retriever API.
            </p>
            
            <p className="text-gray-600 dark:text-gray-300">
              Try entering the code: <strong>123456</strong>
            </p>
            
            <div className="mt-6">
              <OtpInput
                length={6}
                onComplete={setOtpValue}
                title="Enter verification code"
                description="Enter the code or use the auto-fill suggestion"
              />
            </div>
            
            <div className="mt-4 flex justify-center gap-3">
              <Button 
                variant="outline-primary"
                onClick={handleReset}
                disabled={isVerifying}
              >
                Reset
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
            
            {showSuccessMessage && (
              <div className="mt-4">
                <InfoBox 
                  title="Verification Successful" 
                  variant="success"
                >
                  The OTP code has been successfully verified.
                </InfoBox>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Implementation Details</h3>
            <div className="prose prose-sm dark:prose-invert">
              <ul className="list-disc list-inside">
                <li>Uses <code>autocomplete="one-time-code"</code> for browser autofill support</li>
                <li>Implements keyboard navigation (arrow keys and backspace)</li>
                <li>Auto-advances focus when typing</li>
                <li>Supports paste functionality</li>
                <li>Accessible with ARIA attributes</li>
                <li>Responsive design for mobile and desktop</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>The component uses visible individual inputs for each digit</li>
                <li>A hidden input with <code>autocomplete="one-time-code"</code> captures autofill from keyboard suggestions</li>
                <li>When the browser offers an autofill suggestion, tapping it will populate all fields</li>
                <li>No SMS permissions required - relies on browser's native implementation</li>
              </ol>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Browser Support
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                OTP autofill is supported in modern browsers on mobile devices. 
                Actual behavior may vary between browsers and platforms. WebOTP API is 
                supported in Chrome on Android, and similar functionality exists in iOS Safari.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OtpInputDemo;