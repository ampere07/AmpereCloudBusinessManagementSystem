import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';
import { 
  createRegion, 
  createCity, 
  createBarangay, 
  createVillage,
  Region,
  City,
  Borough,
  Village 
} from '../services/cityService';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: LocationFormData) => void;
  initialLocationType?: 'region' | 'city' | 'barangay' | 'village';
}

interface LocationFormData {
  regionId: number | null;
  cityId: number | null;
  barangayId: number | null;
}

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

const mockBarangays: Borough[] = [
  { id: 1, name: 'San Pedro', city_id: 1 },
  { id: 2, name: 'San Isidro', city_id: 1 },
  { id: 3, name: 'San Roque', city_id: 1 },
  { id: 4, name: 'Poblacion', city_id: 2 },
  { id: 5, name: 'Malakaban', city_id: 2 },
  { id: 6, name: 'Ithan', city_id: 2 },
  { id: 7, name: 'Del Remedio', city_id: 3 },
  { id: 8, name: 'Navotas', city_id: 3 },
  { id: 9, name: 'Lambac', city_id: 3 }
];

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLocationType
}) => {
  const [formData, setFormData] = useState<LocationFormData>({
    regionId: null,
    cityId: null,
    barangayId: null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [newRegionName, setNewRegionName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newBarangayName, setNewBarangayName] = useState('');
  const [newVillageName, setNewVillageName] = useState('');

  const [showNewRegionInput, setShowNewRegionInput] = useState(false);
  const [showNewCityInput, setShowNewCityInput] = useState(false);
  const [showNewBarangayInput, setShowNewBarangayInput] = useState(false);
  const [showNewVillageInput, setShowNewVillageInput] = useState(false);

  const [regions] = useState<Region[]>(mockRegions);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Borough[]>([]);

  useEffect(() => {
    // Reset on open
  }, [initialLocationType]);

  useEffect(() => {
    if (formData.regionId) {
      const filteredCities = mockCities.filter(city => city.region_id === formData.regionId);
      setCities(filteredCities);
    } else {
      setCities([]);
    }
    setFormData(prev => ({ ...prev, cityId: null, barangayId: null }));
  }, [formData.regionId]);

  useEffect(() => {
    if (formData.cityId) {
      const filteredBarangays = mockBarangays.filter(barangay => barangay.city_id === formData.cityId);
      setBarangays(filteredBarangays);
    } else {
      setBarangays([]);
    }
    setFormData(prev => ({ ...prev, barangayId: null }));
  }, [formData.cityId]);

  const handleInputChange = (field: keyof LocationFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegionChange = (value: string) => {
    if (value === 'add_new') {
      setShowNewRegionInput(true);
      handleInputChange('regionId', null);
    } else {
      setShowNewRegionInput(false);
      handleInputChange('regionId', parseInt(value));
    }
  };

  const handleCityChange = (value: string) => {
    if (value === 'add_new') {
      setShowNewCityInput(true);
      handleInputChange('cityId', null);
    } else {
      setShowNewCityInput(false);
      handleInputChange('cityId', parseInt(value));
    }
  };

  const handleBarangayChange = (value: string) => {
    if (value === 'add_new') {
      setShowNewBarangayInput(true);
      handleInputChange('barangayId', null);
    } else {
      setShowNewBarangayInput(false);
      handleInputChange('barangayId', parseInt(value));
    }
  };

  const handleVillageToggle = (value: string) => {
    if (value === 'add_new') {
      setShowNewVillageInput(!showNewVillageInput);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // At least region must be selected or new region must be entered
    if (!formData.regionId && !showNewRegionInput) {
      newErrors.regionId = 'Region is required';
    }

    // If city is selected or being added, region must be set
    if ((formData.cityId || showNewCityInput) && !formData.regionId && !showNewRegionInput) {
      newErrors.regionId = 'Region must be selected before adding a city';
    }

    // If barangay is selected or being added, city must be set
    if ((formData.barangayId || showNewBarangayInput) && !formData.cityId && !showNewCityInput) {
      newErrors.cityId = 'City must be selected before adding a barangay';
    }

    // If village is being added, barangay must be set
    if (showNewVillageInput && !formData.barangayId && !showNewBarangayInput) {
      newErrors.barangayId = 'Barangay must be selected before adding a village';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validateForm();
    
    if (!isValid) {
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for cascading creation
      const locationData: any = {
        region: {
          isNew: showNewRegionInput,
          name: showNewRegionInput ? newRegionName : null,
          id: formData.regionId
        },
        city: {
          isNew: showNewCityInput,
          name: showNewCityInput ? newCityName : null,
          id: formData.cityId
        },
        barangay: {
          isNew: showNewBarangayInput,
          name: showNewBarangayInput ? newBarangayName : null,
          id: formData.barangayId
        },
        village: {
          isNew: showNewVillageInput,
          name: showNewVillageInput ? newVillageName : null,
          id: null
        }
      };

      // Validate cascading requirements
      if (locationData.village.isNew && !locationData.barangay.isNew && !locationData.barangay.id) {
        alert('Please select a barangay or create a new one before adding a village');
        setLoading(false);
        return;
      }

      if ((locationData.barangay.isNew || locationData.village.isNew) && !locationData.city.isNew && !locationData.city.id) {
        alert('Please select a city or create a new one before adding a barangay or village');
        setLoading(false);
        return;
      }

      if ((locationData.city.isNew || locationData.barangay.isNew || locationData.village.isNew) && !locationData.region.isNew && !locationData.region.id) {
        alert('Please select a region or create a new one before adding a city, barangay, or village');
        setLoading(false);
        return;
      }

      // Validate that new location names are not empty
      if (locationData.region.isNew && !locationData.region.name.trim()) {
        alert('Please enter a region name');
        setLoading(false);
        return;
      }

      if (locationData.city.isNew && !locationData.city.name.trim()) {
        alert('Please enter a city name');
        setLoading(false);
        return;
      }

      if (locationData.barangay.isNew && !locationData.barangay.name.trim()) {
        alert('Please enter a barangay name');
        setLoading(false);
        return;
      }

      if (locationData.village.isNew && !locationData.village.name.trim()) {
        alert('Please enter a village name');
        setLoading(false);
        return;
      }

      console.log('Cascading location creation:', locationData);
      
      // API calls to create locations in order with proper foreign keys
      let regionId = locationData.region.id;
      if (locationData.region.isNew) {
        console.log('Creating new region:', locationData.region.name);
        const newRegion = await createRegion({ name: locationData.region.name });
        regionId = newRegion.id;
        console.log('Region created with ID:', regionId);
      }

      let cityId = locationData.city.id;
      if (locationData.city.isNew && regionId) {
        console.log('Creating new city:', locationData.city.name, 'with region_id:', regionId);
        const newCity = await createCity({ 
          name: locationData.city.name, 
          region_id: regionId 
        });
        cityId = newCity.id;
        console.log('City created with ID:', cityId);
      }

      let barangayId = locationData.barangay.id;
      if (locationData.barangay.isNew && cityId) {
        console.log('Creating new barangay:', locationData.barangay.name, 'with city_id:', cityId);
        const newBarangay = await createBarangay({ 
          name: locationData.barangay.name, 
          city_id: cityId 
        });
        barangayId = newBarangay.id;
        console.log('Barangay created with ID:', barangayId);
      }

      if (locationData.village.isNew && barangayId) {
        console.log('Creating new village:', locationData.village.name, 'with barangay_id:', barangayId);
        const newVillage = await createVillage({ 
          name: locationData.village.name, 
          barangay_id: barangayId 
        });
        console.log('Village created with ID:', newVillage.id);
      }

      // Build success message
      const createdLocations = [];
      if (locationData.region.isNew) createdLocations.push(`Region: ${locationData.region.name}`);
      if (locationData.city.isNew) createdLocations.push(`City: ${locationData.city.name}`);
      if (locationData.barangay.isNew) createdLocations.push(`Barangay: ${locationData.barangay.name}`);
      if (locationData.village.isNew) createdLocations.push(`Village: ${locationData.village.name}`);
      
      if (createdLocations.length > 0) {
        alert(`Successfully created:\n${createdLocations.join('\n')}`);
      }
      
      onSave(locationData);
      setLoading(false);
      handleClose();
    } catch (error: any) {
      console.error('Error creating location:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create location. Please try again.';
      alert(`Error: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      regionId: null,
      cityId: null,
      barangayId: null
    });
    setErrors({});
    setShowNewRegionInput(false);
    setShowNewCityInput(false);
    setShowNewBarangayInput(false);
    setShowNewVillageInput(false);
    setNewRegionName('');
    setNewCityName('');
    setNewBarangayName('');
    setNewVillageName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Location</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Region Dropdown - Always visible */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Region<span className="text-red-500">*</span>
            </label>
            {showNewRegionInput ? (
              <div className="relative">
                <input
                  type="text"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  placeholder="Enter new region name"
                  className="w-full px-3 py-2 bg-gray-800 border border-orange-500 rounded text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowNewRegionInput(false);
                    setNewRegionName('');
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={formData.regionId?.toString() || ''}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.regionId ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                  <option value="add_new" className="text-orange-400">+ Add New Region</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            )}
            {errors.regionId && <p className="text-red-500 text-xs mt-1">{errors.regionId}</p>}
          </div>

          {/* City Dropdown - Always visible */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City<span className="text-red-500">*</span>
            </label>
            {showNewCityInput ? (
              <div className="relative">
                <input
                  type="text"
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="Enter new city name"
                  className="w-full px-3 py-2 bg-gray-800 border border-orange-500 rounded text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowNewCityInput(false);
                    setNewCityName('');
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={formData.cityId?.toString() || ''}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!formData.regionId && !showNewRegionInput}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.cityId ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Select City</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                  <option value="add_new" className="text-orange-400">+ Add New City</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            )}
            {errors.cityId && <p className="text-red-500 text-xs mt-1">{errors.cityId}</p>}
          </div>

          {/* Barangay Dropdown - Always visible */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Barangay<span className="text-red-500">*</span>
            </label>
            {showNewBarangayInput ? (
              <div className="relative">
                <input
                  type="text"
                  value={newBarangayName}
                  onChange={(e) => setNewBarangayName(e.target.value)}
                  placeholder="Enter new barangay name"
                  className="w-full px-3 py-2 bg-gray-800 border border-orange-500 rounded text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowNewBarangayInput(false);
                    setNewBarangayName('');
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={formData.barangayId?.toString() || ''}
                  onChange={(e) => handleBarangayChange(e.target.value)}
                  disabled={!formData.cityId && !showNewCityInput}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.barangayId ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Select Barangay</option>
                  {barangays.map(barangay => (
                    <option key={barangay.id} value={barangay.id}>{barangay.name}</option>
                  ))}
                  <option value="add_new" className="text-orange-400">+ Add New Barangay</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            )}
            {errors.barangayId && <p className="text-red-500 text-xs mt-1">{errors.barangayId}</p>}
          </div>

          {/* Village Dropdown - Always visible */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Village
            </label>
            {showNewVillageInput ? (
              <div className="relative">
                <input
                  type="text"
                  value={newVillageName}
                  onChange={(e) => setNewVillageName(e.target.value)}
                  placeholder="Enter new village name"
                  className="w-full px-3 py-2 bg-gray-800 border border-orange-500 rounded text-white focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowNewVillageInput(false);
                    setNewVillageName('');
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => handleVillageToggle(e.target.value)}
                  disabled={!formData.barangayId && !showNewBarangayInput}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Village</option>
                  <option value="add_new" className="text-orange-400">+ Add New Village</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
