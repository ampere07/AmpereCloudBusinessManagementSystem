import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardContent from '../components/DashboardContent';
import UserManagement from './UserManagement';
import OrganizationManagement from './OrganizationManagement';
import GroupManagement from './GroupManagement';
import ApplicationManagement from './ApplicationManagement';
import Billing from './Billing';
import BillingListView from './BillingListView';
import TransactionList from './TransactionList';
import PaymentPortal from './PaymentPortal';
import JobOrder from './JobOrder';
import ServiceOrder from './ServiceOrder';
import ApplicationVisit from './ApplicationVisit';
import LocationList from './LocationList';
import Inventory from './Inventory';
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
      case 'application-management':
        return <ApplicationManagement />;
      case 'billing':
        return <Billing />;
      case 'billing-list-view':
        return <BillingListView />;
      case 'transaction-list':
        return <TransactionList />;
      case 'payment-portal':
        return <PaymentPortal />;
      case 'job-order':
        return <JobOrder />;
      case 'service-order':
        return <ServiceOrder />;
      case 'application-visit':
        return <ApplicationVisit />;
      case 'location-list':
        return <LocationList />;
      case 'inventory':
        return <Inventory />;
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
        <div className="flex-1 bg-gray-950 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;