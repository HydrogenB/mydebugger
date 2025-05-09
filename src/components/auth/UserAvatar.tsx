import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function UserAvatar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="flex items-center focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
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
      
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium dark:text-white">{session.user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
          </div>
          
          <div className="py-1">
            <Link 
              href="/dashboard" 
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            
            <Link 
              href="/namecard/edit" 
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Edit Name Card
            </Link>
          </div>
          
          <div className="py-1 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
