import React, { useState, useEffect } from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';
import ServiceOrderDetails from '../components/ServiceOrderDetails';
import { getServiceOrders, ServiceOrderData } from '../services/serviceOrderService';
import { getCities, City } from '../services/cityService';

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
  repairCategory?: string;
  supportStatus?: string;
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
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  
  // Get column headers for display (always show these even when no data)
  const tableColumns = [
    { id: 'timestamp', label: 'Timestamp', width: 'whitespace-nowrap' },
    { id: 'fullName', label: 'Full Name', width: 'whitespace-nowrap' },
    { id: 'contactNumber', label: 'Contact Number', width: 'whitespace-nowrap' },
    { id: 'address', label: 'Full Address', width: 'whitespace-nowrap min-w-[180px]' },
    { id: 'concern', label: 'Concern', width: 'whitespace-nowrap' },
    { id: 'concernRemarks', label: 'Concern Remarks', width: '' },
    { id: 'requestedBy', label: 'Requested by', width: 'whitespace-nowrap' },
    { id: 'supportStatus', label: 'Support Status', width: 'whitespace-nowrap' },
    { id: 'assignedEmail', label: 'Assigned Email', width: 'whitespace-nowrap' },
    { id: 'repairCategory', label: 'Repair Category', width: 'whitespace-nowrap' },
    { id: 'visitStatus', label: 'Visit Status', width: 'whitespace-nowrap' },
    { id: 'modifiedBy', label: 'Modified By', width: 'whitespace-nowrap' },
    { id: 'modifiedDate', label: 'Modified Date', width: 'whitespace-nowrap' }
  ];

  // Format date function
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'Not scheduled';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const [userEmail, setUserEmail] = useState<string>('');
  
  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        setUserRole(userData.role || '');
        setUserEmail(userData.email || '');
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const citiesData = await getCities();
        setCities(citiesData || []);
        const authData = localStorage.getItem('authData');
        let assignedEmail: string | undefined;
        
        if (authData) {
          try {
            const userData = JSON.parse(authData);
            if (userData.role && userData.role.toLowerCase() === 'technician' && userData.email) {
              assignedEmail = userData.email;
            }
          } catch (error) {
            console.error('Error parsing auth data:', error);
          }
        }
        
        const response = await getServiceOrders(assignedEmail);
        console.log('Service Orders API Response:', response);
        
        if (response.success && Array.isArray(response.data)) {
          
          const processedOrders: ServiceOrder[] = response.data.map((order: ServiceOrderData) => ({
            id: order.ID || '',
            ticketId: order.Ticket_ID || '',
            timestamp: formatDate(order.Timestamp),
            accountNumber: order.Account_Number || '',
            fullName: order.Full_Name || '',
            contactAddress: order.Contact_Address || '',
            dateInstalled: order.Date_Installed || '',
            contactNumber: order.Contact_Number || '',
            fullAddress: order.Full_Address || '',
            houseFrontPicture: order.House_Front_Picture || '',
            emailAddress: order.Email_Address || '',
            plan: order.Plan || '',
            provider: order.Provider || '',
            username: order.Username || '',
            connectionType: order.Connection_Type || '',
            routerModemSN: order.Router_Modem_SN || '',
            lcp: order.LCP || '',
            nap: order.NAP || '',
            port: order.PORT || '',
            vlan: order.VLAN || '',
            concern: order.Concern || '',
            concernRemarks: order.Concern_Remarks || '',
            visitStatus: order.Visit_Status || '',
            visitBy: order.Visit_By || '',
            visitWith: order.Visit_With || '',
            visitWithOther: order.Visit_With_Other || '',
            visitRemarks: order.Visit_Remarks || '',
            modifiedBy: order.Modified_By || '',
            modifiedDate: formatDate(order.Modified_Date),
            userEmail: order.User_Email || '',
            requestedBy: order.Requested_By || '',
            assignedEmail: order.Assigned_Email || '',
            supportRemarks: order.Support_Remarks || '',
            serviceCharge: order.Service_Charge || '₱0.00',
            repairCategory: order.Repair_Category || '',
            supportStatus: order.Support_Status || ''
          }));
          
          setServiceOrders(processedOrders);
        } else {
          console.warn('No service orders returned from API or invalid response format', response);
          setServiceOrders([]);
          
          if (response.table) {
            console.info(`Table name specified in response: ${response.table}`);
          }
          
          if (response.message) {
            if (response.message.includes('SQLSTATE') || response.message.includes('table')) {
              const formattedMessage = `Database error: ${response.message}\nPossible issue: Service orders might be using 'service_orders' table instead of 'service_orders'`;
              setError(formattedMessage);
              console.error(formattedMessage);
            } else {
              setError(response.message);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message || 'Unknown error'}`);
        setServiceOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: serviceOrders.length
    }
  ];
  
  if (cities.length > 0) {
    cities.forEach(city => {
      const cityCount = serviceOrders.filter(so => 
        so.fullAddress.toLowerCase().includes(city.name.toLowerCase())
      ).length;
      
      locationItems.push({
        id: city.name.toLowerCase(),
        name: city.name,
        count: cityCount
      });
    });
  } else {
    const locationSet = new Set<string>();
    
    serviceOrders.forEach(so => {
      const addressParts = so.fullAddress.split(',');
      if (addressParts.length >= 2) {
        const cityPart = addressParts[addressParts.length - 2].trim().toLowerCase();
        if (cityPart && cityPart !== '') {
          locationSet.add(cityPart);
        }
      }
    });
    
    Array.from(locationSet).forEach(location => {
      const cityCount = serviceOrders.filter(so => 
        so.fullAddress.toLowerCase().includes(location)
      ).length;
      
      locationItems.push({
        id: location,
        name: location.charAt(0).toUpperCase() + location.slice(1),
        count: cityCount
      });
    });
  }
  
  const filteredServiceOrders = serviceOrders.filter(serviceOrder => {
    const matchesLocation = selectedLocation === 'all' || 
                           serviceOrder.fullAddress.toLowerCase().includes(selectedLocation.toLowerCase());
    
    const matchesSearch = searchQuery === '' || 
                         serviceOrder.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         serviceOrder.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (serviceOrder.concern && serviceOrder.concern.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesLocation && matchesSearch;
  });
  
  const StatusText = ({ status, type }: { status?: string, type: 'support' | 'visit' }) => {
    if (!status) return <span className="text-gray-400">Unknown</span>;
    
    let textColor = '';
    
    if (type === 'support') {
      switch (status.toLowerCase()) {
        case 'resolved':
          textColor = 'text-green-500';
          break;
        case 'in-progress':
        case 'in progress':
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
      switch (status.toLowerCase()) {
        case 'completed':
          textColor = 'text-green-500';
          break;
        case 'scheduled':
        case 'reschedule':
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-3"></div>
          <p className="text-gray-300">Loading service orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="bg-gray-800 border border-gray-700 rounded-md p-6 max-w-lg">
          <h3 className="text-red-500 text-lg font-medium mb-2">Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
            >
              Retry
            </button>
            
            {/* Always show the table structure even when there's an error */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700 text-sm">
                <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    {tableColumns.map(column => (
                      <th 
                        key={column.id}
                        scope="col" 
                        className={`px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${column.width}`}
                      >
                        <div className="flex items-center">
                          {column.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  <tr>
                    <td colSpan={tableColumns.length} className="px-4 py-12 text-center text-red-400">
                      Error loading service orders. Please try again.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-gray-900 rounded overflow-auto max-h-48">
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                {error.includes("SQLSTATE") ? (
                  <>
                    <span className="text-red-400">Database Error:</span>
                    <br />
                    {error.includes("Table") ? "Table name mismatch - check the database schema" : error}
                    <br /><br />
                    <span className="text-yellow-400">Suggestion:</span>
                    <br />
                    Verify that the table 'service_order' (singular) or 'service_orders' (plural) exists in your database.
                  </>
                ) : error}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Location Sidebar Container - Hidden for technician role */}
      {userRole.toLowerCase() !== 'technician' && (
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
      )}

      {/* Service Orders List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden flex-1`}>
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
                    {tableColumns.map(column => (
                      <th 
                        key={column.id}
                        scope="col" 
                        className={`px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${column.width}`}
                      >
                        <div className="flex items-center">
                          {column.label}
                        </div>
                      </th>
                    ))}
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
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.timestamp}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.fullName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.contactNumber}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate text-xs">
                          {serviceOrder.fullAddress}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.concern}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate text-xs">
                          {serviceOrder.concernRemarks}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.requestedBy}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          <StatusText status={serviceOrder.supportStatus} type="support" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.assignedEmail}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.repairCategory}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          <StatusText status={serviceOrder.visitStatus} type="visit" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.modifiedBy}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {serviceOrder.modifiedDate}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="text-gray-400">
                            {serviceOrders.length > 0
                              ? 'No service orders found matching your filters'
                              : 'No service orders found in the service_orders table'}
                          </div>
                        </div>
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
        <div className="w-full max-w-2xl overflow-hidden">
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