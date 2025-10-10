import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateApplicationVisit } from '../services/applicationVisitService';
import { getRegionsFromLocations, getCitiesByRegion, getBarangaysByCity, getCities } from '../services/cityService';
import { getRegions as getRegionsLegacy } from '../services/regionService';
import { statusRemarksService, StatusRemark } from '../services/statusRemarksService';
import { userService } from '../services/userService';
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
    visit_by_user_email?: string;
    visit_with?: string;
    visit_with_other?: string;
    application_status?: string;
    [key: string]: any;
  };
}

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

interface TechnicianFormData {
  fullAddress: string;
  image1: File | null;
  visitBy: string;
  visitWith: string;
  visitWithOther: string;
  visitStatus: string;
  visitRemarks: string;
  statusRemarks: string;
}

const ApplicationVisitStatusModal: React.FC<ApplicationVisitStatusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  visitData
}) => {
  const [userRole, setUserRole] = useState<string>('');
  
  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        setUserRole(user.role?.toLowerCase() || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

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
      modifiedBy: 'current_user@ampere.com'
    };
  });

  const [technicianFormData, setTechnicianFormData] = useState<TechnicianFormData>({
    fullAddress: visitData?.address || '',
    image1: null,
    visitBy: visitData?.visit_by_user_email || '',
    visitWith: visitData?.visit_with || '',
    visitWithOther: visitData?.visit_with_other || '',
    visitStatus: visitData?.visit_status || '',
    visitRemarks: visitData?.visit_remarks || '',
    statusRemarks: visitData?.status_remarks || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [statusRemarks, setStatusRemarks] = useState<StatusRemark[]>([]);
  const [technicians, setTechnicians] = useState<Array<{ email: string; name: string }>>([]);
  
  const [regions, setRegions] = useState<Location[]>([]);
  const [cities, setCities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

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

      setTechnicianFormData(prev => ({
        ...prev,
        fullAddress: visitData.address || prev.fullAddress,
        visitBy: visitData.visit_by_user_email || prev.visitBy,
        visitWith: visitData.visit_with || prev.visitWith,
        visitWithOther: visitData.visit_with_other || prev.visitWithOther,
        visitStatus: visitData.visit_status || prev.visitStatus,
        visitRemarks: visitData.visit_remarks || prev.visitRemarks,
        statusRemarks: visitData.status_remarks || prev.statusRemarks
      }));
    }
  }, [visitData]);

  useEffect(() => {
    const loadRegions = async () => {
      if (isOpen) {
        try {
          console.log('Loading regions...');
          
          let regionsData = await getRegionsFromLocations();
          console.log('Location system regions:', regionsData);
          
          if (!Array.isArray(regionsData) || regionsData.length === 0) {
            console.log('No data from location system, trying legacy service...');
            const legacyRegions = await getRegionsLegacy();
            console.log('Legacy regions service returned:', legacyRegions);
            
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

  useEffect(() => {
    const fetchStatusRemarks = async () => {
      if (isOpen) {
        try {
          const fetchedStatusRemarks = await statusRemarksService.getAllStatusRemarks();
          setStatusRemarks(fetchedStatusRemarks);
        } catch (error) {
          console.error('Error fetching status remarks:', error);
        }
      }
    };
    
    fetchStatusRemarks();
  }, [isOpen]);

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (isOpen) {
        try {
          const response = await userService.getUsersByRole('technician');
          if (response.success && response.data) {
            const technicianList = response.data
              .filter((user: any) => user.first_name || user.last_name)
              .map((user: any) => {
                const firstName = (user.first_name || '').trim();
                const lastName = (user.last_name || '').trim();
                const fullName = `${firstName} ${lastName}`.trim();
                return {
                  email: user.email_address || user.email || '',
                  name: fullName || user.username || user.email_address || user.email || ''
                };
              })
              .filter((tech: any) => tech.name);
            setTechnicians(technicianList);
          }
        } catch (error) {
          console.error('Error fetching technicians:', error);
        }
      }
    };
    
    fetchTechnicians();
  }, [isOpen]);

  useEffect(() => {
    const loadCities = async () => {
      if (selectedRegionId) {
        try {
          console.log('Loading cities for region ID:', selectedRegionId);
          
          let citiesData = await getCitiesByRegion(selectedRegionId);
          console.log('Location system cities:', citiesData);
          
          if (!Array.isArray(citiesData) || citiesData.length === 0) {
            console.log('No cities from location system, trying legacy cities service...');
            const legacyCities = await getCities();
            console.log('Legacy cities service returned:', legacyCities);
            
            if (Array.isArray(legacyCities) && legacyCities.length > 0) {
              const filteredCities = legacyCities.filter(city => city.region_id === selectedRegionId);
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

      setTechnicianFormData({
        fullAddress: visitData.address || '',
        image1: null,
        visitBy: visitData.visit_by_user_email || '',
        visitWith: visitData.visit_with || '',
        visitWithOther: visitData.visit_with_other || '',
        visitStatus: visitData.visit_status || '',
        visitRemarks: visitData.visit_remarks || '',
        statusRemarks: visitData.status_remarks || ''
      });
      
      setSelectedRegionId(null);
      setSelectedCityId(null);
    }
  }, [isOpen, visitData]);

  const handleInputChange = (field: keyof StatusFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'region') {
      const selectedRegion = regions.find(r => r.name === value);
      setSelectedRegionId(selectedRegion ? selectedRegion.id : null);
      setFormData(prev => ({ ...prev, city: '', barangay: '' }));
    } else if (field === 'city') {
      const selectedCity = cities.find(c => c.name === value);
      setSelectedCityId(selectedCity ? selectedCity.id : null);
      setFormData(prev => ({ ...prev, barangay: '' }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTechnicianInputChange = (field: keyof TechnicianFormData, value: string | File | null) => {
    setTechnicianFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleTechnicianInputChange('image1', e.target.files[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (userRole === 'technician') {
      if (!technicianFormData.image1) {
        newErrors.image1 = 'Image is required';
      }
      if (!technicianFormData.visitBy.trim()) {
        newErrors.visitBy = 'Visit By is required';
      }
      if (!technicianFormData.visitWith.trim()) {
        newErrors.visitWith = 'Visit With is required';
      }
      if (!technicianFormData.visitWithOther.trim()) {
        newErrors.visitWithOther = 'Visit With (Other) is required';
      }
    } else {
      if (!formData.assignedEmail.trim()) {
        newErrors.assignedEmail = 'Assigned Email is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormDataToUpdateData = () => {
    if (userRole === 'technician') {
      const data: any = {
        visit_by_user_email: technicianFormData.visitBy,
        visit_with: technicianFormData.visitWith,
        visit_with_other: technicianFormData.visitWithOther,
        visit_status: technicianFormData.visitStatus,
        visit_remarks: technicianFormData.visitRemarks ? technicianFormData.visitRemarks.trim() : null,
        updated_by_user_id: null
      };
      
      if (technicianFormData.visitStatus === 'Not Ready' && technicianFormData.statusRemarks) {
        data.status_remarks = technicianFormData.statusRemarks;
      }
      
      return data;
    } else {
      return {
        assigned_email: formData.assignedEmail,
        visit_remarks: formData.remarks ? formData.remarks.trim() : null,
        updated_by_user_id: null
      };
    }
  };

  const handleSave = async () => {
    console.log('Status update button clicked!', userRole === 'technician' ? technicianFormData : formData);
    
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
      const updateData = mapFormDataToUpdateData();
      
      console.log('Final data being sent to API:', JSON.stringify(updateData, null, 2));
      
      const result = await updateApplicationVisit(visitData.id, updateData);
      console.log('Application visit updated successfully:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update application visit');
      }
      
      console.log('Visit details updated successfully');
      alert(`Visit details updated successfully!\n\nCustomer: ${formData.firstName} ${formData.lastName}`);
      
      setErrors({});
      
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

  const getFullName = () => {
    return `${visitData.first_name || ''} ${visitData.middle_initial || ''} ${visitData.last_name || ''}`.trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {userRole === 'technician' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  value={technicianFormData.fullAddress}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image 1<span className="text-red-500">*</span>
                </label>
                <div className="w-full px-3 py-12 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    {technicianFormData.image1 ? (
                      <span className="text-sm text-gray-300">{technicianFormData.image1.name}</span>
                    ) : (
                      <span className="text-sm text-gray-500">Click to upload image</span>
                    )}
                  </label>
                </div>
                {errors.image1 && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="mr-1">⚠</span>{errors.image1}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visit By<span className="text-red-500">*</span>
                </label>
                <select
                  value={technicianFormData.visitBy}
                  onChange={(e) => handleTechnicianInputChange('visitBy', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitBy ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                >
                  <option value="">Select Visit By</option>
                  {technicianFormData.visitBy && !technicians.some(t => t.name === technicianFormData.visitBy) && (
                    <option value={technicianFormData.visitBy}>{technicianFormData.visitBy}</option>
                  )}
                  {technicians.map((technician, index) => (
                    <option key={index} value={technician.name}>{technician.name}</option>
                  ))}
                </select>
                {errors.visitBy && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="mr-1">⚠</span>{errors.visitBy}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visit With<span className="text-red-500">*</span>
                </label>
                <select
                  value={technicianFormData.visitWith}
                  onChange={(e) => handleTechnicianInputChange('visitWith', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitWith ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                >
                  <option value="">Select Visit With</option>
                  <option value="None">None</option>
                  {technicianFormData.visitWith && !technicians.some(t => t.name === technicianFormData.visitWith) && technicianFormData.visitWith !== 'None' && (
                    <option value={technicianFormData.visitWith}>{technicianFormData.visitWith}</option>
                  )}
                  {technicians.map((technician, index) => (
                    <option key={index} value={technician.name}>{technician.name}</option>
                  ))}
                </select>
                {errors.visitWith && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="mr-1">⚠</span>{errors.visitWith}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visit With(Other)<span className="text-red-500">*</span>
                </label>
                <select
                  value={technicianFormData.visitWithOther}
                  onChange={(e) => handleTechnicianInputChange('visitWithOther', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitWithOther ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                >
                  <option value="">Select Visit With(Other)</option>
                  <option value="None">None</option>
                  {technicianFormData.visitWithOther && !technicians.some(t => t.name === technicianFormData.visitWithOther) && technicianFormData.visitWithOther !== 'None' && (
                    <option value={technicianFormData.visitWithOther}>{technicianFormData.visitWithOther}</option>
                  )}
                  {technicians.map((technician, index) => (
                    <option key={index} value={technician.name}>{technician.name}</option>
                  ))}
                </select>
                {errors.visitWithOther && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="mr-1">⚠</span>{errors.visitWithOther}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visit Status
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleTechnicianInputChange('visitStatus', 'In Progress')}
                    className={`flex-1 px-4 py-3 rounded text-sm font-medium transition-colors ${
                      technicianFormData.visitStatus === 'In Progress'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTechnicianInputChange('visitStatus', 'OK to Install')}
                    className={`flex-1 px-4 py-3 rounded text-sm font-medium transition-colors ${
                      technicianFormData.visitStatus === 'OK to Install'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    OK to Install
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTechnicianInputChange('visitStatus', 'Not Ready')}
                    className={`flex-1 px-4 py-3 rounded text-sm font-medium transition-colors ${
                      technicianFormData.visitStatus === 'Not Ready'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Not Ready
                  </button>
                </div>
              </div>

              {technicianFormData.visitStatus === 'Not Ready' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status Remarks
                  </label>
                  <select
                    value={technicianFormData.statusRemarks}
                    onChange={(e) => handleTechnicianInputChange('statusRemarks', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Status Remarks</option>
                    {technicianFormData.statusRemarks && !statusRemarks.some(sr => sr.status_remarks === technicianFormData.statusRemarks) && (
                      <option value={technicianFormData.statusRemarks}>{technicianFormData.statusRemarks}</option>
                    )}
                    {statusRemarks.map((remark, index) => (
                      <option key={index} value={remark.status_remarks}>{remark.status_remarks}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Visit Remarks
                </label>
                <textarea
                  value={technicianFormData.visitRemarks}
                  onChange={(e) => handleTechnicianInputChange('visitRemarks', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Enter visit remarks..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
                  {formData.assignedEmail && !technicians.some(t => t.email === formData.assignedEmail) && formData.assignedEmail !== 'Office' && (
                    <option value={formData.assignedEmail}>{formData.assignedEmail}</option>
                  )}
                  {technicians.map((technician, index) => (
                    <option key={index} value={technician.email}>{technician.email}</option>
                  ))}
                  <option value="Office">Office</option>
                </select>
                {errors.assignedEmail && <p className="text-red-500 text-xs mt-1">{errors.assignedEmail}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationVisitStatusModal;
