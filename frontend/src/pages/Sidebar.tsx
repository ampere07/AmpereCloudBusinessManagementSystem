import React, { useState } from 'react';
import { LayoutDashboard, Users, FileText, LogOut, ChevronRight, User, Building2, Shield, FileCheck, Wrench, Map, MapPin, Package, CreditCard, List, Router, DollarSign, Receipt, FileBarChart, Clock, Calendar, UserCheck, AlertTriangle, Tag, MessageSquare, Settings, Network } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  isCollapsed?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onLogout, isCollapsed }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      children: [
        { id: 'user-management', label: 'Users Management', icon: User },
        { id: 'organization-management', label: 'Organization Management', icon: Building2 },
        { id: 'group-management', label: 'Group Management', icon: Shield }
      ]
    },
    { id: 'application-management', label: 'Application', icon: FileCheck },
    { id: 'job-order', label: 'Job Order', icon: Wrench },
    { id: 'service-order', label: 'Service Order', icon: Wrench },
    { id: 'application-visit', label: 'Application Visit', icon: MapPin },
    { id: 'billing-list-view', label: 'Billing List View', icon: List },
    { id: 'payment-portal', label: 'Payment Portal', icon: DollarSign },
    { id: 'transaction-list', label: 'Transaction List', icon: Receipt },
    { id: 'transactions-pending-list', label: 'Transactions Pending List', icon: Clock },
    { id: 'expenses-log', label: 'Expenses Log', icon: FileBarChart },
    { id: 'daily-expenses', label: 'Daily Expenses', icon: Calendar },
    { id: 'customer-map', label: 'Customer Map', icon: Map },
    { id: 'sales-agent-list', label: 'Sales Agent List', icon: UserCheck },
    { id: 'soa', label: 'SOA', icon: FileText },
    { id: 'invoice', label: 'Invoice', icon: Receipt },
    { id: 'overdue', label: 'Overdue', icon: Clock },
    { id: 'dc-notice', label: 'DC Notice', icon: AlertTriangle },
    { id: 'discounts', label: 'Discounts', icon: Tag },
    { id: 'advance-payment', label: 'Advance Payment', icon: CreditCard },
    { id: 'staggered-payment', label: 'Staggered Payment', icon: Calendar },
    { id: 'staggered-installation', label: 'Staggered Installation', icon: Calendar },
    { id: 'mass-rebate', label: 'Mass Rebate', icon: DollarSign },
    { id: 'sms-blast', label: 'SMS Blast', icon: MessageSquare },
    { id: 'sms-blast-logs', label: 'SMS Blast Logs', icon: List },
    { id: 'disconnected-logs', label: 'Disconnected Logs', icon: AlertTriangle },
    { id: 'reconnection-logs', label: 'Reconnection Logs', icon: FileBarChart },
    { id: 'inventory-category-list', label: 'Inventory Category List', icon: List },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: Settings,
      children: [
        { id: 'location-list', label: 'Location List', icon: MapPin },
        { id: 'plan-list', label: 'Plan List', icon: List },
        { id: 'router-models', label: 'Router Models', icon: Router },
        { id: 'lcp', label: 'LCP', icon: Network },
        { id: 'nap', label: 'NAP', icon: Network },
        { id: 'lcp-nap-list', label: 'LCP NAP List', icon: MapPin },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'logs', label: 'Logs', icon: FileText }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isChildActive = hasChildren && item.children!.some(child => activeSection === child.id);
    const isActive = activeSection === item.id || (level === 0 && isChildActive);
    const isCurrentItemActive = activeSection === item.id;
    const IconComponent = item.icon;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onSectionChange(item.id);
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
            level > 0 ? 'pl-8' : 'pl-4'
          } ${
            isCurrentItemActive
              ? 'bg-orange-500 bg-opacity-20 text-orange-400 border-r-2 border-orange-500'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center">
            <IconComponent className="mr-3 h-5 w-5 text-gray-400" />
            {!isCollapsed && <span>{item.label}</span>}
          </div>
          {hasChildren && !isCollapsed && (
            <ChevronRight
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isExpanded ? 'transform rotate-90' : ''
              }`}
            />
          )}
        </button>
        
        {hasChildren && isExpanded && !isCollapsed && (
          <div>
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-gray-800 border-r border-gray-600 flex flex-col transition-all duration-300 ease-in-out`}>
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-track-gray-700 scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-400">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
      
      <div className="p-4 border-t border-gray-600">
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 text-gray-300 hover:text-white border border-gray-500 rounded hover:bg-gray-700 transition-colors text-sm flex items-center justify-center"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;