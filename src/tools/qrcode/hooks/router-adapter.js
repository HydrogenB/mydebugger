// This file provides a compatibility layer for react-router-dom
// to work in environments that don't satisfy the Node.js version requirement

import { useCallback } from 'react';

// Minimal mock for useNavigate function from react-router-dom
export function useNavigate() {
  return useCallback((path) => {
    if (typeof window !== 'undefined') {
      if (path.startsWith('http')) {
        window.open(path, '_blank');
      } else {
        window.location.href = path;
      }
    }
  }, []);
}

// Minimal mock for Link component from react-router-dom
export const Link = ({ to, children, ...props }) => {
  const handleClick = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
    
    if (!e.defaultPrevented) {
      e.preventDefault();
      if (to.startsWith('http')) {
        window.open(to, '_blank');
      } else {
        window.location.href = to;
      }
    }
  };
  
  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
