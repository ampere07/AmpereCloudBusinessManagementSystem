import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import AddLocationModal from '../modals/AddLocationModal';
import EditLocationModal from '../modals/EditLocationModal';
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
}

const LocationList: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Borough[]>([]);
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedBarangayId, setSelectedBarangayId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [regionsData, citiesData, barangaysData, locationsData] = await Promise.all([
        getRegions(),
        getCities(),
        getBoroughs(),
        getLocations()
      ]);
      
      setRegions(regionsData);
      setCities(citiesData);
      setBarangays(barangaysData);
      setLocations(locationsData);
    } catch (err) {
      console.error('Error fetching location data:', err);
      setError('Failed to load location data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionChange = (regionId: string) => {
    const id = regionId ? parseInt(regionId) : null;
    setSelectedRegionId(id);
    setSelectedCityId(null);
    setSelectedBarangayId(null);
  };

  const handleCityChange = (cityId: string) => {
    const id = cityId ? parseInt(cityId) : null;
    setSelectedCityId(id);
    setSelectedBarangayId(null);
  };

  const handleBarangayChange = (barangayId: string) => {
    const id = barangayId ? parseInt(barangayId) : null;
    setSelectedBarangayId(id);
  };

  const filteredCities = selectedRegionId 
    ? cities.filter(city => city.region_id === selectedRegionId)
    : [];

  const filteredBarangays = selectedCityId 
    ? barangays.filter(barangay => barangay.city_id === selectedCityId)
    : [];

  const filteredLocations = selectedBarangayId 
    ? locations.filter(location => location.barangay_id === selectedBarangayId)
    : [];

  const handleAddLocation = () => {
    fetchAllData();
    setIsAddModalOpen(false);
  };

  const handleEdit = (item: LocationItem) => {
    setSelectedLocation(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    fetchAllData();
    setIsEditModalOpen(false);
    setSelectedLocation(null);
  };

  const handleDelete = async (item: LocationItem) => {
    const confirmMessage = `Are you sure you want to delete ${item.name}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      switch (item.type) {
        case 'region':
          await deleteRegion(item.id, false);
          if (selectedRegionId === item.id) {
            setSelectedRegionId(null);
            setSelectedCityId(null);
            setSelectedBarangayId(null);
          }
          break;
        case 'city':
          await deleteCity(item.id, false);
          if (selectedCityId === item.id) {
            setSelectedCityId(null);
            setSelectedBarangayId(null);
          }
          break;
        case 'borough':
          await deleteBarangay(item.id, false);
          if (selectedBarangayId === item.id) {
            setSelectedBarangayId(null);
          }
          break;
        case 'location':
          await deleteLocation(item.id);
          break;
      }
      
      await fetchAllData();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      alert(error.response?.data?.message || 'Failed to delete location. It may have child locations.');
    }
  };

  const renderItemList = (items: any[], type: 'region' | 'city' | 'borough' | 'location', typeLabel: string) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 text-sm">
          No {typeLabel.toLowerCase()}s available
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 rounded transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm">
                {type === 'location' ? item.location_name : item.name}
              </div>
              <div className="text-gray-400 text-xs mt-0.5">
                {typeLabel}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleEdit({
                  id: item.id,
                  name: type === 'location' ? item.location_name : item.name,
                  type: type,
                  parentId: type === 'city' ? item.region_id : 
                           type === 'borough' ? item.city_id : 
                           type === 'location' ? item.barangay_id : undefined
                })}
                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete({
                  id: item.id,
                  name: type === 'location' ? item.location_name : item.name,
                  type: type
                })}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-950 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-950 h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchAllData}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">Location Management</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAllData}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Location</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-4 gap-3">
          {/* Region Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Filter by Region</label>
            <div className="relative">
              <select
                value={selectedRegionId?.toString() || ''}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-orange-500 appearance-none pr-8"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Filter by City</label>
            <div className="relative">
              <select
                value={selectedCityId?.toString() || ''}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!selectedRegionId}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-orange-500 appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Cities</option>
                {filteredCities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Barangay Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Filter by Barangay</label>
            <div className="relative">
              <select
                value={selectedBarangayId?.toString() || ''}
                onChange={(e) => handleBarangayChange(e.target.value)}
                disabled={!selectedCityId}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-orange-500 appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Barangays</option>
                {filteredBarangays.map(barangay => (
                  <option key={barangay.id} value={barangay.id}>{barangay.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">&nbsp;</label>
            <button
              onClick={() => {
                setSelectedRegionId(null);
                setSelectedCityId(null);
                setSelectedBarangayId(null);
              }}
              disabled={!selectedRegionId && !selectedCityId && !selectedBarangayId}
              className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Show Regions when no region is selected */}
          {!selectedRegionId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  All Regions ({regions.length})
                </h2>
              </div>
              {renderItemList(regions, 'region', 'Region')}
            </div>
          )}

          {/* Show Cities when region is selected */}
          {selectedRegionId && !selectedCityId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Cities in {regions.find(r => r.id === selectedRegionId)?.name} ({filteredCities.length})
                </h2>
              </div>
              {renderItemList(filteredCities, 'city', 'City')}
            </div>
          )}

          {/* Show Barangays when city is selected */}
          {selectedCityId && !selectedBarangayId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Barangays in {cities.find(c => c.id === selectedCityId)?.name} ({filteredBarangays.length})
                </h2>
              </div>
              {renderItemList(filteredBarangays, 'borough', 'Barangay')}
            </div>
          )}

          {/* Show Locations when barangay is selected */}
          {selectedBarangayId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  Locations in {barangays.find(b => b.id === selectedBarangayId)?.name} ({filteredLocations.length})
                </h2>
              </div>
              {renderItemList(filteredLocations, 'location', 'Location')}
            </div>
          )}
        </div>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddLocation}
      />

      {/* Edit Location Modal */}
      {selectedLocation && (
        <EditLocationModal
          isOpen={isEditModalOpen}
          location={selectedLocation}
          allLocations={[]}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLocation(null);
          }}
          onEdit={handleSaveEdit}
          onDelete={(location) => handleDelete(location)}
          onSelectLocation={setSelectedLocation}
        />
      )}
    </div>
  );
};

export default LocationList;
