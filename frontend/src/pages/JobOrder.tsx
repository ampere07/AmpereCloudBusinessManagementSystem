import React, { useState } from 'react';
import { FileText, Search, ChevronDown, ArrowUpDown } from 'lucide-react';

interface JobOrder {
  id: string;
  timestamp: string;
  clientName: string;
  clientAddress: string;
  onsiteStatus: 'inProgress' | 'done' | 'reschedule' | 'failed';
  billingStatus: 'done' | 'pending';
  statusRemarks: string;
  assignedEmail: string;
  contractTemplate: string;
  billingDay: string;
  installationFee: string;
  modifiedBy: string;
  modifiedDate: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const JobOrder: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Mock data for job orders
  const jobOrders: JobOrder[] = [
    {
      id: '1',
      timestamp: '09/19/2025 10:20:09',
      clientName: 'JOHN H DOE',
      clientAddress: '123 MAIN STREET SAMPLE SUBDIVISION BRGY EXAMPLE ANYTOWN CITY, Sample Province',
      onsiteStatus: 'done',
      billingStatus: 'done',
      statusRemarks: 'Installation completed successfully',
      assignedEmail: 'technician1@amperecloud.com',
      contractTemplate: 'Standard',
      billingDay: '15',
      installationFee: '₱1,500.00',
      modifiedBy: 'admin@amperecloud.com',
      modifiedDate: '09/19/2025 15:30:22'
    },
    {
      id: '2',
      timestamp: '09/19/2025 11:30:15',
      clientName: 'JANE M SMITH',
      clientAddress: '456 CENTER AVENUE METRO HOMES BRGY CENTER ANYTOWN CITY, Sample Province',
      onsiteStatus: 'reschedule',
      billingStatus: 'pending',
      statusRemarks: 'Scheduled for next week',
      assignedEmail: 'technician2@amperecloud.com',
      contractTemplate: 'Business',
      billingDay: '20',
      installationFee: '₱2,500.00',
      modifiedBy: 'manager@amperecloud.com',
      modifiedDate: '09/19/2025 12:45:36'
    },
    {
      id: '3',
      timestamp: '09/19/2025 09:15:45',
      clientName: 'ROBERT A JOHNSON',
      clientAddress: '789 PARK LANE, Sample Area, Anytown City, Sample Province',
      onsiteStatus: 'inProgress',
      billingStatus: 'pending',
      statusRemarks: 'Awaiting parts',
      assignedEmail: 'technician3@amperecloud.com',
      contractTemplate: 'Standard',
      billingDay: '10',
      installationFee: '₱1,500.00',
      modifiedBy: 'supervisor@amperecloud.com',
      modifiedDate: '09/19/2025 10:05:18'
    },
    {
      id: '4',
      timestamp: '09/19/2025 14:45:30',
      clientName: 'EMILY R WILLIAMS',
      clientAddress: '101 SUNSET DRIVE PHASE 2 GARDEN HOMES BRGY WEST ANYTOWN CITY, Sample Province',
      onsiteStatus: 'done',
      billingStatus: 'done',
      statusRemarks: 'Partial payment received',
      assignedEmail: 'technician1@amperecloud.com',
      contractTemplate: 'Premium',
      billingDay: '5',
      installationFee: '₱3,000.00',
      modifiedBy: 'admin@amperecloud.com',
      modifiedDate: '09/19/2025 16:10:42'
    },
    {
      id: '5',
      timestamp: '09/19/2025 16:20:10',
      clientName: 'MICHAEL J BROWN',
      clientAddress: '202 RIVERSIDE ROAD, East District, Anytown City, Sample Province',
      onsiteStatus: 'failed',
      billingStatus: 'pending',
      statusRemarks: 'Customer cancelled service',
      assignedEmail: 'technician4@amperecloud.com',
      contractTemplate: 'Standard',
      billingDay: '15',
      installationFee: '₱1,500.00',
      modifiedBy: 'support@amperecloud.com',
      modifiedDate: '09/19/2025 17:25:58'
    }
  ];
  
  // Generate location items with counts
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: jobOrders.length
    },
    {
      id: 'anytown',
      name: 'Anytown',
      count: jobOrders.filter(jo => jo.clientAddress.includes('Anytown')).length
    },
    {
      id: 'eastport',
      name: 'Eastport',
      count: jobOrders.filter(jo => jo.clientAddress.includes('Eastport')).length
    }
  ];
  
  // Filter job orders based on location and search query
  const filteredJobOrders = jobOrders.filter(jobOrder => {
    const matchesLocation = selectedLocation === 'all' || 
                           jobOrder.clientAddress.toLowerCase().includes(selectedLocation.toLowerCase());
    
    const matchesSearch = searchQuery === '' || 
                         jobOrder.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         jobOrder.clientAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         jobOrder.assignedEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });
  
  // Status text color component
  const StatusText = ({ status, type }: { status: string, type: 'onsite' | 'billing' }) => {
    let textColor = '';
    
    if (type === 'onsite') {
      switch (status) {
        case 'done':
          textColor = 'text-green-500';
          break;
        case 'reschedule':
          textColor = 'text-blue-500';
          break;
        case 'inProgress':
          textColor = 'text-yellow-500';
          break;
        case 'failed':
          textColor = 'text-red-500';
          break;
        default:
          textColor = 'text-gray-400';
      }
    } else {
      switch (status) {
        case 'done':
          textColor = 'text-green-500';
          break;
        case 'pending':
          textColor = 'text-yellow-500';
          break;
        default:
          textColor = 'text-gray-400';
      }
    }
    
    return (
      <span className={`${textColor} capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Location Sidebar Container */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center mb-1">
            <h2 className="text-lg font-semibold text-white">Job Orders</h2>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="bg-gray-900 p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search job orders..."
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
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Timestamp
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center">
                    Full Name of Client
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center">
                    Full Address of Client
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Onsite Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Billing Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status Remarks
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Assigned Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Contract Template
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Billing Day
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Installation Fee
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
              {filteredJobOrders.length > 0 ? (
                filteredJobOrders.map((jobOrder) => (
                  <tr key={jobOrder.id} className="hover:bg-gray-800 cursor-pointer">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {jobOrder.timestamp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {jobOrder.clientName}
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                      {jobOrder.clientAddress}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusText status={jobOrder.onsiteStatus} type="onsite" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusText status={jobOrder.billingStatus} type="billing" />
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                      {jobOrder.statusRemarks}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {jobOrder.assignedEmail}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {jobOrder.contractTemplate}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-center">
                      {jobOrder.billingDay}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {jobOrder.installationFee}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {jobOrder.modifiedBy}
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      {jobOrder.modifiedDate}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                    No job orders found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobOrder;