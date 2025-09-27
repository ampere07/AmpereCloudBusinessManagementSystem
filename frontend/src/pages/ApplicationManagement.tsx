import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search } from 'lucide-react';
import ApplicationDetails from '../components/ApplicationDetails';
import { getApplications } from '../services/applicationService';
import { getCities, City } from '../services/cityService';
import { getRegions, Region } from '../services/regionService';
import { Application as ApiApplication } from '../types/application';
import { locationEvents, LOCATION_EVENTS } from '../services/locationEvents';

interface Application {
  id: string;
  customerName: string;
  timestamp: string;
  address: string;
  action?: 'Schedule' | 'Duplicate';
  location: string;
  cityId?: number | null;
  regionId?: number | null;
  boroughId?: number | null;
  villageId?: number | null;
  addressLine?: string;
  fullAddress?: string;
  createDate?: string;
  createTime?: string;
  status?: string;
  email?: string;
  mobileNumber?: string;
  secondaryNumber?: string;
  visitDate?: string;
  visitBy?: string;
  visitWith?: string;
  notes?: string;
  lastModified?: string;
  modifiedBy?: string;
  // Additional fields from the database
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  landmark?: string;
  nearestLandmark1?: string;
  nearestLandmark2?: string;
  planId?: string | number;
  promoId?: string | number;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

type DisplayMode = 'card';

const ApplicationManagement: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locationDataLoaded, setLocationDataLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cities and regions data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const [citiesData, regionsData] = await Promise.all([
          getCities(),
          getRegions()
        ]);
        setCities(citiesData || []);
        setRegions(regionsData || []);
        setLocationDataLoaded(true);
      } catch (err) {
        console.error('Failed to fetch location data:', err);
        setCities([]);
        setRegions([]);
        setLocationDataLoaded(true); // Still set to true to avoid infinite loading
      }
    };
    
    fetchLocationData();
  }, []);

  // Helper functions to get names from IDs
  const getCityName = (cityId: number | null | undefined): string => {
    if (!cityId) return 'Unknown City';
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  const getRegionName = (regionId: number | null | undefined): string => {
    if (!regionId) return 'Unknown Region';
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : `Region ${regionId}`;
  };

  // Fetch applications data - only after location data is loaded
  useEffect(() => {
    if (!locationDataLoaded) return;
    
    fetchApplications();
  }, [locationDataLoaded]);

  // Function to fetch applications (extracted for reuse)
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const apiApplications = await getApplications();
      console.log('Fetched applications:', apiApplications);
      
      if (apiApplications && apiApplications.length > 0) {
        // Transform API applications to match our interface
        const transformedApplications: Application[] = apiApplications.map(app => {
          const cityIdValue = app.city_id;
          const convertedCityId = cityIdValue !== undefined && cityIdValue !== null && cityIdValue !== '' ? 
                                 Number(cityIdValue) : null;
          const convertedRegionId = app.region_id !== undefined && app.region_id !== null && app.region_id !== '' ?
                                  Number(app.region_id) : null;
          
          // Calculate full address using the helper functions
          const regionName = getRegionName(convertedRegionId);
          const cityName = getCityName(convertedCityId);
          const addressLine = app.address_line || app.address || '';
          const fullAddress = `${regionName}, ${cityName}, ${addressLine}`;
          
          return {
            id: app.id || '',
            customerName: app.customer_name || `${app.first_name || ''} ${app.middle_initial || ''} ${app.last_name || ''}`.trim(),
            timestamp: app.timestamp || (app.create_date && app.create_time ? `${app.create_date} ${app.create_time}` : ''),
            address: addressLine,
            // Determine action based on status
            action: app.status === 'pending' || app.status === 'new' ? 'Schedule' : 
                   app.status === 'duplicate' ? 'Duplicate' : undefined,
            location: app.location || '',
            status: app.status,
            cityId: convertedCityId,
            regionId: convertedRegionId,
            boroughId: app.borough_id !== undefined && app.borough_id !== null && app.borough_id !== '' ?
                      Number(app.borough_id) : null,
            villageId: app.village_id !== undefined && app.village_id !== null && app.village_id !== '' ?
                      Number(app.village_id) : null,
            addressLine: addressLine,
            fullAddress: fullAddress,
            createDate: app.create_date || '',
            createTime: app.create_time || '',
            email: app.email,
            mobileNumber: app.mobile_number || app.mobile,
            secondaryNumber: app.secondary_number || app.mobile_alt,
            visitDate: app.visit_date,
            visitBy: app.visit_by,
            visitWith: app.visit_with,
            notes: app.notes,
            lastModified: app.last_modified || app.update_date,
            modifiedBy: app.modified_by,
            // Add additional fields directly from the database
            firstName: app.first_name,
            middleInitial: app.middle_initial,
            lastName: app.last_name,
            landmark: app.landmark,
            nearestLandmark1: app.nearest_landmark1,
            nearestLandmark2: app.nearest_landmark2,
            planId: app.plan_id,
            promoId: app.promo_id
          };
        });
        
        setApplications(transformedApplications);
        console.log('Transformed applications:', transformedApplications);
      } else {
        console.log('No applications found');
        setApplications([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications. Please try again.');
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle application refresh when status is updated
  const handleApplicationUpdate = () => {
    fetchApplications();
  };
  
  // Listen for location updates to refresh city data
  useEffect(() => {
    const handleLocationUpdate = async () => {
      try {
        console.log('Location updated, refreshing cities...');
        const citiesData = await getCities();
        console.log('Updated cities:', citiesData);
        setCities(citiesData || []);
      } catch (err) {
        console.error('Failed to refresh cities after location update:', err);
      }
    };

    // Subscribe to location update events
    locationEvents.on(LOCATION_EVENTS.LOCATIONS_UPDATED, handleLocationUpdate);

    // Cleanup subscription
    return () => {
      locationEvents.off(LOCATION_EVENTS.LOCATIONS_UPDATED, handleLocationUpdate);
    };
  }, []);
  
  // Generate location items with counts from cities data - memoized for performance
  const locationItems: LocationItem[] = useMemo(() => {
    const items: LocationItem[] = [
      {
        id: 'all',
        name: 'All',
        count: applications.length
      }
    ];
    
    // Add all cities from the database
    if (cities.length > 0) {
      cities.forEach(city => {
        // Count applications that match this city ID
        const cityCount = applications.filter(app => 
          app.cityId === city.id
        ).length;
        
        // Add city to location items
        items.push({
          id: String(city.id),
          name: city.name,
          count: cityCount
        });
      });
    }
    
    return items;
  }, [cities, applications]);

  // Filter applications based on location and search query - memoized for performance
  const filteredApplications = useMemo(() => {
    return applications.filter(application => {
      // Apply location filter
      const matchesLocation = selectedLocation === 'all' || 
                             application.cityId === Number(selectedLocation);
      
      // Apply search query filter
      const matchesSearch = searchQuery === '' || 
                           application.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           application.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (application.timestamp && application.timestamp.includes(searchQuery));
      
      return matchesLocation && matchesSearch;
    });
  }, [applications, selectedLocation, searchQuery]);

  const handleRowClick = (application: Application) => {
    setSelectedApplication(application);
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Location Sidebar Container */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Application</h2>
            <button 
              className="bg-orange-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              aria-label="Application"
            >
              <span>Application</span>
            </button>
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

      {/* Applications List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden ${selectedApplication ? 'w-1/3' : 'flex-1'}`}>
        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={() => fetchApplications()}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Applications List Container */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-1/3 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
                  </div>
                  <p className="mt-4">Loading applications...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-12 text-center text-red-400">
                  <p>{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                    Retry
                  </button>
                </div>
              ) : filteredApplications.length > 0 ? (
                <div className="space-y-0">
                  {filteredApplications.map((application) => (
                    <div
                      key={application.id}
                      onClick={() => handleRowClick(application)}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800 ${selectedApplication?.id === application.id ? 'bg-gray-800' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm mb-1 uppercase">
                            {application.customerName || `${application.firstName || ''} ${application.middleInitial || ''} ${application.lastName || ''}`.trim()}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {application.createDate && application.createTime 
                              ? `${application.createDate} ${application.createTime}` 
                              : application.timestamp || 'Not specified'}
                            {' | '}
                            {[
                              application.fullAddress || application.address,
                              getRegionName(application.regionId)
                            ].filter(Boolean).join(', ')}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1 ml-4 flex-shrink-0">
                          {application.status && (
                            <div className={`text-xs px-2 py-1 rounded ${
                              application.status.toLowerCase() === 'schedule' ? 'text-green-400 bg-green-400 bg-opacity-10' :
                              application.status.toLowerCase() === 'no facility' ? 'text-red-400 bg-red-400 bg-opacity-10' :
                              application.status.toLowerCase() === 'cancelled' ? 'text-red-500 bg-red-500 bg-opacity-10' :
                              application.status.toLowerCase() === 'no slot' ? 'text-yellow-400 bg-yellow-400 bg-opacity-10' :
                              application.status.toLowerCase() === 'duplicate' ? 'text-yellow-500 bg-yellow-500 bg-opacity-10' :
                              application.status.toLowerCase() === 'in progress' ? 'text-blue-400 bg-blue-400 bg-opacity-10' :
                              application.status.toLowerCase() === 'completed' ? 'text-green-400 bg-green-400 bg-opacity-10' :
                              'text-orange-400 bg-orange-400 bg-opacity-10'
                            }`}>
                              {application.status}
                            </div>
                          )}
                          {application.action && (
                            <div className={`text-xs px-2 py-1 rounded ${application.action === 'Duplicate' ? 'text-yellow-500 bg-yellow-500 bg-opacity-10' : 'bg-green-500 bg-opacity-10 text-green-500'}`}>
                              {application.action}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No applications found matching your filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail View - Only visible when an application is selected */}
      {selectedApplication && (
        <div className="flex-1 overflow-hidden">
          <ApplicationDetails 
            application={selectedApplication} 
            onClose={() => setSelectedApplication(null)}
            onApplicationUpdate={handleApplicationUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;