import React, { useState, useEffect } from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';
import ApplicationVisitDetails from '../components/ApplicationVisitDetails';
import { getApplicationVisits } from '../services/applicationVisitService';
import { getApplication } from '../services/applicationService';

// Interfaces for application visit data
interface ApplicationVisit {
  id: string;
  application_id: string;
  scheduled_date: string;
  visit_by: string;
  visit_with?: string;
  visit_with_other?: string;
  visit_type: string;
  visit_status: string;
  visit_remarks?: string;
  status_remarks?: string;
  referred_by?: string;
  visit_notes?: string;
  first_name: string;
  middle_initial?: string;
  last_name: string;
  contact_number: string;
  second_contact_number?: string;
  email_address: string;
  address: string;
  location: string;
  barangay?: string;
  city?: string;
  region?: string;
  choose_plan?: string;
  installation_landmark?: string;
  assigned_email?: string;
  modified_by: string;
  modified_date: string;
  created_at: string;
  updated_at: string;
  application_status?: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const ApplicationVisit: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<ApplicationVisit | null>(null);
  const [applicationVisits, setApplicationVisits] = useState<ApplicationVisit[]>([]);
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

  // Fetch data from API
  useEffect(() => {
    const fetchApplicationVisits = async () => {
      try {
        setLoading(true);
        console.log('Fetching application visits...');
        
        // Get all application visit data
        const response = await getApplicationVisits('all');
        console.log('API Response:', response);
        
        if (response.success && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} application visits`);
          
          // If we have data, log the first item to help with debugging
          if (response.data.length > 0) {
            console.log('First item example:', response.data[0]);
          }
          
          // Map the API response to our interface
          const visits: ApplicationVisit[] = response.data.map((visit: any) => ({
            id: visit.id ? String(visit.id) : '',
            application_id: visit.application_id ? String(visit.application_id) : '',
            scheduled_date: visit.scheduled_date || '',
            visit_by: visit.visit_by || '',
            visit_with: visit.visit_with || '',
            visit_with_other: visit.visit_with_other || '',
            visit_type: visit.visit_type || 'Initial Visit',
            visit_status: visit.visit_status || 'Scheduled',
            visit_remarks: visit.visit_remarks || '',
            status_remarks: visit.status_remarks || visit.visit_remarks || '',
            referred_by: visit.referred_by || '',
            visit_notes: visit.visit_notes || '',
            first_name: visit.first_name || '',
            middle_initial: visit.middle_initial || '',
            last_name: visit.last_name || '',
            contact_number: visit.contact_number || '',
            second_contact_number: visit.second_contact_number || '',
            email_address: visit.email_address || '',
            address: visit.address || '',
            location: visit.location || '',
            barangay: visit.barangay || '',
            city: visit.city || '',
            region: visit.region || '',
            choose_plan: visit.choose_plan || '',
            installation_landmark: visit.installation_landmark || '',
            assigned_email: visit.assigned_email || '',
            modified_by: visit.modified_by || '',
            modified_date: visit.modified_date || new Date(visit.updated_at || Date.now()).toLocaleString(),
            created_at: visit.created_at || '',
            updated_at: visit.updated_at || '',
            application_status: visit.application_status || '',
          }));
          
          setApplicationVisits(visits);
          console.log('Application visits data processed successfully');
        } else {
          // If no visits are returned, set an empty array
          console.warn('No application visits returned from API or invalid response format', response);
          setApplicationVisits([]);
        }
      } catch (err: any) {
        console.error('Error fetching application visits:', err);
        setError(`Failed to load visits: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationVisits();
  }, []);

  // Generate location items with counts based on real data
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: applicationVisits.length
    }
  ];

  // Add unique locations from the data
  const locationSet = new Set<string>();
  applicationVisits.forEach(visit => {
    const location = (visit.location || visit.city || '').toLowerCase();
    if (location) {
      locationSet.add(location);
    }
  });
  const uniqueLocations = Array.from(locationSet);
    
  uniqueLocations.forEach(location => {
    if (location) {
      locationItems.push({
        id: location,
        name: location.charAt(0).toUpperCase() + location.slice(1), // Capitalize
        count: applicationVisits.filter(visit => 
          (visit.location || visit.city || '').toLowerCase() === location).length
      });
    }
  });

  // Filter application visits based on location and search query
  const filteredVisits = applicationVisits.filter(visit => {
    const visitLocation = (visit.location || visit.city || '').toLowerCase();
    const matchesLocation = selectedLocation === 'all' || visitLocation === selectedLocation;
    
    const fullName = `${visit.first_name} ${visit.middle_initial || ''} ${visit.last_name}`.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                         fullName.includes(searchQuery.toLowerCase()) ||
                         visit.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (visit.assigned_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

  const handleRowClick = async (visit: ApplicationVisit) => {
    try {
      // When selecting a visit, fetch the associated application data if needed
      if (!visit.application_status) {
        // Fetch application data to get the application status
        const applicationData = await getApplication(visit.application_id);
        
        // Update the visit with application data
        const updatedVisit = {
          ...visit,
          application_status: applicationData.status || 'Pending'
        };
        
        setSelectedVisit(updatedVisit);
      } else {
        setSelectedVisit(visit);
      }
    } catch (err: any) {
      console.error('Error fetching application data:', err);
      // Still set the selected visit even if we can't get the application data
      setSelectedVisit(visit);
    }
  };

  // Status text color component
  const StatusText = ({ status, type }: { status: string, type: 'visit' | 'application' }) => {
    let textColor = '';
    
    if (type === 'visit') {
      switch (status.toLowerCase()) {
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
    } else {
      switch (status.toLowerCase()) {
        case 'approved':
        case 'done':
          textColor = 'text-green-500';
          break;
        case 'pending':
          textColor = 'text-yellow-500';
          break;
        case 'under review':
        case 'scheduled':
          textColor = 'text-blue-500';
          break;
        case 'rejected':
        case 'failed':
          textColor = 'text-red-500';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-3"></div>
          <p className="text-gray-300">Loading application visits...</p>
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
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Application Visits</h2>
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

      {/* Application Visits List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden ${selectedVisit ? 'flex-1' : 'flex-1'}`}>
        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search application visits..."
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
                      Assigned Email
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Visit Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Application Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status Remarks
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Referred By
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Full Address
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Visit By
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Visit With
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Visit With(Other)
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Visit Remarks
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredVisits.length > 0 ? (
                    filteredVisits.map((visit) => (
                      <tr 
                        key={visit.id} 
                        className={`hover:bg-gray-800 cursor-pointer ${selectedVisit?.id === visit.id ? 'bg-gray-800' : ''}`}
                        onClick={() => handleRowClick(visit)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {formatDate(visit.scheduled_date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {`${visit.first_name} ${visit.middle_initial || ''} ${visit.last_name}`.trim()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.assigned_email || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusText status={visit.visit_status || 'Scheduled'} type="visit" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusText status={visit.application_status || 'Pending'} type="application" />
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {visit.status_remarks || 'No remarks'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.referred_by || 'None'}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {visit.address || 'No address'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.visit_by || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.visit_with || 'None'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.visit_with_other || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {visit.visit_remarks || 'No remarks'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.modified_date || formatDate(visit.updated_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.modified_by || 'System'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={14} className="px-4 py-12 text-center text-gray-400">
                        {applicationVisits.length > 0
                          ? 'No application visits found matching your filters'
                          : 'No application visits found. Create your first visit by scheduling from the Applications page.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Application Visit Detail View - Only visible when a visit is selected */}
      {selectedVisit && (
        <div className="flex-1 overflow-hidden">
          <ApplicationVisitDetails 
            applicationVisit={selectedVisit}
            onClose={() => setSelectedVisit(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ApplicationVisit;