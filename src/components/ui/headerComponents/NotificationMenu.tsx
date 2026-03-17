import React, { useState } from 'react';
import type { Notification } from '../../../types/Notification.ts';
import { useNotificationStore } from '../../../stores/notificationStore';

interface NotificationMenuProps {
  notifications: Notification[];
  processingId: string | null;
  inviteError: string | null;
  acceptGroupInvite: (notificationId: string, groupId: string) => Promise<void>;
  declineGroupInvite: (notificationId: string, groupId: string) => Promise<void>;
  handleNotificationClick: (notif: Notification) => void;
  setProcessingId: (id: string | null) => void;
  setInviteError: (err: string | null) => void;
  setShowNotifications: (show: boolean) => void;
  navigate: (url: string) => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  notifications,
  processingId,
  inviteError,
  acceptGroupInvite,
  declineGroupInvite,
  handleNotificationClick,
  setProcessingId,
  setInviteError,
  setShowNotifications,
  navigate,
}) => {
  const { markAllAsRead } = useNotificationStore();
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState<string | null>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    setLoadingAll(true);
    setErrorAll(null);
    try {
      await markAllAsRead();
    } catch (err) {
      setErrorAll('Kunne ikke markere alle som læst. Prøv igen.');
    } finally {
      setLoadingAll(false);
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border border-gray-100 max-h-96 overflow-y-auto z-50">
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Notifikationer</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={loadingAll}
            className="ml-2 px-2 py-1 text-xs font-medium text-white bg-indigo-500 rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {loadingAll ? '...' : 'Marker alle som læst'}
          </button>
        )}
      </div>
      {errorAll && <div className="px-4 py-2 text-xs text-red-500">{errorAll}</div>}
      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-center text-gray-500 text-sm">
          Du har ingen notifikationer endnu.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <li key={notif.id}>
              {notif.type === 'GroupInvite' ? (
                <div className={`px-4 py-3 flex flex-col gap-1 ${notif.isRead ? 'bg-slate-50 opacity-75' : 'bg-white border-l-4 border-indigo-500'}`}>
                  <span className={`font-medium text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-900'}`}>{notif.title}</span>
                  <span className={`text-sm line-clamp-2 ${notif.isRead ? 'text-gray-400' : 'text-gray-600'}`}>{notif.message}</span>
                  <span className={`text-xs mt-1 ${notif.isRead ? 'text-gray-400' : 'text-indigo-400 font-medium'}`}>{new Date(notif.createdAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex gap-2 mt-1">
                    <button
                      disabled={processingId === notif.id}
                      onClick={async () => {
                        setProcessingId(notif.id);
                        setInviteError(null);
                        try {
                          await acceptGroupInvite(notif.id, notif.relatedEntityId!);
                          navigate(`/groups/${notif.relatedEntityId}`);
                          setShowNotifications(false);
                        } catch (err) {
                          setInviteError('Kunne ikke acceptere invitation. Prøv igen.');
                        } finally {
                          setProcessingId(null);
                        }
                      }}
                      className="flex-1 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {processingId === notif.id ? '...' : 'Accepter'}
                    </button>
                    <button
                      disabled={processingId === notif.id}
                      onClick={async () => {
                        setProcessingId(notif.id);
                        setInviteError(null);
                        try {
                          await declineGroupInvite(notif.id, notif.relatedEntityId!);
                          setShowNotifications(false);
                        } catch (err) {
                          setInviteError('Kunne ikke afvise invitation. Prøv igen.');
                        } finally {
                          setProcessingId(null);
                        }
                      }}
                      className="flex-1 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      {processingId === notif.id ? '...' : 'Afvis'}
                    </button>
                  </div>
                  {inviteError && (
                    <span className="text-xs text-red-500 mt-1">{inviteError}</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 transition-colors duration-150 flex flex-col gap-1 ${notif.isRead ? 'bg-slate-50 hover:bg-slate-100 opacity-75' : 'bg-white hover:bg-indigo-50 border-l-4 border-indigo-500'}`}
                >
                  <span className={`font-medium text-sm ${notif.isRead ? 'text-gray-500' : 'text-gray-900'}`}>{notif.title}</span>
                  <span className={`text-sm line-clamp-2 ${notif.isRead ? 'text-gray-400' : 'text-gray-600'}`}>{notif.message}</span>
                  <span className={`text-xs mt-1 ${notif.isRead ? 'text-gray-400' : 'text-indigo-400 font-medium'}`}>{new Date(notif.createdAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationMenu;