import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../../design-system/components/inputs';
import { Card } from '../../design-system/components/layout';

const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Card isElevated className="p-4">
      <div className="flex items-center space-x-4">
        {user.image && (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <p className="font-medium dark:text-white">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
        <Button onClick={() => logout()} variant="light" size="sm" className="w-full">
          Sign Out
        </Button>
      </div>
    </Card>
  );
};

export default UserProfile;
