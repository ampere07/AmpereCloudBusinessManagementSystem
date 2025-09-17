import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardContent from './DashboardContent';
import UserManagement from './UserManagement';
import OrganizationManagement from './OrganizationManagement';
import GroupManagement from './GroupManagement';
import Logs from './Logs';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    switch (activeSection) {
      case 'user-management':
        return <UserManagement />;
      case 'organization-management':
        return <OrganizationManagement />;
      case 'group-management':
        return <GroupManagement />;
      case 'logs':
        return <Logs />;
      case 'dashboard':
      default:
        return <DashboardContent />;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0">
        <Header onSearch={handleSearch} onToggleSidebar={toggleSidebar} />
      </div>
      
      {/* Main Content Area with Fixed Sidebar and Scrollable Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onLogout={onLogout}
            isCollapsed={sidebarCollapsed}
          />
        </div>
        
        {/* Scrollable Content Area Only */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
