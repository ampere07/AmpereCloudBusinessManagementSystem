import React, { useState, useEffect } from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';
import JobOrderDetails from '../components/JobOrderDetails';
import { getJobOrders } from '../services/jobOrderService';
import { getCities, City } from '../services/cityService';

interface JobOrder {
  id: string;
  Timestamp?: string;
  First_Name?: string;
  Middle_Initial?: string;
  Last_Name?: string;
  Address?: string;
  Onsite_Status?: string;
  Billing_Status?: string;
  Status_Remarks?: string;
  Assigned_Email?: string;
  Contract_Template?: string;
  Billing_Day?: string;
  Installation_Fee?: string | number;
  Modified_By?: string;
  Modified_Date?: string;
  Contact_Number?: string;
  Second_Contact_Number?: string;
  Email_Address?: string;
  Referred_By?: string;
  City?: string;
  Choose_Plan?: string;
  Contract_Link?: string;
  Username?: string;
  Installation_Landmark?: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const JobOrder: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(null);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format date function
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'Not scheduled';
    try {
      return new Date(dateStr).toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };
  
  // Format price function
  const formatPrice = (price?: string | number): string => {
    if (!price) return '₱0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `₱${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
        
        // Fetch job orders data
        console.log('Fetching job orders...');
        const response = await getJobOrders();
        console.log('Job Orders API Response:', response);
        
        if (response.success && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} job orders`);
          
          // If we have data, log the first item to help with debugging
          if (response.data.length > 0) {
            console.log('First item example:', response.data[0]);
            console.log('City field example:', response.data[0].City);
          }
          
          // Map the response data to include id field
          const processedOrders = response.data.map((order, index) => ({
            id: String(order.Application_ID || index), // Use Application_ID or index as fallback
            ...order
          }));
          
          setJobOrders(processedOrders);
          console.log('Job orders data processed successfully');
        } else {
          // If no job orders are returned, set an empty array
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
    return jobOrder.Address || 'No address provided';
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
    // Count job orders in this city
    const cityCount = jobOrders.filter(job => {
      // Try to match by city name (case insensitive)
      // Using includes instead of exact match for more flexible matching
      const jobCity = (job.City || '').toLowerCase();
      const cityName = city.name.toLowerCase();
      return jobCity.includes(cityName) || cityName.includes(jobCity);
    }).length;
    
    // Add all cities from the database, even if they don't have job orders yet
    locationItems.push({
      id: city.name.toLowerCase(),
      name: city.name,
      count: cityCount
    });
  });
  
  // Filter job orders based on location and search query
  const filteredJobOrders = jobOrders.filter(jobOrder => {
    const jobLocation = (jobOrder.City || '').toLowerCase();
    
    // Match location
    const matchesLocation = selectedLocation === 'all' || 
                          jobLocation.includes(selectedLocation) || 
                          selectedLocation.includes(jobLocation);
    
    // Match search query
    const fullName = getClientFullName(jobOrder).toLowerCase();
    const matchesSearch = searchQuery === '' || 
                         fullName.includes(searchQuery.toLowerCase()) ||
                         (jobOrder.Address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (jobOrder.Assigned_Email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });
  
  // Status text color component
  const StatusText = ({ status, type }: { status?: string, type: 'onsite' | 'billing' }) => {
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

      {/* Job Orders List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden ${selectedJobOrder ? 'w-1/3' : 'flex-1'}`}>
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
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center">
                        Timestamp
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center">
                        Full Name of Client
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap w-48">
                      <div className="flex items-center">
                        Full Address of Client
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Onsite Status
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Billing Status
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status Remarks
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Assigned Email
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Contract Template
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Billing Day
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Installation Fee
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified By
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredJobOrders.length > 0 ? (
                    filteredJobOrders.map((jobOrder) => (
                      <tr 
                        key={jobOrder.id} 
                        className={`hover:bg-gray-800 cursor-pointer ${selectedJobOrder?.id === jobOrder.id ? 'bg-gray-800' : ''}`}
                        onClick={() => handleRowClick(jobOrder)}
                      >
                        <td className="px-4 py-1 whitespace-nowrap text-gray-300 text-xs">
                          {formatDate(jobOrder.Timestamp)}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-gray-300 text-xs">
                          {getClientFullName(jobOrder)}
                        </td>
                        <td className="px-4 py-1 text-gray-300 max-w-xs truncate text-xs whitespace-nowrap overflow-hidden">
                          {getClientFullAddress(jobOrder)}
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-xs">
                          <StatusText status={jobOrder.Onsite_Status} type="onsite" />
                        </td>
                        <td className="px-4 py-1 whitespace-nowrap text-xs">
                          <StatusText status={jobOrder.Billing_Status} type="billing" />
                        </td>
                        <td className="px-4 py-1 text-gray-300 max-w-xs truncate text-xs">
                          {jobOrder.Status_Remarks || 'No remarks'}
                        </td>
                        <td className="px-4 py-1 text-gray-300 text-xs">
                          {jobOrder.Assigned_Email || 'Unassigned'}
                        </td>
                        <td className="px-4 py-1 text-gray-300 whitespace-nowrap text-xs">
                          {jobOrder.Contract_Template || 'Standard'}
                        </td>
                        <td className="px-4 py-1 text-gray-300 whitespace-nowrap text-center text-xs">
                          {jobOrder.Billing_Day || '-'}
                        </td>
                        <td className="px-4 py-1 text-gray-300 whitespace-nowrap text-xs">
                          {formatPrice(jobOrder.Installation_Fee)}
                        </td>
                        <td className="px-4 py-1 text-gray-300 whitespace-nowrap text-xs">
                          {jobOrder.Modified_By || 'System'}
                        </td>
                        <td className="px-4 py-1 text-gray-300 whitespace-nowrap text-xs">
                          {formatDate(jobOrder.Modified_Date)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                        {jobOrders.length > 0
                          ? 'No job orders found matching your filters'
                          : 'No job orders found. Create your first job order.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Job Order Detail View - Only visible when a job order is selected */}
      {selectedJobOrder && (
        <div className="flex-1 overflow-hidden">
          <JobOrderDetails 
            jobOrder={selectedJobOrder} 
            onClose={() => setSelectedJobOrder(null)}
          />
        </div>
      )}
    </div>
  );
};

export default JobOrder;