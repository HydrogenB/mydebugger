import React from 'react';

interface ToastMessageProps {
  message: string;
  isVisible: boolean;
}

/**
 * Toast message component for notifications
 */
const ToastMessage: React.FC<ToastMessageProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-up">
      {message}
    </div>
  );
};

export default ToastMessage;
