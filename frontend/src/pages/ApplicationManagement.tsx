import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Search, ListFilter, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
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
  location: string;
  city?: string;
  region?: string;
  barangay?: string;
  status?: string;
  email_address?: string;
  first_name?: string;
  middle_initial?: string;
  last_name?: string;
  mobile_number?: string;
  secondary_mobile_number?: string;
  installation_address?: string;
  landmark?: string;
  desired_plan?: string;
  promo?: string;
  referred_by?: string;
  create_date?: string;
  create_time?: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

type DisplayMode = 'card' | 'table';

// All available columns from applications table
const allColumns = [
  { key: 'timestamp', label: 'Timestamp', width: 'min-w-40' },
  { key: 'customerName', label: 'Customer Name', width: 'min-w-48' },
  { key: 'firstName', label: 'First Name', width: 'min-w-32' },
  { key: 'middleInitial', label: 'Middle Initial', width: 'min-w-28' },
  { key: 'lastName', label: 'Last Name', width: 'min-w-32' },
  { key: 'emailAddress', label: 'Email Address', width: 'min-w-48' },
  { key: 'mobileNumber', label: 'Mobile Number', width: 'min-w-36' },
  { key: 'secondaryMobileNumber', label: 'Secondary Mobile Number', width: 'min-w-40' },
  { key: 'installationAddress', label: 'Installation Address', width: 'min-w-56' },
  { key: 'landmark', label: 'Landmark', width: 'min-w-32' },
  { key: 'region', label: 'Region', width: 'min-w-28' },
  { key: 'city', label: 'City', width: 'min-w-28' },
  { key: 'barangay', label: 'Barangay', width: 'min-w-32' },
  { key: 'location', label: 'Location', width: 'min-w-40' },
  { key: 'desiredPlan', label: 'Desired Plan', width: 'min-w-36' },
  { key: 'promo', label: 'Promo', width: 'min-w-28' },
  { key: 'referredBy', label: 'Referred By', width: 'min-w-32' },
  { key: 'status', label: 'Status', width: 'min-w-28' },
  { key: 'createDate', label: 'Create Date', width: 'min-w-32' },
  { key: 'createTime', label: 'Create Time', width: 'min-w-28' }
];

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
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allColumns.map(col => col.key));
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
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
        setLocationDataLoaded(true);
      }
    };
    
    fetchLocationData();
  }, []);

  // Fetch applications data - only after location data is loaded
  useEffect(() => {
    if (!locationDataLoaded) return;
    fetchApplications();
  }, [locationDataLoaded]);

  // Function to fetch applications (extracted for reuse) from 'applications' table
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const apiApplications = await getApplications();
      
      if (apiApplications && apiApplications.length > 0) {
        const transformedApplications: Application[] = apiApplications.map(app => {
          const regionName = app.region || '';
          const cityName = app.city || '';
          const barangayName = app.barangay || '';
          const addressLine = app.installation_address || app.address_line || app.address || '';
          const fullAddress = [regionName, cityName, barangayName, addressLine].filter(Boolean).join(', ');
          
          return {
            id: app.id || '',
            customerName: app.customer_name || `${app.first_name || ''} ${app.middle_initial || ''} ${app.last_name || ''}`.trim(),
            timestamp: app.timestamp || (app.create_date && app.create_time ? `${app.create_date} ${app.create_time}` : ''),
            address: addressLine,
            location: app.location || fullAddress,
            status: app.status || 'pending',
            city: cityName,
            region: regionName,
            barangay: barangayName,
            email_address: app.email_address,
            first_name: app.first_name,
            middle_initial: app.middle_initial,
            last_name: app.last_name,
            mobile_number: app.mobile_number,
            secondary_mobile_number: app.secondary_mobile_number,
            installation_address: app.installation_address,
            landmark: app.landmark,
            desired_plan: app.desired_plan,
            promo: app.promo,
            referred_by: app.referred_by,
            create_date: app.create_date,
            create_time: app.create_time
          };
        });
        
        setApplications(transformedApplications);
      } else {
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
        const citiesData = await getCities();
        setCities(citiesData || []);
      } catch (err) {
        console.error('Failed to refresh cities after location update:', err);
      }
    };

    locationEvents.on(LOCATION_EVENTS.LOCATIONS_UPDATED, handleLocationUpdate);

    return () => {
      locationEvents.off(LOCATION_EVENTS.LOCATIONS_UPDATED, handleLocationUpdate);
    };
  }, []);
  
  // Generate location items with counts from string-based city data
  const locationItems: LocationItem[] = useMemo(() => {
    const items: LocationItem[] = [
      {
        id: 'all',
        name: 'All',
        count: applications.length
      }
    ];
    
    // Group by city string values
    const cityGroups: Record<string, number> = {};
    applications.forEach(app => {
      const cityKey = app.city || 'Unknown';
      cityGroups[cityKey] = (cityGroups[cityKey] || 0) + 1;
    });
    
    // Add city groups to location items
    Object.entries(cityGroups).forEach(([cityName, count]) => {
      items.push({
        id: cityName.toLowerCase(),
        name: cityName,
        count: count
      });
    });
    
    // Add cities from database for compatibility (with zero count if not in data)
    cities.forEach(city => {
      if (!cityGroups[city.name]) {
        items.push({
          id: String(city.id),
          name: city.name,
          count: 0
        });
      }
    });
    
    return items;
  }, [cities, applications]);

  // Filter applications based on location and search query
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter(application => {
      const matchesLocation = selectedLocation === 'all' || 
                             (application.city && application.city.toLowerCase() === selectedLocation) ||  
                             selectedLocation === (application.city || '').toLowerCase();
      
      const matchesSearch = searchQuery === '' || 
                           application.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           application.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (application.timestamp && application.timestamp.includes(searchQuery));
      
      return matchesLocation && matchesSearch;
    });

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';

        switch (sortColumn) {
          case 'timestamp':
            aValue = a.create_date && a.create_time ? `${a.create_date} ${a.create_time}` : a.timestamp || '';
            bValue = b.create_date && b.create_time ? `${b.create_date} ${b.create_time}` : b.timestamp || '';
            break;
          case 'customerName':
            aValue = a.customerName || '';
            bValue = b.customerName || '';
            break;
          case 'firstName':
            aValue = a.first_name || '';
            bValue = b.first_name || '';
            break;
          case 'middleInitial':
            aValue = a.middle_initial || '';
            bValue = b.middle_initial || '';
            break;
          case 'lastName':
            aValue = a.last_name || '';
            bValue = b.last_name || '';
            break;
          case 'emailAddress':
            aValue = a.email_address || '';
            bValue = b.email_address || '';
            break;
          case 'mobileNumber':
            aValue = a.mobile_number || '';
            bValue = b.mobile_number || '';
            break;
          case 'secondaryMobileNumber':
            aValue = a.secondary_mobile_number || '';
            bValue = b.secondary_mobile_number || '';
            break;
          case 'installationAddress':
            aValue = a.installation_address || a.address || '';
            bValue = b.installation_address || b.address || '';
            break;
          case 'landmark':
            aValue = a.landmark || '';
            bValue = b.landmark || '';
            break;
          case 'region':
            aValue = a.region || '';
            bValue = b.region || '';
            break;
          case 'city':
            aValue = a.city || '';
            bValue = b.city || '';
            break;
          case 'barangay':
            aValue = a.barangay || '';
            bValue = b.barangay || '';
            break;
          case 'location':
            aValue = a.location || '';
            bValue = b.location || '';
            break;
          case 'desiredPlan':
            aValue = a.desired_plan || '';
            bValue = b.desired_plan || '';
            break;
          case 'promo':
            aValue = a.promo || '';
            bValue = b.promo || '';
            break;
          case 'referredBy':
            aValue = a.referred_by || '';
            bValue = b.referred_by || '';
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          case 'createDate':
            aValue = a.create_date || '';
            bValue = b.create_date || '';
            break;
          case 'createTime':
            aValue = a.create_time || '';
            bValue = b.create_time || '';
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [applications, selectedLocation, searchQuery, sortColumn, sortDirection]);

  const handleRowClick = (application: Application) => {
    setSelectedApplication(application);
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

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection('asc');
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const filteredColumns = allColumns.filter(col => visibleColumns.includes(col.key));

  const renderCellValue = (application: Application, columnKey: string) => {
    switch (columnKey) {
      case 'timestamp':
        return application.create_date && application.create_time 
          ? `${application.create_date} ${application.create_time}` 
          : application.timestamp || '-';
      case 'customerName':
        return application.customerName;
      case 'firstName':
        return application.first_name || '-';
      case 'middleInitial':
        return application.middle_initial || '-';
      case 'lastName':
        return application.last_name || '-';
      case 'emailAddress':
        return application.email_address || '-';
      case 'mobileNumber':
        return application.mobile_number || '-';
      case 'secondaryMobileNumber':
        return application.secondary_mobile_number || '-';
      case 'installationAddress':
        return application.installation_address || application.address || '-';
      case 'landmark':
        return application.landmark || '-';
      case 'region':
        return application.region || '-';
      case 'city':
        return application.city || '-';
      case 'barangay':
        return application.barangay || '-';
      case 'location':
        return application.location || '-';
      case 'desiredPlan':
        return application.desired_plan || '-';
      case 'promo':
        return application.promo || '-';
      case 'referredBy':
        return application.referred_by || '-';
      case 'status':
        return (
          <span className={`text-xs px-2 py-1 ${
            application.status?.toLowerCase() === 'schedule' ? 'text-green-400' :
            application.status?.toLowerCase() === 'no facility' ? 'text-red-400' :
            application.status?.toLowerCase() === 'cancelled' ? 'text-red-500' :
            application.status?.toLowerCase() === 'no slot' ? 'text-yellow-400' :
            application.status?.toLowerCase() === 'duplicate' ? 'text-yellow-500' :
            application.status?.toLowerCase() === 'in progress' ? 'text-blue-400' :
            application.status?.toLowerCase() === 'completed' ? 'text-green-400' :
            application.status?.toLowerCase() === 'pending' ? 'text-orange-400' :
            'text-gray-400'
          }`}>
            {application.status || '-'}
          </span>
        );
      case 'createDate':
        return application.create_date || '-';
      case 'createTime':
        return application.create_time || '-';
      default:
        return '-';
    }
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Location Sidebar Container */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Applications</h2>
            <button 
              className="bg-orange-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              aria-label="Applications"
            >
              <span>Form</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {locationItems.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location.id)}
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
                  onClick={() => fetchApplications()}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
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
              ) : displayMode === 'card' ? (
                filteredApplications.length > 0 ? (
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
                              {application.customerName}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {application.create_date && application.create_time 
                                ? `${application.create_date} ${application.create_time}` 
                                : application.timestamp || 'Not specified'}
                              {' | '}
                              {[
                                application.installation_address || application.address,
                                application.location,
                                application.barangay,
                                application.city,
                                application.region
                              ].filter(Boolean).join(', ')}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 ml-4 flex-shrink-0">
                            {application.status && (
                              <div className={`text-xs px-2 py-1 ${
                                application.status.toLowerCase() === 'schedule' ? 'text-green-400' :
                                application.status.toLowerCase() === 'no facility' ? 'text-red-400' :
                                application.status.toLowerCase() === 'cancelled' ? 'text-red-500' :
                                application.status.toLowerCase() === 'no slot' ? 'text-yellow-400' :
                                application.status.toLowerCase() === 'duplicate' ? 'text-yellow-500' :
                                application.status.toLowerCase() === 'in progress' ? 'text-blue-400' :
                                application.status.toLowerCase() === 'completed' ? 'text-green-400' :
                                application.status.toLowerCase() === 'pending' ? 'text-orange-400' :
                                'text-gray-400'
                              }`}>
                                {application.status}
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
                )
              ) : (
                <div className="overflow-x-auto overflow-y-hidden">
                  <table className="w-max min-w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
                        {filteredColumns.map((column, index) => (
                          <th
                            key={column.key}
                            className={`text-left py-3 px-3 text-gray-400 font-normal bg-gray-800 ${column.width} whitespace-nowrap ${index < filteredColumns.length - 1 ? 'border-r border-gray-700' : ''} relative group`}
                            onMouseEnter={() => setHoveredColumn(column.key)}
                            onMouseLeave={() => setHoveredColumn(null)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{column.label}</span>
                              {(hoveredColumn === column.key || sortColumn === column.key) && (
                                <button
                                  onClick={() => handleSort(column.key)}
                                  className="ml-2 transition-colors"
                                >
                                  {sortColumn === column.key && sortDirection === 'desc' ? (
                                    <ArrowDown className="h-4 w-4 text-orange-400" />
                                  ) : (
                                    <ArrowUp className="h-4 w-4 text-gray-400 hover:text-orange-400" />
                                  )}
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((application) => (
                          <tr 
                            key={application.id} 
                            className={`border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors ${selectedApplication?.id === application.id ? 'bg-gray-800' : ''}`}
                            onClick={() => handleRowClick(application)}
                          >
                            {filteredColumns.map((column, index) => (
                              <td 
                                key={column.key}
                                className={`py-4 px-3 text-white whitespace-nowrap ${index < filteredColumns.length - 1 ? 'border-r border-gray-800' : ''}`}
                              >
                                {renderCellValue(application, column.key)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={filteredColumns.length} className="px-4 py-12 text-center text-gray-400 border-b border-gray-800">
                            No applications found matching your filters
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
