import React, { useState, useEffect } from 'react';
import DCNotice from './DCNotice';
import Discounts from './Discounts';
import Overdue from './Overdue';
import StaggeredPayment from './StaggeredPayment';
import MassRebate from './MassRebate';
import SMSBlast from './SMSBlast';
import SMSBlastLogs from './SMSBlastLogs';
import DisconnectionLogs from './DisconnectionLogs';
import ReconnectionLogs from './ReconnectionLogs';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardContent from '../components/DashboardContent';
import UserManagement from './UserManagement';
import OrganizationManagement from './OrganizationManagement';
import GroupManagement from './GroupManagement';
import ApplicationManagement from './ApplicationManagement';
import Customer from './Customer';
import BillingListView from './BillingListView';
import TransactionList from './TransactionList';
import PaymentPortal from './PaymentPortal';
import JobOrder from './JobOrder';
import ServiceOrder from './ServiceOrder';
import ApplicationVisit from './ApplicationVisit';
import LocationList from './LocationList';
import PlanList from './PlanList';
import PromoList from './PromoList';
import RouterModelList from './RouterModelList';
import LcpList from './LcpList';
import NapList from './NapList';
import LcpNapList from './LcpNapList';
import Inventory from './Inventory';
import ExpensesLog from './ExpensesLog';
import Logs from './Logs';
import SOA from './SOA';
import Invoice from './Invoice';
import InventoryCategoryList from './InventoryCategoryList';
import SOAGeneration from './SOAGeneration';
import UsageTypeList from './UsageTypeList';
import Ports from './Ports';
import StatusRemarksList from './StatusRemarksList';
import Settings from './Settings';
import LcpNapLocation from './LcpNapLocation';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<any>(null);

  // Load user data from localStorage
  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        setUserData(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Add effect to log the active section when it changes
  useEffect(() => {
    console.log('Active section changed to:', activeSection);
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {

      case 'soa':
        return <SOA />;
      case 'invoice':
        return <Invoice />;
      case 'overdue':
        return <Overdue />;
      case 'dc-notice':
        return <DCNotice />;
      case 'discounts':
        return <Discounts />;


      case 'staggered-payment':
        console.log('Loading StaggeredPayment component');
        return <StaggeredPayment />;

      case 'mass-rebate':
        console.log('Loading MassRebate component');
        return <MassRebate />;
      case 'sms-blast':
        console.log('Loading SMS Blast component');
        return <SMSBlast />;
      case 'sms-blast-logs':
        console.log('Loading SMS Blast Logs component');
        return <SMSBlastLogs />;
      case 'disconnected-logs':
        console.log('Loading Disconnected Logs component');
        return <DisconnectionLogs />;
      case 'reconnection-logs':
        console.log('Loading Reconnection Logs component');
        return <ReconnectionLogs />;
      case 'user-management':
        return <UserManagement />;
      case 'organization-management':
        return <OrganizationManagement />;
      case 'group-management':
        return <GroupManagement />;
      case 'application-management':
        return <ApplicationManagement />;
      case 'customer':
        return <Customer />;
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
      case 'plan-list':
        return <PlanList />;
      case 'promo-list':
        return <PromoList />;
      case 'router-models':
        return <RouterModelList />;
      case 'lcp':
        return <LcpList />;
      case 'nap':
        return <NapList />;
      case 'lcp-nap-list':
        return <LcpNapList />;
      case 'lcp-nap-location':
        return <LcpNapLocation />;
      case 'usage-type':
        return <UsageTypeList />;
      case 'ports':
        return <Ports />;
      case 'status-remarks-list':
        return <StatusRemarksList />;
      case 'inventory':
        return <Inventory />;
      case 'inventory-category-list':
        return <InventoryCategoryList />;
      case 'expenses-log':
        return <ExpensesLog />;
      case 'logs':
        return <Logs />;
      case 'soa-generation':
        return <SOAGeneration />;
      case 'settings':
        return <Settings />;
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
            userRole={userData?.role || ''}
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