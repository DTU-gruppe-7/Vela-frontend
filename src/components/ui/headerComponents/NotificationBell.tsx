import React from 'react';
import { FaBell } from 'react-icons/fa';

const NotificationBell: React.FC<{
  unreadCount: number;
  onClick: () => void;
  notifMenuRef: React.RefObject<HTMLDivElement | null>;
}> = ({ unreadCount, onClick, notifMenuRef }) => (
  <div className="relative" ref={notifMenuRef}>
    <button
      onClick={onClick}
      className="relative p-2 text-xl text-gray-500 rounded-full transition-all duration-200 hover:bg-gray-100 hover:text-indigo-600"
      aria-label="Notifikationer"
    >
      <FaBell />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[0.65rem] font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  </div>
);

export default NotificationBell;