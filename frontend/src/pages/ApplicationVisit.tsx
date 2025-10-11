import React, { useState, useEffect } from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';
import ApplicationVisitDetails from '../components/ApplicationVisitDetails';
import { getAllApplicationVisits } from '../services/applicationVisitService';
import { getApplication } from '../services/applicationService';

// Interfaces for application visit data from 'application_visits' table (previously 'application_visit')
interface ApplicationVisit {
  id: string;
  application_id: string;
  timestamp: string;
  assigned_email?: string;
  visit_by_user_email?: string;
  visit_with?: string;
  visit_status: string;
  visit_remarks?: string;
  status_remarks?: string;
  application_status?: string;
  full_name: string;
  full_address: string;
  referred_by?: string;
  updated_by_user_email: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  middle_initial?: string;
  last_name?: string;
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
  const [userRole, setUserRole] = useState<string>('');

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
    const fetchApplicationVisits = async () => {
      try {
        setLoading(true);
        
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
        
        const response = await getAllApplicationVisits(assignedEmail);
        console.log('API Response:', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch application visits');
        }
        
        if (response.success && Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} application visits`);
          
          if (response.data.length > 0) {
            console.log('First item example:', response.data[0]);
          }
          
          const visits: ApplicationVisit[] = response.data.map((visit: any) => ({
            id: visit.id || '',
            application_id: visit.application_id || '',
            timestamp: visit.timestamp || visit.created_at || '',
            assigned_email: visit.assigned_email || '',
            visit_by_user_email: visit.visit_by_user_email || '',
            visit_with: visit.visit_with || '',
            visit_status: visit.visit_status || 'Scheduled',
            visit_remarks: visit.visit_remarks || '',
            status_remarks: visit.status_remarks || '',
            application_status: visit.application_status || 'Pending',
            full_name: visit.full_name || '',
            full_address: visit.full_address || '',
            referred_by: visit.referred_by || '',
            updated_by_user_email: visit.updated_by_user_email || 'System',
            created_at: visit.created_at || '',
            updated_at: visit.updated_at || '',
            first_name: visit.first_name || '',
            middle_initial: visit.middle_initial || '',
            last_name: visit.last_name || '',
          }));
          
          setApplicationVisits(visits);
          setError(null);
          console.log('Application visits data processed successfully', visits);
        } else {
          console.warn('No application visits returned from API or invalid response format', response);
          setApplicationVisits([]);
          if (response.message) {
            setError(response.message);
          }
        }
      } catch (err: any) {
        console.error('Error fetching application visits:', err);
        setError(err.message || 'Failed to load application visits. Please try again.');
        setApplicationVisits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationVisits();
  }, []);

  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: applicationVisits.length
    }
  ];

  const locationSet = new Set<string>();
  applicationVisits.forEach(visit => {
    const addressParts = visit.full_address.split(',');
    const city = addressParts.length > 3 ? addressParts[3].trim() : '';
    if (city) {
      locationSet.add(city.toLowerCase());
    }
  });
  const uniqueLocations = Array.from(locationSet);
    
  uniqueLocations.forEach(location => {
    if (location) {
      locationItems.push({
        id: location,
        name: location.charAt(0).toUpperCase() + location.slice(1),
        count: applicationVisits.filter(visit => {
          const addressParts = visit.full_address.split(',');
          const city = addressParts.length > 3 ? addressParts[3].trim() : '';
          return city.toLowerCase() === location;
        }).length
      });
    }
  });

  const filteredVisits = applicationVisits.filter(visit => {
    const addressParts = visit.full_address.split(',');
    const city = addressParts.length > 3 ? addressParts[3].trim().toLowerCase() : '';
    const matchesLocation = selectedLocation === 'all' || city === selectedLocation;
    
    const matchesSearch = searchQuery === '' || 
                         visit.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         visit.full_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (visit.assigned_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

  const handleRowClick = async (visit: ApplicationVisit) => {
    try {
      if (!visit.application_status) {
        try {
          const applicationData = await getApplication(visit.application_id);
          
          const updatedVisit = {
            ...visit,
            application_status: applicationData.status || 'Pending'
          };
          
          setSelectedVisit(updatedVisit);
        } catch (err: any) {
          console.error('Error fetching application data:', err);
          setSelectedVisit(visit);
        }
      } else {
        setSelectedVisit(visit);
      }
    } catch (err: any) {
      console.error('Error selecting visit:', err);
      setError(`Failed to select visit: ${err.message || 'Unknown error'}`);
    }
  };

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
          <div className="flex flex-col space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
            >
              Retry
            </button>
            
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
                    Verify that the table 'application_visits' exists in your database.
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
      )}

      {/* Application Visits List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden flex-1`}>
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
                          {formatDate(visit.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.full_name}
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
                          {visit.full_address || 'No address'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.visit_by_user_email || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.visit_with || 'None'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          N/A
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {visit.visit_remarks || 'No remarks'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {formatDate(visit.updated_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {visit.updated_by_user_email}
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
        <div className="w-full max-w-2xl overflow-hidden">
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