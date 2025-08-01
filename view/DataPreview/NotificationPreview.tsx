/**
 * © 2025 MyDebugger Contributors – MIT License
 * 
 * Notification Preview Component - Shows notification testing interface
 */
import React, { useState } from 'react';
import { FiBell, FiX, FiSend } from 'react-icons/fi';

interface NotificationPreviewProps {
  onStop: () => void;
  onTest?: () => void;
}

function NotificationPreview({ onStop, onTest }: NotificationPreviewProps) {
  const [title, setTitle] = useState('Test Notification');
  const [body, setBody] = useState('This is a test notification from MyDebugger');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const sendTestNotification = async () => {
    if (!('Notification' in window)) {
      return;
    }

    setSending(true);
    
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'mydebugger-test',
        requireInteraction: false
      });

      setLastSent(new Date());
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      if (onTest) {
        onTest();
      }
    } catch (error) {
      // Ignore notification errors in testing
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiBell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Notification Testing
          </h4>
        </div>
        <button
          type="button"
          onClick={onStop}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label htmlFor="notification-title" className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Title:
          </label>
          <input
            id="notification-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Notification title"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="notification-body" className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Body:
          </label>
          <textarea
            id="notification-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
            placeholder="Notification body text"
          />
        </div>

        <button
          type="button"
          onClick={sendTestNotification}
          disabled={sending || !title.trim()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
        >
          <FiSend className="w-3 h-3" />
          {sending ? 'Sending...' : 'Send Test Notification'}
        </button>

        {lastSent && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Last sent: {lastSent.toLocaleTimeString()}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>• Notifications will auto-close after 5 seconds</div>
          <div>• Check your browser&apos;s notification settings if not visible</div>
          <div>• Permission status: {Notification.permission}</div>
        </div>
      </div>
    </div>
  );
}

export default NotificationPreview;
