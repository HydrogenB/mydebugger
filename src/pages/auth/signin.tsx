import React from 'react';
import { Helmet } from 'react-helmet';
import { Card } from '../../design-system/components/layout';
import GoogleLoginButton from '../../features/auth/GoogleLoginButton';
import { ResponsiveContainer } from '../../design-system/components/layout';

const SignInPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Sign In | MyDebugger</title>
        <meta name="description" content="Sign in to MyDebugger to access your account" />
      </Helmet>
      
      <ResponsiveContainer maxWidth="md" padding="lg">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Card isElevated className="w-full max-w-md p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Sign In</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to access your virtual name card and other features
              </p>
            </div>
            
            <div className="space-y-4">
              <GoogleLoginButton className="w-full" />
            </div>
          </Card>
        </div>
      </ResponsiveContainer>
    </>
  );
};

export default SignInPage;
