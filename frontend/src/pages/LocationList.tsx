import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import AddLocationModal from '../modals/AddLocationModal';
import EditLocationModal from '../modals/EditLocationModal';
import LocationDetailsModal from '../modals/LocationDetailsModal';
import { 
  getRegions, 
  getCities, 
  getBoroughs, 
  getLocations, 
  deleteRegion, 
  deleteCity, 
  deleteBarangay, 
  deleteLocation,
  Region, 
  City, 
  Borough, 
  LocationDetail 
} from '../services/cityService';

interface LocationItem {
  id: number;
  name: string;
  type: 'city' | 'region' | 'borough' | 'location';
  parentId?: number;
  parentName?: string;
  cityId?: number;
  regionId?: number;
  boroughId?: number;
}

interface SidebarFilter {
  type: 'all' | 'region' | 'city' | 'borough';
  id?: number;
}

const LocationList: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>({ type: 'all' });
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [boroughs, setBoroughs] = useState<Borough[]>([]);
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRegions, setExpandedRegions] = useState<Set<number>>(new Set());
  const [expandedCities, setExpandedCities] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [regionsData, citiesData, boroughsData, locationsData] = await Promise.all([
        getRegions(),
        getCities(),
        getBoroughs(),
        getLocations()
      ]);
      
      setRegions(regionsData);
      setCities(citiesData);
      setBoroughs(boroughsData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError('Failed to load location data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const allLocations: LocationItem[] = useMemo(() => {
    const locationItems: LocationItem[] = [];

    cities.forEach(city => {
      locationItems.push({
        id: city.id,
        name: city.name,
        type: 'city',
        parentId: city.region_id,
        parentName: regions.find(r => r.id === city.region_id)?.name,
        regionId: city.region_id
      });
    });

    regions.forEach(region => {
      locationItems.push({
        id: region.id,
        name: region.name,
        type: 'region',
        regionId: region.id
      });
    });

    boroughs.forEach(borough => {
      const city = cities.find(c => c.id === borough.city_id);
      const region = regions.find(r => r.id === city?.region_id);
      
      locationItems.push({
        id: borough.id,
        name: borough.name,
        type: 'borough',
        parentId: borough.city_id,
        parentName: city?.name,
        cityId: borough.city_id,
        regionId: city?.region_id
      });
    });

    locations.forEach(location => {
      const borough = boroughs.find(b => b.id === location.barangay_id);
      const city = cities.find(c => c.id === borough?.city_id);
      
      locationItems.push({
        id: location.id,
        name: location.location_name,
        type: 'location',
        parentId: location.barangay_id,
        parentName: borough?.name,
        boroughId: location.barangay_id,
        cityId: borough?.city_id,
        regionId: city?.region_id
      });
    });

    return locationItems;
  }, [cities, regions, boroughs, locations]);

  const filteredLocations = useMemo(() => {
    const filtered = allLocations.filter(location => {
      const matchesSearch = searchQuery === '' || 
                           location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (location.parentName && location.parentName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesSidebar = false;
      if (sidebarFilter.type === 'all') {
        matchesSidebar = true;
      } else if (sidebarFilter.type === 'region') {
        matchesSidebar = location.regionId === sidebarFilter.id;
      } else if (sidebarFilter.type === 'city') {
        matchesSidebar = location.cityId === sidebarFilter.id || (location.type === 'city' && location.id === sidebarFilter.id);
      } else if (sidebarFilter.type === 'borough') {
        matchesSidebar = location.boroughId === sidebarFilter.id || (location.type === 'borough' && location.id === sidebarFilter.id);
      }
      
      return matchesSearch && matchesSidebar;
    });

    return filtered.sort((a, b) => {
      const isASelected = 
        (sidebarFilter.type === 'region' && a.type === 'region' && a.id === sidebarFilter.id) ||
        (sidebarFilter.type === 'city' && a.type === 'city' && a.id === sidebarFilter.id) ||
        (sidebarFilter.type === 'borough' && a.type === 'borough' && a.id === sidebarFilter.id);
      
      const isBSelected = 
        (sidebarFilter.type === 'region' && b.type === 'region' && b.id === sidebarFilter.id) ||
        (sidebarFilter.type === 'city' && b.type === 'city' && b.id === sidebarFilter.id) ||
        (sidebarFilter.type === 'borough' && b.type === 'borough' && b.id === sidebarFilter.id);
      
      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      
      const typeOrder: Record<string, number> = { region: 1, city: 2, borough: 3, location: 4 };
      const typeComparison = (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
      
      if (typeComparison !== 0) {
        return typeComparison;
      }
      
      return a.name.localeCompare(b.name);
    });
  }, [allLocations, searchQuery, sidebarFilter]);

  const toggleRegion = (regionId: number) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId);
    } else {
      newExpanded.add(regionId);
    }
    setExpandedRegions(newExpanded);
  };

  const toggleCity = (cityId: number) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityId)) {
      newExpanded.delete(cityId);
    } else {
      newExpanded.add(cityId);
    }
    setExpandedCities(newExpanded);
  };

  const getCountForRegion = (regionId: number): number => {
    return allLocations.filter(loc => loc.regionId === regionId).length;
  };

  const getCountForCity = (cityId: number): number => {
    return allLocations.filter(loc => loc.cityId === cityId || (loc.type === 'city' && loc.id === cityId)).length;
  };

  const getCountForBarangay = (boroughId: number): number => {
    return allLocations.filter(loc => loc.boroughId === boroughId || (loc.type === 'borough' && loc.id === boroughId)).length;
  };

  const handleAddLocation = (locationData: any) => {
    fetchLocationData();
  };

  const handleLocationClick = (location: LocationItem) => {
    setSelectedLocation(location);
    setIsDetailsModalOpen(true);
  };

  const handleEditFromDetails = (location: LocationItem) => {
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteFromDetails = (location: LocationItem) => {
    setIsDetailsModalOpen(false);
    handleDeleteLocation(location, { stopPropagation: () => {} } as React.MouseEvent);
  };

  const handleEditLocation = (location: LocationItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedLocation(location);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedLocation: LocationItem) => {
    try {
      await fetchLocationData();
      setIsEditModalOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to update location. Please try again.');
    }
  };

  const handleDeleteLocation = async (location: LocationItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const confirmMessage = `Are you sure you want to delete ${location.name}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      switch (location.type) {
        case 'region':
          await deleteRegion(location.id, false);
          break;
        case 'city':
          await deleteCity(location.id, false);
          break;
        case 'borough':
          await deleteBarangay(location.id, false);
          break;
        case 'location':
          await deleteLocation(location.id);
          break;
        default:
          throw new Error(`Unknown location type: ${location.type}`);
      }
      
      await fetchLocationData();
      setIsDetailsModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedLocation(null);
    } catch (error: any) {
      console.error('Error deleting location:', error);
      
      if (error.response?.status === 422 && error.response?.data?.data?.can_cascade) {
        const data = error.response.data.data;
        
        let cascadeMessage = `${location.name} contains:\n\n`;
        
        if (data.type === 'region') {
          cascadeMessage += `- ${data.city_count} ${data.city_count === 1 ? 'city' : 'cities'}\n`;
          cascadeMessage += `- ${data.barangay_count} ${data.barangay_count === 1 ? 'barangay' : 'barangays'}\n`;
          cascadeMessage += `\nDeleting this region will also delete all cities and barangays.`;
        } else if (data.type === 'city') {
          cascadeMessage += `- ${data.barangay_count} ${data.barangay_count === 1 ? 'barangay' : 'barangays'}\n`;
          cascadeMessage += `\nDeleting this city will also delete all barangays.`;
        } else if (data.type === 'barangay') {
          cascadeMessage += `- ${data.location_count} ${data.location_count === 1 ? 'location' : 'locations'}\n`;
          cascadeMessage += `\nDeleting this barangay will also delete all locations.`;
        }
        
        cascadeMessage += `\n\nDo you want to proceed?`;
        
        if (window.confirm(cascadeMessage)) {
          try {
            switch (location.type) {
              case 'region':
                await deleteRegion(location.id, true);
                break;
              case 'city':
                await deleteCity(location.id, true);
                break;
              case 'borough':
                await deleteBarangay(location.id, true);
                break;
              case 'location':
                await deleteLocation(location.id);
                break;
            }
            
            await fetchLocationData();
            setIsDetailsModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedLocation(null);
          } catch (cascadeError: any) {
            console.error('Error during cascade delete:', cascadeError);
            alert('Failed to delete location. Please try again.');
          }
        }
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to delete location. Please try again.');
      }
    }
  };

  const handleDeleteFromEdit = (location: LocationItem) => {
    void handleDeleteLocation(location, { stopPropagation: () => {} } as React.MouseEvent);
  };

  const getLocationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      city: 'City',
      region: 'Region',
      borough: 'Barangay',
      location: 'Location'
    };
    return labels[type] || type;
  };

  const getLocationTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      city: 'text-blue-400',
      region: 'text-green-400',
      borough: 'text-purple-400',
      location: 'text-yellow-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const tableColumns = [
    { id: 'name', label: 'Location Name', width: 'whitespace-nowrap' },
    { id: 'type', label: 'Type', width: 'whitespace-nowrap' },
    { id: 'parent', label: 'Parent Location', width: 'whitespace-nowrap' },
    { id: 'actions', label: 'Actions', width: 'whitespace-nowrap' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-3"></div>
          <p className="text-gray-300">Loading locations...</p>
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
            onClick={() => fetchLocationData()}
            className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 h-full flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Desktop / Bottom Navbar - Mobile */}
      <div className="md:w-64 bg-gray-900 md:border-r border-t md:border-t-0 border-gray-700 flex-shrink-0 flex flex-col order-2 md:order-1">
        <div className="p-4 border-b border-gray-700 flex-shrink-0 hidden md:block">
          <div className="flex items-center mb-1">
            <h2 className="text-lg font-semibold text-white">Locations</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto md:block overflow-x-auto">
          <div className="flex md:flex-col md:space-y-0 space-x-2 md:space-x-0 p-2 md:p-0">
            {/* All */}
            <button
              onClick={() => setSidebarFilter({ type: 'all' })}
              className={`md:w-full flex-shrink-0 flex flex-col md:flex-row items-center md:justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-800 rounded-md md:rounded-none ${
                sidebarFilter.type === 'all'
                  ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                  : 'text-gray-300'
              }`}
            >
              <div className="flex flex-col md:flex-row items-center">
                <MapPin className="h-4 w-4 md:mr-2 mb-1 md:mb-0" />
                <span className="text-xs md:text-sm whitespace-nowrap">All</span>
              </div>
              {allLocations.length > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs mt-1 md:mt-0 ${
                  sidebarFilter.type === 'all'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {allLocations.length}
                </span>
              )}
            </button>

            {/* Regions */}
            {regions.map(region => {
              const regionCities = cities.filter(city => city.region_id === region.id);
              const isExpanded = expandedRegions.has(region.id);
              const regionCount = getCountForRegion(region.id);
              const isSelected = sidebarFilter.type === 'region' && sidebarFilter.id === region.id;

              return (
                <div key={`region-${region.id}`} className="flex-shrink-0">
                  <div className="flex flex-col md:flex-row items-center">
                    <button
                      onClick={() => toggleRegion(region.id)}
                      className="p-2 hover:bg-gray-800 transition-colors hidden md:block"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setSidebarFilter({ type: 'region', id: region.id })}
                      className={`flex-1 md:flex-1 flex flex-col md:flex-row items-center md:justify-between py-3 px-4 md:pr-4 md:pl-0 text-sm transition-colors hover:bg-gray-800 rounded-md md:rounded-none ${
                        isSelected
                          ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                          : 'text-gray-300'
                      }`}
                    >
                      <span className="text-xs md:text-sm whitespace-nowrap">{region.name}</span>
                      {regionCount > 0 && (
                        <span className={`px-2 py-1 rounded-full text-xs mt-1 md:mt-0 ${
                          isSelected
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {regionCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Cities under Region */}
                  {isExpanded && regionCities.map(city => {
                    const cityBarangays = boroughs.filter(borough => borough.city_id === city.id);
                    const isCityExpanded = expandedCities.has(city.id);
                    const cityCount = getCountForCity(city.id);
                    const isCitySelected = sidebarFilter.type === 'city' && sidebarFilter.id === city.id;

                    return (
                      <div key={`city-${city.id}`} className="ml-6 hidden md:block">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCity(city.id)}
                            className="p-2 hover:bg-gray-800 transition-colors"
                          >
                            {isCityExpanded ? (
                              <ChevronDown className="h-3 w-3 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => setSidebarFilter({ type: 'city', id: city.id })}
                            className={`flex-1 flex items-center justify-between py-2 pr-4 text-sm transition-colors hover:bg-gray-800 ${
                              isCitySelected
                                ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                                : 'text-gray-300'
                            }`}
                          >
                            <span className="text-xs">{city.name}</span>
                            {cityCount > 0 && (
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                isCitySelected
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-700 text-gray-300'
                              }`}>
                                {cityCount}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Barangays under City */}
                        {isCityExpanded && cityBarangays.map(barangay => {
                          const barangayCount = getCountForBarangay(barangay.id);
                          const isBarangaySelected = sidebarFilter.type === 'borough' && sidebarFilter.id === barangay.id;

                          return (
                            <button
                              key={`barangay-${barangay.id}`}
                              onClick={() => setSidebarFilter({ type: 'borough', id: barangay.id })}
                              className={`w-full flex items-center justify-between py-2 pl-12 pr-4 text-sm transition-colors hover:bg-gray-800 ${
                                isBarangaySelected
                                  ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              <span className="text-xs">{barangay.name}</span>
                              {barangayCount > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  isBarangaySelected
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                                }`}>
                                  {barangayCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-900 overflow-hidden flex-1 order-1 md:order-2">
        <div className="flex flex-col h-full">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
          
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
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((location) => (
                      <tr 
                        key={`${location.type}-${location.id}`}
                        className={`hover:bg-gray-800 cursor-pointer ${selectedLocation?.id === location.id && selectedLocation?.type === location.type ? 'bg-gray-800' : ''}`}
                        onClick={() => handleLocationClick(location)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs uppercase font-medium">
                          {location.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          <span className={getLocationTypeColor(location.type)}>
                            {getLocationTypeLabel(location.type)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300 text-xs">
                          {location.parentName || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => handleEditLocation(location, e)}
                              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                              title="Edit location"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteLocation(location, e)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                              title="Delete location"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableColumns.length} className="px-4 py-12 text-center text-gray-400">
                        {allLocations.length > 0
                          ? 'No locations found matching your filters'
                          : 'No locations found. Create your first location.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLocation}
      />

      <LocationDetailsModal
        isOpen={isDetailsModalOpen}
        location={selectedLocation}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedLocation(null);
        }}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <EditLocationModal
        isOpen={isEditModalOpen}
        location={selectedLocation}
        allLocations={allLocations}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLocation(null);
        }}
        onEdit={handleSaveEdit}
        onDelete={handleDeleteFromEdit}
        onSelectLocation={(location) => {
          setSelectedLocation(location);
        }}
      />
    </div>
  );
};

export default LocationList;
