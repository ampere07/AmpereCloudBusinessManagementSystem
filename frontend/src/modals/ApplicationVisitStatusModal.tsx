import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateApplicationVisit } from '../services/applicationVisitService';
import { getRegionsFromLocations, getCitiesByRegion, getBarangaysByCity, getCities } from '../services/cityService';
import { getRegions as getRegionsLegacy } from '../services/regionService';
import { Location } from '../types/location';

interface ApplicationVisitStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVisit: any) => void;
  visitData: {
    id: string;
    first_name: string;
    middle_initial?: string;
    last_name: string;
    visit_status?: string;
    visit_remarks?: string;
    status_remarks?: string;
    visit_notes?: string;
    assigned_email?: string;
    visit_by?: string;
    visit_with?: string;
    visit_with_other?: string;
    application_status?: string;
    [key: string]: any;
  };
}

// Form interface for UI handling
interface StatusFormData {
  firstName: string;
  middleInitial: string;
  lastName: string;
  contactNumber: string;
  secondContactNumber: string;
  email: string;
  address: string;
  barangay: string;
  city: string;
  region: string;
  choosePlan: string;
  remarks: string;
  assignedEmail: string;
  modifiedBy: string;
}

const ApplicationVisitStatusModal: React.FC<ApplicationVisitStatusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  visitData
}) => {
  // Log initial visit data with better debugging
  useEffect(() => {
    if (isOpen && visitData) {
      console.log('DEBUG - ApplicationVisitStatusModal opened with data:', {
        visitData,
        id: visitData.id,
        barangay: visitData.barangay,
        city: visitData.city, 
        region: visitData.region,
        currentStatus: visitData.visit_status,
        assignedEmail: visitData.assigned_email
      });
    }
  }, [isOpen, visitData]);

  const [formData, setFormData] = useState<StatusFormData>(() => {
    return {
      firstName: visitData?.first_name || '',
      middleInitial: visitData?.middle_initial || '',
      lastName: visitData?.last_name || '',
      contactNumber: visitData?.contact_number || '',
      secondContactNumber: visitData?.second_contact_number || '',
      email: visitData?.email_address || '',
      address: visitData?.address || '',
      barangay: visitData?.barangay || '',
      city: visitData?.city || '',
      region: visitData?.region || '',
      choosePlan: visitData?.choose_plan || 'SwitchConnect - P799',
      remarks: visitData?.visit_remarks || '',
      assignedEmail: visitData?.assigned_email || '',
      modifiedBy: 'current_user@ampere.com' // In real app, this would be the logged-in user
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Location-related state
  const [regions, setRegions] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  // Update form data when visitData changes
  useEffect(() => {
    if (visitData) {
      console.log('DEBUG - Visit data loaded:', visitData);
      
      setFormData(prev => ({
        ...prev,
        firstName: visitData.first_name || prev.firstName,
        middleInitial: visitData.middle_initial || prev.middleInitial,
        lastName: visitData.last_name || prev.lastName,
        contactNumber: visitData.contact_number || prev.contactNumber,
        secondContactNumber: visitData.second_contact_number || prev.secondContactNumber,
        email: visitData.email_address || prev.email,
        address: visitData.address || prev.address,
        barangay: visitData.barangay || prev.barangay,
        city: visitData.city || prev.city,
        region: visitData.region || prev.region,
        choosePlan: visitData.choose_plan || prev.choosePlan,
        remarks: visitData.visit_remarks || prev.remarks,
        assignedEmail: visitData.assigned_email || prev.assignedEmail
      }));
    }
  }, [visitData]);

  // Load regions when modal opens - try both services
  useEffect(() => {
    const loadRegions = async () => {
      if (isOpen) {
        try {
          console.log('Loading regions...');
          
          // First try the location management system
          let regionsData = await getRegionsFromLocations();
          console.log('Location system regions:', regionsData);
          
          // If no data from location system, try legacy regions service
          if (!Array.isArray(regionsData) || regionsData.length === 0) {
            console.log('No data from location system, trying legacy service...');
            const legacyRegions = await getRegionsLegacy();
            console.log('Legacy regions service returned:', legacyRegions);
            
            // Convert legacy format to Location format
            if (Array.isArray(legacyRegions) && legacyRegions.length > 0) {
              regionsData = legacyRegions.map(region => ({
                id: region.id,
                name: region.name,
                type: 'region' as const,
                isActive: true,
                createdAt: region.created_at || '',
                updatedAt: region.updated_at || ''
              })) as Location[];
              console.log('Converted legacy regions to Location format:', regionsData);
            }
          }
          
          if (Array.isArray(regionsData) && regionsData.length > 0) {
            setRegions(regionsData);
            console.log('Set regions state with:', regionsData.length, 'regions');
            console.log('Sample region:', regionsData[0]);
          } else {
            console.warn('No regions data from either service');
            setRegions([]);
          }
        } catch (error) {
          console.error('Error loading regions:', error);
          setRegions([]);
        }
      }
    };

    loadRegions();
  }, [isOpen]);

  // Load cities when region is selected - with fallback
  useEffect(() => {
    const loadCities = async () => {
      if (selectedRegionId) {
        try {
          console.log('Loading cities for region ID:', selectedRegionId);
          
          // First try the location management system
          let citiesData = await getCitiesByRegion(selectedRegionId);
          console.log('Location system cities:', citiesData);
          
          // If no data from location system, try legacy cities service
          if (!Array.isArray(citiesData) || citiesData.length === 0) {
            console.log('No cities from location system, trying legacy cities service...');
            const legacyCities = await getCities();
            console.log('Legacy cities service returned:', legacyCities);
            
            // Filter and convert cities by region if legacy service has region_id
            if (Array.isArray(legacyCities) && legacyCities.length > 0) {
              const filteredCities = legacyCities.filter(city => city.region_id === selectedRegionId);
              // Convert City objects to Location objects
              citiesData = filteredCities.map(city => ({
                id: city.id,
                name: city.name,
                type: 'city' as const,
                parentId: city.region_id,
                isActive: city.is_active ?? true,
                createdAt: city.created_at || '',
                updatedAt: city.updated_at || ''
              }));
              console.log('Filtered and converted legacy cities for region:', citiesData);
            }
          }
          
          setCities(citiesData || []);
          console.log('Set cities state with:', citiesData?.length || 0, 'cities');
          
          // Clear barangays when region changes
          setBarangays([]);
          setSelectedCityId(null);
        } catch (error) {
          console.error('Error loading cities:', error);
          setCities([]);
        }
      } else {
        setCities([]);
        setBarangays([]);
        setSelectedCityId(null);
      }
    };

    loadCities();
  }, [selectedRegionId]);

  // Load barangays when city is selected
  useEffect(() => {
    const loadBarangays = async () => {
      if (selectedCityId) {
        try {
          console.log('Loading barangays for city ID:', selectedCityId);
          const barangaysData = await getBarangaysByCity(selectedCityId);
          setBarangays(barangaysData);
          console.log('Loaded barangays:', barangaysData);
        } catch (error) {
          console.error('Error loading barangays:', error);
        }
      } else {
        setBarangays([]);
      }
    };

    loadBarangays();
  }, [selectedCityId]);

  // Set initial selected region and city based on form data - improved logic
  useEffect(() => {
    if (regions.length > 0 && formData.region && !selectedRegionId) {
      console.log('Looking for region match:', formData.region, 'in regions:', regions.map(r => r.name));
      const matchingRegion = regions.find(r => 
        r.name.toLowerCase().trim() === formData.region.toLowerCase().trim()
      );
      console.log('Found matching region:', matchingRegion);
      if (matchingRegion) {
        console.log('Setting selectedRegionId to:', matchingRegion.id);
        setSelectedRegionId(matchingRegion.id);
      } else {
        console.warn('No matching region found for:', formData.region);
        // If no exact match, show available regions for debugging
        console.log('Available regions:', regions.map(r => `"${r.name}"`));
      }
    }
  }, [regions, formData.region, selectedRegionId]);

  useEffect(() => {
    if (cities.length > 0 && formData.city && !selectedCityId) {
      console.log('Looking for city match:', formData.city, 'in cities:', cities.map(c => c.name));
      const matchingCity = cities.find(c => 
        c.name.toLowerCase().trim() === formData.city.toLowerCase().trim()
      );
      console.log('Found matching city:', matchingCity);
      if (matchingCity) {
        console.log('Setting selectedCityId to:', matchingCity.id);
        setSelectedCityId(matchingCity.id);
      } else {
        console.warn('No matching city found for:', formData.city);
        console.log('Available cities:', cities.map(c => `"${c.name}"`));
      }
    }
  }, [cities, formData.city, selectedCityId]);

  // Reset form data when modal opens with new visit data
  useEffect(() => {
    if (isOpen && visitData) {
      console.log('Resetting form data with visit data:', visitData);
      setFormData({
        firstName: visitData.first_name || '',
        middleInitial: visitData.middle_initial || '',
        lastName: visitData.last_name || '',
        contactNumber: visitData.contact_number || '',
        secondContactNumber: visitData.second_contact_number || '',
        email: visitData.email_address || '',
        address: visitData.address || '',
        barangay: visitData.barangay || '',
        city: visitData.city || '',
        region: visitData.region || '',
        choosePlan: visitData.choose_plan || 'SwitchConnect - P799',
        remarks: visitData.visit_remarks || '',
        assignedEmail: visitData.assigned_email || '',
        modifiedBy: 'current_user@ampere.com'
      });
      
      // Reset selection states when opening with new data
      setSelectedRegionId(null);
      setSelectedCityId(null);
    }
  }, [isOpen, visitData]);

  const handleInputChange = (field: keyof StatusFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle cascading dropdowns
    if (field === 'region') {
      const selectedRegion = regions.find(r => r.name === value);
      setSelectedRegionId(selectedRegion ? selectedRegion.id : null);
      // Clear city and barangay when region changes
      setFormData(prev => ({ ...prev, city: '', barangay: '' }));
    } else if (field === 'city') {
      const selectedCity = cities.find(c => c.name === value);
      setSelectedCityId(selectedCity ? selectedCity.id : null);
      // Clear barangay when city changes
      setFormData(prev => ({ ...prev, barangay: '' }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.assignedEmail.trim()) {
      newErrors.assignedEmail = 'Assigned Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormDataToUpdateData = () => {
    return {
      assigned_email: formData.assignedEmail,
      visit_remarks: formData.remarks ? formData.remarks.trim() : null,
      updated_by_user_id: null
    };
  };

  const handleSave = async () => {
    console.log('Status update button clicked!', formData);
    
    // Check validation
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed. Errors:', errors);
      alert('Please fill in all required fields before saving.');
      return;
    }
    
    if (!visitData?.id) {
      console.error('No visit ID available');
      alert('Missing visit ID. Cannot update status.');
      return;
    }

    setLoading(true);
    try {
      // Prepare update data
      const updateData = mapFormDataToUpdateData();
      
      console.log('Final data being sent to API:', JSON.stringify(updateData, null, 2));
      
      // Call the API to update the visit
      const result = await updateApplicationVisit(visitData.id, updateData);
      console.log('Application visit updated successfully:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update application visit');
      }
      
      // Show success message
      console.log('Visit details updated successfully');
      alert(`Visit details updated successfully!\n\nCustomer: ${formData.firstName} ${formData.lastName}`);
      
      // Reset form errors to show clean state
      setErrors({});
      
      // Pass the updated visit data back to parent
      const updatedVisit = { ...visitData, ...updateData };
      onSave(updatedVisit);
      onClose();
    } catch (error: any) {
      console.error('Error updating application visit:', error);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Failed to update visit details: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Create full name from components
  const getFullName = () => {
    return `${visitData.first_name || ''} ${visitData.middle_initial || ''} ${visitData.last_name || ''}`.trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{getFullName()}</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
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
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Middle Initial */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Middle Initial
              </label>
              <input
                type="text"
                value={formData.middleInitial}
                onChange={(e) => handleInputChange('middleInitial', e.target.value)}
                maxLength={1}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number
              </label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Second Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Second Contact Number
              </label>
              <input
                type="text"
                value={formData.secondContactNumber || ''}
                onChange={(e) => handleInputChange('secondContactNumber', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Applicant Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Applicant Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Barangay
              </label>
              <input
                type="text"
                value={formData.barangay}
                onChange={(e) => handleInputChange('barangay', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Choose Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Plan
              </label>
              <select
                value={formData.choosePlan}
                onChange={(e) => handleInputChange('choosePlan', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
              >
                <option value="SwitchConnect - P799">SwitchConnect - P799</option>
                <option value="SwitchConnect - P999">SwitchConnect - P999</option>
                <option value="SwitchConnect - P1299">SwitchConnect - P1299</option>
                <option value="SwitchConnect - P1599">SwitchConnect - P1599</option>
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Assigned Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Assigned Email<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.assignedEmail}
                onChange={(e) => handleInputChange('assignedEmail', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.assignedEmail ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
              >
                <option value="">Select Assigned Email</option>
                <option value="tech1@ampere.com">tech1@ampere.com</option>
                <option value="tech2@ampere.com">tech2@ampere.com</option>
                <option value="tech3@ampere.com">tech3@ampere.com</option>
                <option value="Office">Office</option>
              </select>
              {errors.assignedEmail && <p className="text-red-500 text-xs mt-1">{errors.assignedEmail}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationVisitStatusModal;