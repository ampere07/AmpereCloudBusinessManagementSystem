import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Plus, Edit2, Trash2 } from 'lucide-react';
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

const LocationList: React.FC = () => {

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [boroughs, setBoroughs] = useState<Borough[]>([]);
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        parentName: regions.find(r => r.id === city.region_id)?.name
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
    return allLocations.filter(location => {
      const matchesSearch = searchQuery === '' || 
                           location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (location.parentName && location.parentName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || location.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [allLocations, searchQuery, typeFilter]);

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

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="bg-gray-900 overflow-hidden flex-1">
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
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="region">Region</option>
                <option value="city">City</option>
                <option value="borough">Barangay</option>
                <option value="location">Location</option>
              </select>
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
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-1/3 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
                  </div>
                  <p className="mt-4">Loading locations...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-12 text-center text-red-400">
                  <p>{error}</p>
                  <button 
                    onClick={() => fetchLocationData()}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                    Retry
                  </button>
                </div>
              ) : filteredLocations.length > 0 ? (
                <div className="space-y-0">
                  {filteredLocations.map((location) => (
                    <div
                      key={`${location.type}-${location.id}`}
                      onClick={() => handleLocationClick(location)}
                      className="px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm mb-1 uppercase">
                            {location.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {location.parentName && (
                              <span>{location.parentName} | </span>
                            )}
                            <span className={getLocationTypeColor(location.type)}>
                              {getLocationTypeLabel(location.type)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No locations found matching your filters
                </div>
              )}
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
