import React from 'react';
import { Helmet } from 'react-helmet';
import { ResponsiveContainer } from '../../design-system/components/layout';
import NameCardEditor from '../../features/namecard/NameCardEditor';
import { useAuth } from '../../features/auth/AuthContext';

const CreateNameCardPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>Create Name Card | MyDebugger</title>
        <meta name="description" content="Create your virtual name card to share with others" />
      </Helmet>
      
      <ResponsiveContainer maxWidth="2xl" padding="lg">
        <div className="my-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <NameCardEditor />
          )}
        </div>
      </ResponsiveContainer>
    </>
  );
};

export default CreateNameCardPage;
