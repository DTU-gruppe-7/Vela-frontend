import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaLayerGroup,
  FaCalendarAlt,
  FaClipboardList,
  FaBell,
  FaUserCircle
} from 'react-icons/fa';

const Header: React.FC = () => {
  const location = useLocation();
  const activePage = location.pathname === '/' ? 'home' : location.pathname.slice(1);
  const navItems = [
    { href: '/', icon: <FaHome />, label: 'Hjem', key: 'home' },
    { href: '/swipe', icon: <FaLayerGroup />, label: 'Swipe', key: 'swipe' },
    { href: '/groups', icon: <FaUsers />, label: 'Grupper', key: 'groups' },
    { href: '/mealplan', icon: <FaCalendarAlt />, label: 'Madplan', key: 'mealplan' },
    { href: '/shoppinglist', icon: <FaClipboardList />, label: 'Indkøbsliste', key: 'shoppinglist' },
    { href: '/recipes', icon: <FaClipboardList />, label: 'Opskrifter', key: 'recipes' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-white shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img src="/src/assets/vela-logo.svg" alt="Vela Logo" className="h-8 w-8" />
        <span className="text-xl font-bold text-gray-900">Vela</span>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg text-xs transition-all duration-200 
              ${
                activePage === item.key
                  ? 'bg-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Notification Bell */}
      <div className="flex items-center gap-3">
        <button 
        className="relative p-2 text-xl text-gray-500 rounded-full transistion-all duration-200 hover:bg-gray-100 hover:text-indigo-600"
        aria-label="Notifikationer"
        >
          <FaBell />
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[0.65rem] font-bold text-white bg-red-500 rounded-full">
            3
          </span>
        </button>
        <button
          className="p-2 text-xl text-gray-500 rounded-full transistion-all duration-200 hover:bg-gray-100 hover:text-indigo-600"
          aria-label="Profil"
          >
          <FaUserCircle />
        </button>
      </div>
    </header>
  );
}

export default Header;