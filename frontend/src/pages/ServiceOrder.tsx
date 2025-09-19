import React, { useState } from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';
import ServiceOrderDetails from '../components/ServiceOrderDetails';

interface ServiceOrder {
  id: string;
  ticketId: string;
  timestamp: string;
  accountNumber: string;
  fullName: string;
  contactAddress: string;
  dateInstalled: string;
  contactNumber: string;
  fullAddress: string;
  houseFrontPicture: string;
  emailAddress: string;
  plan: string;
  provider: string;
  username: string;
  connectionType: string;
  routerModemSN: string;
  lcp: string;
  nap: string;
  port: string;
  vlan: string;
  concern: string;
  concernRemarks: string;
  visitStatus: string;
  visitBy: string;
  visitWith: string;
  visitWithOther: string;
  visitRemarks: string;
  modifiedBy: string;
  modifiedDate: string;
  userEmail: string;
  requestedBy: string;
  assignedEmail: string;
  supportRemarks: string;
  serviceCharge: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const ServiceOrder: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null);
  
  // Mock data for service orders
  const serviceOrders: ServiceOrder[] = [
    {
      id: '1',
      ticketId: '202509181611134',
      timestamp: '9/18/2025 4:11:34 PM',
      accountNumber: '202302420',
      fullName: 'John Doe',
      contactAddress: '0515 Sample St, Sample, Binangonan, Rizal',
      dateInstalled: '7/27/2024',
      contactNumber: '987654321',
      fullAddress: '0515 Sample St, Sample, Binangonan, Rizal',
      houseFrontPicture: 'https://drive.google.com/open?id=1j1yk...',
      emailAddress: 'Sample@gmail.com',
      plan: 'Sample - p999',
      provider: 'Sample',
      username: 'Sample0192379012',
      connectionType: 'Fiber',
      routerModemSN: 'sisc799203bf',
      lcp: 'LCP 027',
      nap: 'NAP 005',
      port: 'PORT 010',
      vlan: '1000',
      concern: 'High Loss',
      concernRemarks: '-33.01 dBm',
      visitStatus: 'Reschedule',
      visitBy: 'John Doe',
      visitWith: 'John Smith',
      visitWithOther: 'NONE',
      visitRemarks: 'Brrttt',
      modifiedBy: 'Tech 3',
      modifiedDate: '9/18/2025 4:36:41 PM',
      userEmail: 'Sample@Sample.ph',
      requestedBy: 'Sample Doe',
      assignedEmail: 'Tech 3',
      supportRemarks: '-33.01 dBm',
      serviceCharge: '₱0.00'
    }
  ];
  
  // Generate location items with counts
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: serviceOrders.length
    },
    {
      id: 'anytown',
      name: 'Anytown',
      count: serviceOrders.filter(so => so.fullAddress.includes('Anytown')).length
    },
    {
      id: 'eastport',
      name: 'Eastport',
      count: serviceOrders.filter(so => so.fullAddress.includes('Eastport')).length
    }
  ];
  
  // Filter service orders based on location and search query
  const filteredServiceOrders = serviceOrders.filter(serviceOrder => {
    const matchesLocation = selectedLocation === 'all' || 
                           serviceOrder.fullAddress.toLowerCase().includes(selectedLocation.toLowerCase());
    
    const matchesSearch = searchQuery === '' || 
                         serviceOrder.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         serviceOrder.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         serviceOrder.concern.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });
  
  // Status text color component
  const StatusText = ({ status, type }: { status: string, type: 'support' | 'visit' }) => {
    let textColor = '';
    
    if (type === 'support') {
      switch (status) {
        case 'resolved':
          textColor = 'text-green-500';
          break;
        case 'in-progress':
          textColor = 'text-yellow-500';
          break;
        case 'pending':
          textColor = 'text-blue-500';
          break;
        case 'closed':
          textColor = 'text-gray-400';
          break;
        default:
          textColor = 'text-gray-400';
      }
    } else {
      switch (status) {
        case 'completed':
          textColor = 'text-green-500';
          break;
        case 'scheduled':
          textColor = 'text-yellow-500';
          break;
        case 'pending':
          textColor = 'text-blue-500';
          break;
        case 'cancelled':
          textColor = 'text-red-500';
          break;
        default:
          textColor = 'text-gray-400';
      }
    }
    
    return (
      <span className={`${textColor} capitalize`}>
        {status === 'in-progress' ? 'In Progress' : status}
      </span>
    );
  };

  const handleRowClick = (serviceOrder: ServiceOrder) => {
    setSelectedServiceOrder(serviceOrder);
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Location Sidebar Container */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center mb-1">
            <h2 className="text-lg font-semibold text-white">Service Orders</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {locationItems.map((location) => (
            <button
              key={location.id}
              onClick={() => {
                setSelectedLocation(location.id);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-800 ${
                selectedLocation === location.id
                  ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                  : 'text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span className="capitalize">{location.name}</span>
              </div>
              {location.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedLocation === location.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {location.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Service Orders List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden ${selectedServiceOrder ? 'flex-1' : 'flex-1'}`}>
        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search service orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 flex items-center">
                <span className="mr-2">Filter</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Table Container */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-x-auto overflow-y-auto pb-4">
              <table className="min-w-full divide-y divide-gray-700 text-sm">
                <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Timestamp
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Full Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Contact Number
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Full Address
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Concern
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Concern Remarks
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Requested by
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Support Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Assigned Email
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Repair Category
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Visit Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified By
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredServiceOrders.length > 0 ? (
                    filteredServiceOrders.map((serviceOrder) => (
                      <tr 
                        key={serviceOrder.id} 
                        className={`hover:bg-gray-800 cursor-pointer ${selectedServiceOrder?.id === serviceOrder.id ? 'bg-gray-800' : ''}`}
                        onClick={() => handleRowClick(serviceOrder)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.timestamp}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.fullName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.contactNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {serviceOrder.fullAddress}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.concern}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {serviceOrder.concernRemarks}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.requestedBy}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          <StatusText status={serviceOrder.visitStatus} type="support" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.assignedEmail}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.concern}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          <StatusText status={serviceOrder.visitStatus} type="visit" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.modifiedBy}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {serviceOrder.modifiedDate}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="px-4 py-12 text-center text-gray-400">
                        No service orders found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Service Order Detail View - Only visible when a service order is selected */}
      {selectedServiceOrder && (
        <div className="flex-1 overflow-hidden">
          <ServiceOrderDetails 
            serviceOrder={selectedServiceOrder} 
            onClose={() => setSelectedServiceOrder(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ServiceOrder;