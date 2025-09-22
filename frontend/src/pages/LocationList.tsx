import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Loader2, Minus } from 'lucide-react';
import { refreshLocationData, notifyLocationAdded } from '../services/locationEvents';

interface Location {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Region extends Location {
  active_cities?: City[];
}

interface City extends Location {
  region_id: number;
  region?: Region;
  active_barangays?: Barangay[];
}

interface Barangay extends Location {
  city_id: number;
  city?: City;
}

type LocationType = 'region' | 'city' | 'barangay';

interface LocationItem {
  id: number;
  name: string;
  type: LocationType;
  parent?: string;
  data: Region | City | Barangay;
}

const LocationList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allLocations, setAllLocations] = useState<LocationItem[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allBarangays, setAllBarangays] = useState<Barangay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [addType, setAddType] = useState<LocationType>('region');
  const [idCounter, setIdCounter] = useState(1);
  
  // Add/Edit form states
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    id: '1',
  });
  
  // Loading states for individual operations
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [savingForm, setSavingForm] = useState(false);
  const [panelAnimating, setPanelAnimating] = useState(false);

  // Base API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    loadAllLocations();
  }, []);
  
  useEffect(() => {
    if (showAddPanel) {
      // Trigger animation after panel is mounted
      setTimeout(() => setPanelAnimating(true), 10);
    }
  }, [showAddPanel]);

  const loadAllLocations = async () => {
    setIsLoading(true);
    try {
      // Load all locations hierarchically
      const allResponse = await fetch(`${API_BASE_URL}/locations/all`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!allResponse.ok) {
        throw new Error(`HTTP error! status: ${allResponse.status}`);
      }
      
      const allData = await allResponse.json();
      
      if (allData.success) {
        const extractedRegions: Region[] = [];
        const extractedCities: City[] = [];
        const extractedBarangays: Barangay[] = [];
        const combinedLocations: LocationItem[] = [];
        
        allData.data.forEach((region: any) => {
          extractedRegions.push(region);
          // Add region to combined list
          combinedLocations.push({
            id: region.id,
            name: region.name,
            type: 'region',
            data: region,
          });
          
          if (region.active_cities) {
            region.active_cities.forEach((city: any) => {
              const cityWithRegion = { ...city, region };
              extractedCities.push(cityWithRegion);
              // Add city to combined list
              combinedLocations.push({
                id: city.id,
                name: city.name,
                type: 'city',
                parent: region.name,
                data: cityWithRegion,
              });
              
              if (city.active_barangays) {
                city.active_barangays.forEach((barangay: any) => {
                  const barangayWithCity = { ...barangay, city: cityWithRegion };
                  extractedBarangays.push(barangayWithCity);
                  // Add barangay to combined list
                  combinedLocations.push({
                    id: barangay.id,
                    name: barangay.name,
                    type: 'barangay',
                    parent: `${city.name}, ${region.name}`,
                    data: barangayWithCity,
                  });
                });
              }
            });
          }
        });
        
        setRegions(extractedRegions);
        setAllCities(extractedCities);
        setAllBarangays(extractedBarangays);
        setAllLocations(combinedLocations);
        
        // Set ID counter based on highest existing ID
        const maxId = Math.max(...combinedLocations.map(l => l.id), 0);
        setIdCounter(maxId + 1);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: LocationItem, cascade = false) => {
    const itemKey = `${item.type}-${item.id}`;
    
    const confirmMessage = cascade 
      ? `Are you sure you want to delete this ${item.type} and ALL its child locations? This action cannot be undone.`
      : `Are you sure you want to delete this ${item.type}?`;
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    // Add item to deleting state
    setDeletingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(itemKey);
      return newSet;
    });
    
    try {
      const url = cascade 
        ? `${API_BASE_URL}/locations/${item.type}/${item.id}?cascade=true`
        : `${API_BASE_URL}/locations/${item.type}/${item.id}`;
        
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        await loadAllLocations();
        alert(data.message || `${item.type} deleted successfully`);
      } else if (response.status === 422 && data.data?.can_cascade) {
        // Handle cascade delete scenario
        const { city_count = 0, barangay_count = 0, type, name } = data.data;
        let cascadeMessage = '';
        
        if (type === 'region') {
          cascadeMessage = `The region "${name}" contains ${city_count} cities and ${barangay_count} barangays.\n\nDo you want to delete ALL of them?`;
        } else if (type === 'city') {
          cascadeMessage = `The city "${name}" contains ${barangay_count} barangays.\n\nDo you want to delete ALL of them?`;
        }
        
        if (window.confirm(cascadeMessage)) {
          await handleDelete(item, true);
        }
      } else {
        alert(data.message || `Failed to delete ${item.type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${item.type}:`, error);
      alert(`Failed to delete ${item.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Remove item from deleting state
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const closePanel = () => {
    setPanelAnimating(false);
    setTimeout(() => {
      setShowAddPanel(false);
      setEditingItem(null);
    }, 300);
  };

  const handleEdit = (item: LocationItem) => {
    setEditingItem(item);
    setAddType(item.type);
    
    const locationData = item.data as any;
    
    if (item.type === 'barangay') {
      setFormData({
        name: locationData.name,
        city: locationData.city?.name || '',
        region: locationData.city?.region?.name || '',
        id: item.id.toString(),
      });
    } else if (item.type === 'city') {
      setFormData({
        name: locationData.name,
        city: '',
        region: locationData.region?.name || '',
        id: item.id.toString(),
      });
    } else {
      setFormData({
        name: locationData.name,
        city: '',
        region: '',
        id: item.id.toString(),
      });
    }
    
    setShowAddPanel(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    
    if (addType === 'city' && !formData.region) {
      alert('Region is required for cities');
      return;
    }
    
    if (addType === 'barangay' && !formData.city) {
      alert('City is required for barangays');
      return;
    }
    
    setSavingForm(true);
    
    try {
      let endpoint = '';
      let payload: any = {
        name: formData.name.trim(),
        description: '',
      };

      if (editingItem) {
        endpoint = `${API_BASE_URL}/locations/${addType}/${editingItem.id}`;
      } else if (addType === 'region') {
        endpoint = `${API_BASE_URL}/locations/regions`;
      } else if (addType === 'city') {
        endpoint = `${API_BASE_URL}/locations/cities`;
        // Find region ID by name
        const region = regions.find(r => r.name === formData.region);
        if (region) {
          payload.region_id = region.id;
        } else {
          alert('Invalid region selected');
          return;
        }
      } else if (addType === 'barangay') {
        endpoint = `${API_BASE_URL}/locations/barangays`;
        // Find city ID by name
        const city = allCities.find(c => c.name === formData.city);
        if (city) {
          payload.city_id = city.id;
        } else {
          alert('Invalid city selected');
          return;
        }
      }

      const response = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        await loadAllLocations();
        closePanel();
        setFormData({ name: '', city: '', region: '', id: idCounter.toString() });
        setIdCounter(idCounter + 1);
        alert(data.message || `${addType} ${editingItem ? 'updated' : 'added'} successfully`);
      } else {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          alert('Validation errors:\n' + errorMessages);
        } else {
          alert(data.message || `Failed to ${editingItem ? 'update' : 'add'} ${addType}`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to ${editingItem ? 'update' : 'add'} ${addType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingForm(false);
    }
  };

  const incrementId = () => {
    const currentId = parseInt(formData.id) || 0;
    setFormData({ ...formData, id: (currentId + 1).toString() });
  };

  const decrementId = () => {
    const currentId = parseInt(formData.id) || 0;
    if (currentId > 1) {
      setFormData({ ...formData, id: (currentId - 1).toString() });
    }
  };

  const getFilteredItems = () => {
    if (!searchQuery) return allLocations;
    
    return allLocations.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.parent && item.parent.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getTypeLabel = (type: LocationType) => {
    switch(type) {
      case 'region': return 'Region';
      case 'city': return 'City';
      case 'barangay': return 'Barangay';
    }
  };

  const getTypeColor = (type: LocationType) => {
    switch(type) {
      case 'region': return 'text-blue-400';
      case 'city': return 'text-green-400';
      case 'barangay': return 'text-yellow-400';
    }
  };

  const renderListItem = (item: LocationItem) => {
    return (
      <div key={`${item.type}-${item.id}`} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-850 transition-colors">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-medium text-lg">{item.name}</h3>
              <span className={`text-xs px-2 py-1 rounded bg-gray-800 ${getTypeColor(item.type)}`}>
                {getTypeLabel(item.type)}
              </span>
            </div>
            {item.parent && (
              <p className="text-gray-400 text-sm mt-1">{item.parent}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(item)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(item)}
              disabled={deletingItems.has(`${item.type}-${item.id}`)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={deletingItems.has(`${item.type}-${item.id}`) ? 'Deleting...' : 'Delete'}
            >
              {deletingItems.has(`${item.type}-${item.id}`) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-white">Location List</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setAddType('region');
                  setFormData({ name: '', city: '', region: '', id: idCounter.toString() });
                  setShowAddPanel(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Location List"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div>
            {filteredItems.map(renderListItem)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No locations found
          </div>
        )}
      </div>

      {/* Add/Edit Slide Panel */}
      {showAddPanel && (
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
              panelAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={closePanel}
          />
          
          {/* Slide Panel */}
          <div className={`fixed right-0 top-0 h-full w-[500px] bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-out ${
            panelAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  addType === 'region' ? 'bg-blue-400' :
                  addType === 'city' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                {editingItem ? 'Edit' : 'Add'} {getTypeLabel(addType)} Form
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={closePanel}
                  className="px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={savingForm}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25"
                >
                  {savingForm && <Loader2 className="h-4 w-4 animate-spin" />}
                  {savingForm ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Type Selector (only for new items) */}
                {!editingItem && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Type</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAddType('region')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                          addType === 'region' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        Region
                      </button>
                      <button
                        onClick={() => setAddType('city')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                          addType === 'city' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        City
                      </button>
                      <button
                        onClick={() => setAddType('barangay')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                          addType === 'barangay' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/25' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        Barangay
                      </button>
                    </div>
                  </div>
                )}

                {/* Name Field */}
                <div className="animate-fade-in [animation-delay:100ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                    placeholder={`Enter ${addType} name`}
                  />
                </div>

                {/* City Field (for barangays) */}
                {addType === 'barangay' && (
                  <div className="animate-fade-in [animation-delay:200ms]">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => {
                        const city = allCities.find(c => c.name === e.target.value);
                        setFormData({ 
                          ...formData, 
                          city: e.target.value,
                          region: city?.region?.name || ''
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                    >
                      <option value="">Select City</option>
                      {allCities.map(city => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Region Field (for cities) */}
                {addType === 'city' && (
                  <div className="animate-fade-in [animation-delay:200ms]">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Region<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                    >
                      <option value="">Select Region</option>
                      {regions.map(region => (
                        <option key={region.id} value={region.name}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* ID Field with increment/decrement */}
                <div className="animate-fade-in [animation-delay:300ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Id<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex items-stretch">
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-l-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-center transition-all duration-200"
                    />
                    <div className="flex flex-col border-t border-b border-r border-gray-700 rounded-r-lg overflow-hidden bg-gray-800">
                      <button
                        type="button"
                        onClick={incrementId}
                        className="flex-1 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-150 flex items-center justify-center border-b border-gray-700 group"
                      >
                        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={decrementId}
                        className="flex-1 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-150 flex items-center justify-center group"
                      >
                        <Minus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationList;
