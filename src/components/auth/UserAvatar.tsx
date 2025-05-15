import React from 'react';
import { Button } from '../../design-system/components/inputs';

const UserAvatar: React.FC = () => {
  return (
    <Button
      variant="outline"
      onClick={() => alert("Authentication features have been disabled")}
    >
      Sign In (Disabled)
    </Button>
  );
};

export default UserAvatar;
