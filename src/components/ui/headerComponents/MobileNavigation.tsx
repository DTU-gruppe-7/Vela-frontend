import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaHome, FaUsers, FaCalendarAlt, FaClipboardList, FaBook } from 'react-icons/fa';
import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { href: '/', icon: <FaHome />, label: 'Hjem', key: 'home' },
  { href: '/groups', icon: <FaUsers />, label: 'Grupper', key: 'groups' },
  { href: '/mealplan', icon: <FaCalendarAlt />, label: 'Madplan', key: 'mealplan' },
  { href: '/shoppinglist', icon: <FaClipboardList />, label: 'Indkøbsliste', key: 'shoppinglist' },
  { href: '/recipes', icon: <FaBook />, label: 'Opskrifter', key: 'recipes' },
];

const MobileNavigation: React.FC = () => {
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const location = useLocation();
  const isOpen = openPathname === location.pathname;

  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    for (const item of navItems) {
      if (item.key === 'home') continue;
      if (path.startsWith(item.href + '/') || path === item.href) {
        return item.key;
      }
    }
    return null;
  };

  const activePage = getActivePage();

  const openMenu = () => setOpenPathname(location.pathname);
  const closeMenu = () => setOpenPathname(null);

  // Disable body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden flex items-center">
      <button 
        onClick={openMenu}
        className="p-2 text-xl text-gray-500 rounded-full transition-all duration-200 hover:bg-gray-100 hover:text-indigo-600"
        aria-label="Åbn menu"
      >
        <FaBars />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button 
            onClick={closeMenu}
            className="p-2 text-xl text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors"
            aria-label="Luk menu"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              onClick={closeMenu}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${activePage === item.key
                  ? 'text-indigo-600 bg-indigo-50 border border-indigo-100 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
            >
              <span className={`text-xl ${activePage === item.key ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
          
          <div className="my-4 border-t border-gray-100"></div>
          
          <Link
            to="/swipe"
            onClick={closeMenu}
            className="flex justify-center px-6 py-3 rounded-xl border-2 border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 transition-all duration-200 font-bold"
          >
            Gå til Swipe
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
