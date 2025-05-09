import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../design-system/components/inputs';
// Import from our custom icons instead of heroicons
import { UserIcon, LogoutIcon, SettingsIcon, ChevronDownIcon } from '../../shared/components/icons/Heroes';

const UserAvatar: React.FC = () => {
  // const { data: session } = useSession();
  const session: any = null; // Placeholder
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session) {
    return (
      // <Link href="/api/auth/signin" passHref>
        <a className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          Sign In
        </a>
      // </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="flex items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {session.user?.image ? (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User'} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
            {session.user.name?.charAt(0) || 'U'}
          </div>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium dark:text-white">{session.user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
          </div>
          
          <div className="py-1">
            {/* <Link href="/dashboard" passHref> */}
              <a 
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </a>
            {/* </Link> */}
            
            {/* <Link href="/namecard/edit" passHref> */}
              <a 
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Edit Name Card
              </a>
            {/* </Link> */}
          </div>
          
          <div className="py-1 border-t border-gray-200 dark:border-gray-700">
            {/* <Link href="/profile/settings" passHref> */}
              <a
                // onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <SettingsIcon className="inline-block w-4 h-4 mr-2" />
                Settings
              </a>
            {/* </Link> */}
            <button
              // onClick={() => signOut()}
              onClick={() => { console.warn("Sign out attempted but next-auth is not configured."); setIsOpen(false); }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAvatar;
