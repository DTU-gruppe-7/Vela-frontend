import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaUserCircle
} from 'react-icons/fa';
import ProfileMenu from '../ui/ProfileMenu.tsx';
import NotificationDropdown from '../ui/headerComponents/NotificationDropdown.tsx';
import NotificationMenu from '../ui/headerComponents/NotificationMenu.tsx';
import { useNotificationStore } from '../../stores/notificationStore';
import type { Notification } from '../../types/Notification';
import Logo from '../ui/headerComponents/Logo.tsx';
import Navigation from '../ui/headerComponents/Navigation.tsx';
import NotificationBell from '../ui/headerComponents/NotificationBell.tsx';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const activePage = location.pathname === '/' ? 'home' : location.pathname.slice(1);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Hent data fra din notifikations-store
  const {
    notifications,
    unreadCount,
    markAsRead,
    acceptGroupInvite,
    declineGroupInvite,
    dropdownVisible,
    latestNotification,
    hideDropdown,
  } = useNotificationStore();

  // Luk menuer når der klikkes udenfor
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Håndtering af klik på en notifikation
  // Opdateret klik-håndtering med dynamisk navigation
  const handleNotificationClick = async (notif: Notification) => {
    const typeLower = notif.type.toLowerCase();

    // 1. Marker som læst i baggrunden, hvis den er ulæst
    // Men ikke for GroupInvite - de skal først markeres som læst når brugeren accepterer/afviser
    if (!notif.isRead && !typeLower.includes('groupinvite')) {
      await markAsRead(notif.id);
    }

    // 2. Luk notifikationsmenuen
    setShowNotifications(false);

    // 3. Naviger baseret på typen af notifikation
    if (notif.relatedEntityId) {
      const typeLower = String(notif.type ?? '').toLowerCase();

      // Hvis typen indeholder ordet "group" (f.eks. "GroupInvite")
      if (typeLower.includes('group')) {
        navigate(`/groups/${notif.relatedEntityId}`);
      }
      // Hvis typen indeholder ordet "match" (f.eks. "NewMatch")
      else if (typeLower.includes('match')) {
        navigate(`/recipes/${notif.relatedEntityId}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-white shadow-sm">
      {/* Container for Logo and Actions */}
      <div className="flex items-center gap-8">
        <Logo />
        <a
          href="/swipe"
          className={`flex items-center justify-center px-6 py-2 rounded-full border-2 text-lg font-medium transition-all duration-200 shadow-sm
            ${activePage === 'swipe'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
              : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400 hover:text-indigo-600 hover:bg-gray-50'
            }`}
        >
          Swipe
        </a>
      </div>

      <Navigation />

      {/* Profile & Notifications */}
      <div className="flex items-center gap-3">
        {/* Notification Dropdown (temporary, floating) */}
        <NotificationDropdown
          notification={latestNotification}
          visible={dropdownVisible}
          onClose={hideDropdown}
        />
        <div className="relative" ref={notifMenuRef}>
          <NotificationBell
            unreadCount={unreadCount}
            onClick={() => {
              setShowNotifications(!showNotifications);
              hideDropdown();
            }}
            notifMenuRef={notifMenuRef}
          />
          {showNotifications && (
            <NotificationMenu
              notifications={notifications}
              processingId={processingId}
              inviteError={inviteError}
              acceptGroupInvite={acceptGroupInvite}
              declineGroupInvite={declineGroupInvite}
              handleNotificationClick={handleNotificationClick}
              setProcessingId={setProcessingId}
              setInviteError={setInviteError}
              setShowNotifications={setShowNotifications}
              navigate={navigate}
            />
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="p-2 text-xl text-gray-500 rounded-full transition-all duration-200 hover:bg-gray-100 hover:text-indigo-600"
            aria-label="Profil"
          >
            <FaUserCircle />
          </button>

          {showProfileMenu && (
            <ProfileMenu onClose={() => setShowProfileMenu(false)} />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;