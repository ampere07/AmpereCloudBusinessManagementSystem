import React, { useState, useEffect, useRef } from 'react';
import { FileText, Search, ChevronDown, ListFilter } from 'lucide-react';
import JobOrderDetails from '../components/JobOrderDetails';
import { getJobOrders } from '../services/jobOrderService';
import { getCities, City } from '../services/cityService';
import { getBillingStatuses, BillingStatus } from '../services/lookupService';
import { JobOrder } from '../types/jobOrder';

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

type DisplayMode = 'card' | 'table';

// All available columns from job_orders table
const allColumns = [
  { key: 'timestamp', label: 'Timestamp', width: 'min-w-40' },
  { key: 'fullName', label: 'Full Name of Client', width: 'min-w-48' },
  { key: 'address', label: 'Full Address of Client', width: 'min-w-56' },
  { key: 'onsiteStatus', label: 'Onsite Status', width: 'min-w-32' },
  { key: 'billingStatus', label: 'Billing Status', width: 'min-w-32' },
  { key: 'statusRemarks', label: 'Status Remarks', width: 'min-w-40' },
  { key: 'assignedEmail', label: 'Assigned Email', width: 'min-w-48' },
  { key: 'contractTemplate', label: 'Contract Template', width: 'min-w-36' },
  { key: 'billingDay', label: 'Billing Day', width: 'min-w-28' },
  { key: 'installationFee', label: 'Installation Fee', width: 'min-w-32' },
  { key: 'modifiedBy', label: 'Modified By', width: 'min-w-32' },
  { key: 'modifiedDate', label: 'Modified Date', width: 'min-w-40' },
  { key: 'firstName', label: 'First Name', width: 'min-w-32' },
  { key: 'middleInitial', label: 'Middle Initial', width: 'min-w-28' },
  { key: 'lastName', label: 'Last Name', width: 'min-w-32' },
  { key: 'contactNumber', label: 'Contact Number', width: 'min-w-36' },
  { key: 'secondContactNumber', label: 'Second Contact Number', width: 'min-w-40' },
  { key: 'emailAddress', label: 'Email Address', width: 'min-w-48' },
  { key: 'region', label: 'Region', width: 'min-w-28' },
  { key: 'city', label: 'City', width: 'min-w-28' },
  { key: 'barangay', label: 'Barangay', width: 'min-w-32' },
  { key: 'location', label: 'Location', width: 'min-w-32' },
  { key: 'choosePlan', label: 'Choose Plan', width: 'min-w-36' },
  { key: 'connectionType', label: 'Connection Type', width: 'min-w-36' },
  { key: 'usageType', label: 'Usage Type', width: 'min-w-32' },
  { key: 'username', label: 'Username', width: 'min-w-32' },
  { key: 'pppoeUsername', label: 'PPPoE Username', width: 'min-w-36' },
  { key: 'pppoePassword', label: 'PPPoE Password', width: 'min-w-36' },
  { key: 'modemRouterSN', label: 'Modem/Router SN', width: 'min-w-36' },
  { key: 'routerModel', label: 'Router Model', width: 'min-w-32' },
  { key: 'lcp', label: 'LCP', width: 'min-w-24' },
  { key: 'nap', label: 'NAP', width: 'min-w-24' },
  { key: 'port', label: 'PORT', width: 'min-w-24' },
  { key: 'vlan', label: 'VLAN', width: 'min-w-24' },
  { key: 'lcpnap', label: 'LCPNAP', width: 'min-w-28' },
  { key: 'lcpnapport', label: 'LCPNAPPORT', width: 'min-w-32' },
  { key: 'visitBy', label: 'Visit By', width: 'min-w-32' },
  { key: 'visitWith', label: 'Visit With', width: 'min-w-32' },
  { key: 'referredBy', label: 'Referred By', width: 'min-w-32' },
  { key: 'dateInstalled', label: 'Date Installed', width: 'min-w-36' },
  { key: 'startTimestamp', label: 'Start Timestamp', width: 'min-w-40' },
  { key: 'endTimestamp', label: 'End Timestamp', width: 'min-w-40' },
  { key: 'duration', label: 'Duration', width: 'min-w-28' }
];

const JobOrderPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(null);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [billingStatuses, setBillingStatuses] = useState<BillingStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('table');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map(col => col.key));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, filterDropdownRef]);

  // Format date function
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Not scheduled';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Format price function
  const formatPrice = (price?: number | null): string => {
    if (price === null || price === undefined || price === 0) return '₱0.00';
    return `₱${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get billing status name by ID
  const getBillingStatusName = (statusId?: number | null): string => {
    if (!statusId) return 'Not Set';
    
    // If billing statuses haven't loaded yet, show a default based on common IDs
    if (billingStatuses.length === 0) {
      const defaultStatuses: { [key: number]: string } = {
        1: 'In Progress',
        2: 'Active',
        3: 'Suspended',
        4: 'Cancelled',
        5: 'Overdue'
      };
      return defaultStatuses[statusId] || 'Loading...';
    }
    
    const status = billingStatuses.find(s => s.id === statusId);
    return status ? status.status_name : `Unknown (ID: ${statusId})`;
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

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch cities data
        console.log('Fetching cities...');
        const citiesData = await getCities();
        console.log(`Found ${citiesData.length} cities`);
        if (citiesData.length === 0) {
          console.warn('No cities returned from API. This may affect location filtering.');
        } else {
          console.log('Cities data sample:', citiesData[0]);
        }
        setCities(citiesData);
        
        // Fetch billing statuses
        console.log('Fetching billing statuses...');
        const billingStatusesData = await getBillingStatuses();
        console.log(`Found ${billingStatusesData.length} billing statuses`);
        setBillingStatuses(billingStatusesData);
        
        // Fetch job orders data from job_orders table with email filter for technicians
        console.log('Fetching job orders from job_orders table...');
        const authData = localStorage.getItem('authData');
        let assignedEmail: string | undefined;
        
        if (authData) {
          try {
            const userData = JSON.parse(authData);
            if (userData.role && userData.role.toLowerCase() === 'technician' && userData.email) {
              assignedEmail = userData.email;
              console.log('Filtering job orders for technician:', assignedEmail);
            }
          } catch (error) {
            console.error('Error parsing auth data:', error);
          }
        }
        
        const response = await getJobOrders(assignedEmail);
        console.log('Job Orders API Response:', response);
        
        if (response.success && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} job orders`);
          
          // Process the job orders
          const processedOrders: JobOrder[] = response.data.map((order, index) => {
            const id = order.id || order.JobOrder_ID || String(index);
            
            return {
              ...order,
              id: id,
              Onsite_Status: order.Onsite_Status || null,
              Billing_Status: order.Billing_Status || null,
              Status_Remarks: order.Status_Remarks || null,
              Installation_Fee: order.Installation_Fee !== undefined ? 
                Number(order.Installation_Fee) : null,
              Assigned_Email: order.Assigned_Email || null,
              Contract_Template: order.Contract_Template || null,
              Billing_Day: order.Billing_Day || null,
              Modified_By: order.Modified_By || 'System',
              Modified_Date: order.Modified_Date || null
            };
          });
          
          setJobOrders(processedOrders);
          console.log('Job orders data processed successfully');
        } else {
          console.warn('No job orders returned from API or invalid response format', response);
          setJobOrders([]);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Get client full name
  const getClientFullName = (jobOrder: JobOrder): string => {
    return [
      jobOrder.First_Name || '',
      jobOrder.Middle_Initial ? jobOrder.Middle_Initial + '.' : '',
      jobOrder.Last_Name || ''
    ].filter(Boolean).join(' ').trim() || 'Unknown Client';
  };

  // Get client full address
  const getClientFullAddress = (jobOrder: JobOrder): string => {
    const addressParts = [
      jobOrder.Address,
      jobOrder.Location,
      jobOrder.Barangay,
      jobOrder.City,
      jobOrder.Region
    ].filter(Boolean);
    
    return addressParts.length > 0 ? addressParts.join(', ') : 'No address provided';
  };

  // Generate location items from cities data
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: jobOrders.length
    }
  ];

  // Add cities from database
  cities.forEach(city => {
    const cityCount = jobOrders.filter(job => {
      const jobCity = (job.City || '').toLowerCase();
      const cityName = city.name.toLowerCase();
      return jobCity.includes(cityName) || cityName.includes(jobCity);
    }).length;
    
    locationItems.push({
      id: city.name.toLowerCase(),
      name: city.name,
      count: cityCount
    });
  });
  
  // Filter job orders based on location and search query
  const filteredJobOrders = jobOrders.filter(jobOrder => {
    const jobLocation = (jobOrder.City || '').toLowerCase();
    
    const matchesLocation = selectedLocation === 'all' || 
                          jobLocation.includes(selectedLocation) || 
                          selectedLocation.includes(jobLocation);
    
    const fullName = getClientFullName(jobOrder).toLowerCase();
    const matchesSearch = searchQuery === '' || 
                         fullName.includes(searchQuery.toLowerCase()) ||
                         (jobOrder.Address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (jobOrder.Assigned_Email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

  // Status text color component
  const StatusText = ({ status, type }: { status?: string | null, type: 'onsite' | 'billing' }) => {
    if (!status) return <span className="text-gray-400">Unknown</span>;
    
    let textColor = '';
    
    if (type === 'onsite') {
      switch (status.toLowerCase()) {
        case 'done':
          textColor = 'text-green-500';
          break;
        case 'reschedule':
          textColor = 'text-blue-500';
          break;
        case 'inprogress':
        case 'in progress':
          textColor = 'text-yellow-500';
          break;
        case 'failed':
          textColor = 'text-red-500';
          break;
        default:
          textColor = 'text-gray-400';
      }
    } else {
      switch (status.toLowerCase()) {
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
        {status === 'inprogress' ? 'In Progress' : status}
      </span>
    );
  };

  const handleRowClick = (jobOrder: JobOrder) => {
    setSelectedJobOrder(jobOrder);
  };

  const handleToggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(columnKey)) {
        return prev.filter(key => key !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(allColumns.map(col => col.key));
  };

  const handleDeselectAllColumns = () => {
    setVisibleColumns([]);
  };

  const filteredColumns = allColumns.filter(col => visibleColumns.includes(col.key));

  const renderCellValue = (jobOrder: JobOrder, columnKey: string) => {
    switch (columnKey) {
      case 'timestamp':
        return formatDate(jobOrder.Timestamp);
      case 'fullName':
        return getClientFullName(jobOrder);
      case 'address':
        return getClientFullAddress(jobOrder);
      case 'onsiteStatus':
        return <StatusText status={jobOrder.Onsite_Status} type="onsite" />;
      case 'billingStatus':
        return <StatusText status={getBillingStatusName(jobOrder.billing_status_id)} type="billing" />;
      case 'statusRemarks':
        return jobOrder.Status_Remarks || 'No remarks';
      case 'assignedEmail':
        return jobOrder.Assigned_Email || 'Unassigned';
      case 'contractTemplate':
        return jobOrder.Contract_Template || 'Standard';
      case 'billingDay':
        return (jobOrder.Billing_Day === '0' || Number(jobOrder.Billing_Day) === 0)
          ? 'Every end of month' 
          : (jobOrder.Billing_Day || '-');
      case 'installationFee':
        return formatPrice(jobOrder.Installation_Fee);
      case 'modifiedBy':
        return jobOrder.Modified_By || 'System';
      case 'modifiedDate':
        return formatDate(jobOrder.Modified_Date);
      case 'firstName':
        return jobOrder.First_Name || '-';
      case 'middleInitial':
        return jobOrder.Middle_Initial || '-';
      case 'lastName':
        return jobOrder.Last_Name || '-';
      case 'contactNumber':
        return jobOrder.Contact_Number || jobOrder.Mobile_Number || '-';
      case 'secondContactNumber':
        return jobOrder.Second_Contact_Number || jobOrder.Secondary_Mobile_Number || '-';
      case 'emailAddress':
        return jobOrder.Email_Address || jobOrder.Applicant_Email_Address || '-';
      case 'region':
        return jobOrder.Region || '-';
      case 'city':
        return jobOrder.City || '-';
      case 'barangay':
        return jobOrder.Barangay || '-';
      case 'location':
        return jobOrder.Location || '-';
      case 'choosePlan':
        return jobOrder.Choose_Plan || jobOrder.Desired_Plan || '-';
      case 'connectionType':
        return jobOrder.Connection_Type || '-';
      case 'usageType':
        return jobOrder.Usage_Type || '-';
      case 'username':
        return jobOrder.Username || '-';
      case 'pppoeUsername':
        return jobOrder.PPPoE_Username || jobOrder.pppoe_username || '-';
      case 'pppoePassword':
        return jobOrder.PPPoE_Password || jobOrder.pppoe_password || '-';
      case 'modemRouterSN':
        return jobOrder.Modem_Router_SN || '-';
      case 'routerModel':
        return jobOrder.Router_Model || '-';
      case 'lcp':
        return jobOrder.LCP || '-';
      case 'nap':
        return jobOrder.NAP || '-';
      case 'port':
        return jobOrder.PORT || jobOrder.Port || '-';
      case 'vlan':
        return jobOrder.VLAN || '-';
      case 'lcpnap':
        return jobOrder.LCPNAP || '-';
      case 'lcpnapport':
        return jobOrder.LCPNAPPORT || '-';
      case 'visitBy':
        return jobOrder.Visit_By || '-';
      case 'visitWith':
        return jobOrder.Visit_With || '-';
      case 'referredBy':
        return jobOrder.Referred_By || '-';
      case 'dateInstalled':
        return formatDate(jobOrder.Date_Installed);
      case 'startTimestamp':
        return formatDate(jobOrder.StartTimeStamp);
      case 'endTimestamp':
        return formatDate(jobOrder.EndTimeStamp);
      case 'duration':
        return jobOrder.Duration || '-';
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-3"></div>
          <p className="text-gray-300">Loading job orders...</p>
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
          <button 
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
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
      )}

      {/* Job Orders List */}
      <div className={`bg-gray-900 overflow-hidden flex-1`}>
        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
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
              <div className="flex space-x-2">
                {displayMode === 'table' && (
                  <div className="relative" ref={filterDropdownRef}>
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center"
                      onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    >
                      <ListFilter className="h-5 w-5" />
                    </button>
                    {filterDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 max-h-96 flex flex-col">
                        <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                          <span className="text-white text-sm font-medium">Column Visibility</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSelectAllColumns}
                              className="text-xs text-orange-500 hover:text-orange-400"
                            >
                              Select All
                            </button>
                            <span className="text-gray-600">|</span>
                            <button
                              onClick={handleDeselectAllColumns}
                              className="text-xs text-orange-500 hover:text-orange-400"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {allColumns.map((column) => (
                            <label
                              key={column.key}
                              className="flex items-center px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white"
                            >
                              <input
                                type="checkbox"
                                checked={visibleColumns.includes(column.key)}
                                onChange={() => handleToggleColumn(column.key)}
                                className="mr-3 h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-800"
                              />
                              <span>{column.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="relative z-50" ref={dropdownRef}>
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>{displayMode === 'card' ? 'Card View' : 'Table View'}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-36 bg-gray-800 border border-gray-700 rounded shadow-lg">
                      <button
                        onClick={() => {
                          setDisplayMode('card');
                          setDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-700 ${displayMode === 'card' ? 'text-orange-500' : 'text-white'}`}
                      >
                        Card View
                      </button>
                      <button
                        onClick={() => {
                          setDisplayMode('table');
                          setDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-700 ${displayMode === 'table' ? 'text-orange-500' : 'text-white'}`}
                      >
                        Table View
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
          
          {/* Content Container */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {displayMode === 'card' ? (
                filteredJobOrders.length > 0 ? (
                  <div className="space-y-0">
                    {filteredJobOrders.map((jobOrder) => (
                      <div
                        key={jobOrder.id}
                        onClick={() => handleRowClick(jobOrder)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800 ${selectedJobOrder?.id === jobOrder.id ? 'bg-gray-800' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm mb-1">
                              {getClientFullName(jobOrder)}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {formatDate(jobOrder.Timestamp)} | {getClientFullAddress(jobOrder)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 ml-4 flex-shrink-0">
                            <StatusText status={jobOrder.Onsite_Status} type="onsite" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No job orders found matching your filters
                  </div>
                )
              ) : (
                <div className="overflow-x-auto overflow-y-hidden">
                  <table className="w-max min-w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
                        {filteredColumns.map((column, index) => (
                          <th
                            key={column.key}
                            className={`text-left py-3 px-3 text-gray-400 font-normal bg-gray-800 ${column.width} whitespace-nowrap ${index < filteredColumns.length - 1 ? 'border-r border-gray-700' : ''}`}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobOrders.length > 0 ? (
                        filteredJobOrders.map((jobOrder) => (
                          <tr 
                            key={jobOrder.id} 
                            className={`border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors ${selectedJobOrder?.id === jobOrder.id ? 'bg-gray-800' : ''}`}
                            onClick={() => handleRowClick(jobOrder)}
                          >
                            {filteredColumns.map((column, index) => (
                              <td 
                                key={column.key}
                                className={`py-4 px-3 text-white whitespace-nowrap ${index < filteredColumns.length - 1 ? 'border-r border-gray-800' : ''}`}
                              >
                                {renderCellValue(jobOrder, column.key)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={filteredColumns.length} className="px-4 py-12 text-center text-gray-400 border-b border-gray-800">
                            {jobOrders.length > 0
                              ? 'No job orders found matching your filters'
                              : 'No job orders found. Create your first job order.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Order Detail View - Only visible when a job order is selected */}
      {selectedJobOrder && (
        <div className="w-full max-w-2xl overflow-hidden">
          <JobOrderDetails 
            jobOrder={selectedJobOrder} 
            onClose={() => setSelectedJobOrder(null)}
          />
        </div>
      )}
    </div>
  );
};

export default JobOrderPage;
