import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeMenu: string;
  onMenuSelect: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuSelect }) => {
  const location = useLocation();
  
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', path: '/' },
    { id: 'donors', name: 'Donors', icon: '❤️', path: '/donors' },
    { id: 'recipients', name: 'Recipients', icon: '🏥', path: '/recipients' },
    { id: 'matching', name: 'Matching', icon: '🔄', path: '/matching' },
    { id: 'transport', name: 'Transport', icon: '🚑', path: '/transport' },
    { id: 'logs', name: 'Logs', icon: '📝', path: '/logs' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="bg-white w-64 min-h-screen shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-apple-dark">Organ Transplant System</h2>
      </div>
      <nav className="p-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-1">
              <Link
                to={item.path}
                className={`w-full text-left p-3 rounded-lg flex items-center ${
                  isActive(item.path)
                    ? 'bg-apple-blue bg-opacity-10 text-apple-blue'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => onMenuSelect(item.id)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;