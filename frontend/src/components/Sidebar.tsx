import React from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  isCollapsed?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onLogout, isCollapsed }) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'users', label: 'User Management', icon: '⚹' },
    { id: 'logs', label: 'Logs', icon: '☰' }
  ];

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeSection === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onSectionChange(item.id)}
        className={`w-full flex items-center px-4 py-3 text-sm transition-colors ${
          isActive
            ? 'bg-orange-500 bg-opacity-20 text-orange-400 border-r-2 border-orange-500'
            : 'text-gray-300 hover:text-white hover:bg-gray-800'
        }`}
      >
        <span className="mr-3 text-gray-400">{item.icon}</span>
        {!isCollapsed && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} min-h-full bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300`}>
      <nav className="flex-1 py-4">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 text-gray-300 hover:text-white border border-gray-600 rounded hover:bg-gray-800 transition-colors text-sm flex items-center justify-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
