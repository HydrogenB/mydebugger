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
            <h3 className="text-lg font-medium">True dtac OTP Verification</h3>
            
            {/* Mobile phone frame */}
            <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-300">
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
                  phoneNumber="0945656671"
                  referenceCode="eTGqx"
                  expiryTime="10 minutes"
                  resendTime={11}
                  className="w-full"
                  inputClassName="bg-gray-100"
                />
              </div>
              
              {/* Phone navigation bar */}
              <div className="bg-black p-4 flex justify-around">
                <div className="w-6 h-6 bg-white mask mask-triangle-4"></div>
                <div className="w-6 h-6 rounded-full border-2 border-white"></div>
                <div className="w-6 h-6 border-2 border-white"></div>
              </div>
            </div>

            {/* Demo controls */}
            <div className="flex justify-center gap-3 mt-6">
              <Button 
                variant="outline-primary"
                onClick={handleReset}
                disabled={isVerifying}
              >
                Reset Demo
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
                <li>Circular input fields matching the True dtac design</li>
                <li>Functioning countdown timer for resend option</li>
                <li>Auto-advances focus when typing</li>
                <li>Supports paste functionality</li>
                <li>Shows reference code and expiration information</li>
              </ul>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">How OTP Auto-fill Works:</h4>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>The component uses visible circular inputs for each digit</li>
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
                For the keyboard suggestion to appear, the message format typically needs to include
                the verification code in a specific format that browsers can recognize.
              </p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Sample Usage:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto">
{`<OtpInput
  length={6}
  onComplete={(code) => console.log(code)}
  phoneNumber="0945656671"
  referenceCode="eTGqx"
  resendTime={60}
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