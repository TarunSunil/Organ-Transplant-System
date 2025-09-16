import React from 'react';

interface SidebarProps {
  activeMenu: string;
  onMenuSelect: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuSelect }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'donors', name: 'Donors', icon: '❤️' },
    { id: 'recipients', name: 'Recipients', icon: '🏥' },
    { id: 'matching', name: 'Matching', icon: '🔄' },
    { id: 'transport', name: 'Transport', icon: '🚑' },
    { id: 'logs', name: 'Logs', icon: '📝' },
  ];

  return (
    <aside className="bg-white w-64 min-h-screen shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-apple-dark">Organ Transplant</h2>
      </div>
      <nav className="p-2">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id} className="mb-1">
              <button
                className={`w-full text-left p-3 rounded-lg flex items-center ${
                  activeMenu === item.id
                    ? 'bg-apple-blue bg-opacity-10 text-apple-blue'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => onMenuSelect(item.id)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;