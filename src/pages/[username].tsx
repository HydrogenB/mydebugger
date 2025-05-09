import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Helmet } from 'react-helmet';
import { ResponsiveContainer } from '../design-system/components/layout';
import NameCardView from '../features/namecard/NameCardView';
import { Button } from '../design-system/components/inputs';
import { useAuth } from '../features/auth/AuthContext';

const NameCardPage: React.FC = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user, isAuthenticated } = useAuth();
  const [nameCard, setNameCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNameCard() {
      if (!username) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/namecard/${username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Name card not found');
          }
          throw new Error('Failed to fetch name card');
        }
        
        const data = await response.json();
        setNameCard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchNameCard();
  }, [username]);

  if (loading) {
    return (
      <ResponsiveContainer maxWidth="2xl" padding="lg">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer maxWidth="2xl" padding="lg">
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops! {error}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error === 'Name card not found' 
              ? "This name card doesn't exist or might have been removed." 
              : "We couldn't load this name card. Please try again later."}
          </p>
          <Button href="/" variant="primary">Go Back Home</Button>
          
          {isAuthenticated && error === 'Name card not found' && (
            <div className="mt-6">
              <p className="text-gray-600 dark:text-gray-400 text-center mb-2">
                Would you like to create your own name card?
              </p>
              <Button href="/namecard/create" variant="outline">Create Name Card</Button>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <>
      <Helmet>
        <title>{nameCard.displayName || nameCard.user.name || username} | Virtual Name Card</title>
        <meta name="description" content={nameCard.bio || `View ${nameCard.displayName || nameCard.user.name || username}'s virtual name card`} />
      </Helmet>
      
      <ResponsiveContainer maxWidth="2xl" padding="lg">
        <div className="my-8">
          <NameCardView nameCard={nameCard} />
          
          {isAuthenticated && user?.id === nameCard.userId && (
            <div className="mt-6 flex justify-center">
              <Button href={`/namecard/edit/${nameCard.username}`} variant="outline">
                Edit Name Card
              </Button>
            </div>
          )}
        </div>
      </ResponsiveContainer>
    </>
  );
};

export default NameCardPage;
