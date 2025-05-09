import React, { createContext, useContext, useState, useEffect } from 'react';

// Define User type
interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session: any = null; // Placeholder
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Define status type properly
  type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
    } else if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id || '', // Ensure id is handled if not present
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
      });
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [session, status]);

  const login = async (provider: 'google' | 'credentials', options?: any) => {
    console.warn(`Login attempted with ${provider} but next-auth is not configured.`);
  };

  const logout = async () => {
    console.warn("Logout attempted but next-auth is not configured.");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: status === 'authenticated',
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
