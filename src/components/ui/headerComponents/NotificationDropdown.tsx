import React, { useEffect, useState } from 'react';
import type { Notification } from '../../../types/Notification.ts';
import { useNotificationStore } from '../../../stores/notificationStore';

interface NotificationDropdownProps {
  notification: Notification | null;
  visible: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notification, visible, onClose }) => {
  const { acceptGroupInvite, declineGroupInvite } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible || !notification) return null;

  const isGroupInvite = notification.type.toLowerCase().includes('group');

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await acceptGroupInvite(notification.id, notification.relatedEntityId!);
      onClose();
    } catch (err) {
      setError('Kunne ikke acceptere invitation. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    setError(null);
    try {
      await declineGroupInvite(notification.id, notification.relatedEntityId!);
      onClose();
    } catch (err) {
      setError('Kunne ikke afvise invitation. Prøv igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-16 right-5 z-[1000] bg-white shadow-lg rounded-lg p-4 min-w-[260px] max-w-[320px] text-base animate-fadeInDropdown border border-gray-200">
      <div className="font-bold mb-1 text-gray-900">{notification.title}</div>
      <div className="mb-2 text-gray-700">{notification.message}</div>
      <div className="text-xs text-gray-400 mb-2">{new Date(notification.createdAt).toLocaleString()}</div>
      {isGroupInvite && (
        <div className="flex gap-2 mt-2">
          <button
            disabled={loading}
            onClick={handleAccept}
            className="flex-1 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? '...' : 'Accepter'}
          </button>
          <button
            disabled={loading}
            onClick={handleDecline}
            className="flex-1 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {loading ? '...' : 'Afvis'}
          </button>
        </div>
      )}
      {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default NotificationDropdown;