import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, Plus } from 'lucide-react';
import AddLocationModal from '../modals/AddLocationModal';

interface City {
  id: number;
  name: string;
  region_id: number;
}

interface Region {
  id: number;
  name: string;
}

interface Borough {
  id: number;
  name: string;
  city_id: number;
}

interface Village {
  id: number;
  name: string;
  borough_id: number;
}

// Mock data
const mockRegions: Region[] = [
  { id: 1, name: 'Rizal' },
  { id: 2, name: 'Metro Manila' },
  { id: 3, name: 'Laguna' }
];

const mockCities: City[] = [
  { id: 1, name: 'Angono', region_id: 1 },
  { id: 2, name: 'Binangonan', region_id: 1 },
  { id: 3, name: 'Cardona', region_id: 1 },
  { id: 4, name: 'Tanay', region_id: 1 },
  { id: 5, name: 'Taytay', region_id: 1 },
  { id: 6, name: 'Makati', region_id: 2 },
  { id: 7, name: 'Quezon City', region_id: 2 },
  { id: 8, name: 'Manila', region_id: 2 },
  { id: 9, name: 'Calamba', region_id: 3 },
  { id: 10, name: 'Santa Rosa', region_id: 3 }
];

const mockBoroughs: Borough[] = [
  { id: 1, name: 'San Pedro', city_id: 1 },
  { id: 2, name: 'San Isidro', city_id: 1 },
  { id: 3, name: 'San Roque', city_id: 1 },
  { id: 4, name: 'Poblacion', city_id: 2 },
  { id: 5, name: 'Malakaban', city_id: 2 },
  { id: 6, name: 'Ithan', city_id: 2 },
  { id: 7, name: 'Del Remedio', city_id: 3 },
  { id: 8, name: 'Navotas', city_id: 3 },
  { id: 9, name: 'Lambac', city_id: 3 },
  { id: 10, name: 'Cayabu', city_id: 4 },
  { id: 11, name: 'Dolores', city_id: 5 },
  { id: 12, name: 'Barangka', city_id: 6 },
  { id: 13, name: 'Commonwealth', city_id: 7 },
  { id: 14, name: 'Ermita', city_id: 8 },
  { id: 15, name: 'Parian', city_id: 9 },
  { id: 16, name: 'Tagapo', city_id: 10 }
];

const mockVillages: Village[] = [
  { id: 1, name: 'Purok 1', borough_id: 1 },
  { id: 2, name: 'Purok 2', borough_id: 1 },
  { id: 3, name: 'Purok 3', borough_id: 2 },
  { id: 4, name: 'Purok 4', borough_id: 2 },
  { id: 5, name: 'Purok 5', borough_id: 3 },
  { id: 6, name: 'Purok 6', borough_id: 4 },
  { id: 7, name: 'Purok 7', borough_id: 5 },
  { id: 8, name: 'Purok 8', borough_id: 6 },
  { id: 9, name: 'Purok 9', borough_id: 7 },
  { id: 10, name: 'Purok 10', borough_id: 8 }
];

interface LocationItem {
  id: number;
  name: string;
  type: 'city' | 'region' | 'borough' | 'village';
  parentId?: number;
  parentName?: string;
  cityId?: number;
  regionId?: number;
  boroughId?: number;
}

const LocationList: React.FC = () => {

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [boroughs, setBoroughs] = useState<Borough[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setCities(mockCities);
      setRegions(mockRegions);
      setBoroughs(mockBoroughs);
      setVillages(mockVillages);
      setError(null);
      setIsLoading(false);
    }, 500);
  };



  const allLocations: LocationItem[] = useMemo(() => {
    const locations: LocationItem[] = [];

    cities.forEach(city => {
      locations.push({
        id: city.id,
        name: city.name,
        type: 'city',
        parentId: city.region_id,
        parentName: regions.find(r => r.id === city.region_id)?.name
      });
    });

    regions.forEach(region => {
      locations.push({
        id: region.id,
        name: region.name,
        type: 'region',
        regionId: region.id
      });
    });

    boroughs.forEach(borough => {
      const city = cities.find(c => c.id === borough.city_id);
      const region = regions.find(r => r.id === city?.region_id);
      
      locations.push({
        id: borough.id,
        name: borough.name,
        type: 'borough',
        parentId: borough.city_id,
        parentName: city?.name,
        cityId: borough.city_id,
        regionId: city?.region_id
      });
    });

    villages.forEach(village => {
      const borough = boroughs.find(b => b.id === village.borough_id);
      const city = cities.find(c => c.id === borough?.city_id);
      
      locations.push({
        id: village.id,
        name: village.name,
        type: 'village',
        parentId: village.borough_id,
        parentName: borough?.name,
        boroughId: village.borough_id,
        cityId: borough?.city_id,
        regionId: city?.region_id
      });
    });

    return locations;
  }, [cities, regions, boroughs, villages]);

  const filteredLocations = useMemo(() => {
    return allLocations.filter(location => {
      const matchesSearch = searchQuery === '' || 
                           location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (location.parentName && location.parentName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSearch;
    });
  }, [allLocations, searchQuery]);

  const handleAddLocation = (locationData: any) => {
    console.log('New location added:', locationData);
    // TODO: Add API call to save location to database
    // For now, just refresh the data
    fetchLocationData();
  };

  const handleLocationClick = (location: LocationItem) => {
    setSelectedLocation(location);
  };

  const getLocationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      city: 'City',
      region: 'Region',
      borough: 'Barangay',
      village: 'Village'
    };
    return labels[type] || type;
  };

  const getLocationTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      city: 'text-blue-400',
      region: 'text-green-400',
      borough: 'text-purple-400',
      village: 'text-yellow-400'
    };
    return colors[type] || 'text-gray-400';
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className={`bg-gray-900 overflow-hidden ${selectedLocation ? 'w-1/3' : 'flex-1'}`}>
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
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800 ${
                        selectedLocation?.id === location.id && selectedLocation?.type === location.type ? 'bg-gray-800' : ''
                      }`}
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
                        <div className="flex flex-col items-end space-y-1 ml-4 flex-shrink-0">
                          <div className={`text-xs px-2 py-1 ${getLocationTypeColor(location.type)}`}>
                            {getLocationTypeLabel(location.type)}
                          </div>
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

      {selectedLocation && (
        <div className="flex-1 overflow-hidden bg-gray-900 border-l border-gray-700">
          <div className="flex flex-col h-full">
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Location Details</h2>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <div className="text-white text-lg font-semibold">{selectedLocation.name}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <div className={`text-base font-medium ${getLocationTypeColor(selectedLocation.type)}`}>
                    {getLocationTypeLabel(selectedLocation.type)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">ID</label>
                  <div className="text-white">{selectedLocation.id}</div>
                </div>

                {selectedLocation.parentName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {selectedLocation.type === 'city' ? 'Region' : 
                       selectedLocation.type === 'borough' ? 'City' : 
                       selectedLocation.type === 'village' ? 'Barangay' : 'Parent'}
                    </label>
                    <div className="text-white">{selectedLocation.parentName}</div>
                  </div>
                )}

                {selectedLocation.type === 'city' && selectedLocation.parentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Region ID</label>
                    <div className="text-white">{selectedLocation.parentId}</div>
                  </div>
                )}

                {selectedLocation.type === 'borough' && (
                  <>
                    {selectedLocation.cityId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">City ID</label>
                        <div className="text-white">{selectedLocation.cityId}</div>
                      </div>
                    )}
                    {selectedLocation.regionId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Region ID</label>
                        <div className="text-white">{selectedLocation.regionId}</div>
                      </div>
                    )}
                  </>
                )}

                {selectedLocation.type === 'village' && (
                  <>
                    {selectedLocation.boroughId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Barangay ID</label>
                        <div className="text-white">{selectedLocation.boroughId}</div>
                      </div>
                    )}
                    {selectedLocation.cityId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">City ID</label>
                        <div className="text-white">{selectedLocation.cityId}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-8 flex space-x-3">
                <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors">
                  Edit Location
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLocation}
      />
    </div>
  );
};

export default LocationList;
