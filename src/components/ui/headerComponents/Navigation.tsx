import React from 'react';
import { FaHome, FaUsers, FaCalendarAlt, FaClipboardList, FaBook } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const navItems = [
  { href: '/', icon: <FaHome />, label: 'Hjem', key: 'home' },
  { href: '/groups', icon: <FaUsers />, label: 'Grupper', key: 'groups' },
  { href: '/mealplan', icon: <FaCalendarAlt />, label: 'Madplan', key: 'mealplan' },
  { href: '/shoppinglist', icon: <FaClipboardList />, label: 'Indkøbsliste', key: 'shoppinglist' },
  { href: '/recipes', icon: <FaBook />, label: 'Opskrifter', key: 'recipes' },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const activePage = location.pathname === '/' ? 'home' : location.pathname.slice(1);

  return (
    <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
      {navItems.map((item) => (
        <a
          key={item.key}
          href={item.href}
          className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-lg text-xs transition-all duration-200 
            ${activePage === item.key
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'
            }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};

export default Navigation;
