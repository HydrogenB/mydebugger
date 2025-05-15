import React from 'react';
// Replace react-helmet with regular document.title
// import { Helmet } from 'react-helmet';
import { Card } from '../../design-system/components/layout';
import { Button } from '../../design-system/components/inputs';
import { ResponsiveContainer } from '../../design-system/components/layout';

const SignInPage: React.FC = () => {
  // Set title directly
  React.useEffect(() => {
    document.title = 'Sign In | MyDebugger';
  }, []);
  
  return (
    <>
      {/* Remove Helmet component
      <Helmet>
        <title>Sign In | MyDebugger</title>
        <meta name="description" content="Sign in to MyDebugger to access your account" />
      </Helmet> */}
      
      <div className="container mx-auto px-4 py-12">
        <Card isElevated className="max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
          <p className="text-center mb-6">
            Authentication features have been disabled in this version.
          </p>
          <div className="text-center">
            <Button
              href="/"
              variant="primary"
            >
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SignInPage;
