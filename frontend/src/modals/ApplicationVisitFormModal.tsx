import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { createApplicationVisit, ApplicationVisitData } from '../services/applicationVisitService';
import { updateApplication } from '../services/applicationService';
import { UserData } from '../types/api';
import { userService } from '../services/userService';
import { getRegions, getCities, City } from '../services/cityService';
import { barangayService, Barangay } from '../services/barangayService';
import { locationDetailService, LocationDetail } from '../services/locationDetailService';
import { planService, Plan } from '../services/planService';
import apiClient from '../config/api';

interface ApplicationVisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ApplicationVisitData) => void;
  applicationData?: any;
}

// Form interface for UI handling
interface VisitFormData {
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
  location: string;
  choosePlan: string;
  promo: string;
  remarks: string;
  assignedEmail: string;
  visit_by: string;
  visit_with: string;
  visit_with_other: string;
  visitType: string;
  visitNotes: string;
  status: string;
  createdBy: string;
  modifiedBy: string;
}

const ApplicationVisitFormModal: React.FC<ApplicationVisitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  applicationData
}) => {
  const getCurrentUser = (): UserData | null => {
    try {
      const authData = localStorage.getItem('authData');
      if (authData) {
        return JSON.parse(authData);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const currentUserEmail = currentUser?.email || 'unknown@ampere.com';

  useEffect(() => {
    if (isOpen && applicationData) {
      console.log('DEBUG - Initial ApplicationVisitFormModal data:', {
        applicationData,
        mobile_alt: applicationData.mobile_alt,
        secondaryNumber: applicationData.secondaryNumber,
        properties: Object.keys(applicationData || {}),
        region: applicationData.Region || applicationData.region,
        city: applicationData.City || applicationData.city,
        barangay: applicationData.Barangay || applicationData.barangay
      });
    }
  }, [isOpen, applicationData]);
  

  const [formData, setFormData] = useState<VisitFormData>(() => {
    const initialSecondContact = applicationData?.secondary_mobile_number || '';
                                
    console.log('DEBUG - Initial second contact values:', {
      secondary_mobile_number: applicationData?.secondary_mobile_number,
      initialSecondContact
    });
    
    return {
      firstName: applicationData?.first_name || '',
      middleInitial: applicationData?.middle_initial || '',
      lastName: applicationData?.last_name || '',
      contactNumber: applicationData?.mobile_number || '',
      secondContactNumber: initialSecondContact,
      email: applicationData?.email_address || '',
      address: applicationData?.installation_address || '',
      barangay: applicationData?.barangay || '',
      city: applicationData?.city || '',
      region: applicationData?.region || '',
      location: applicationData?.location || '',
      choosePlan: applicationData?.desired_plan || 'SwitchConnect - P799',
      promo: applicationData?.promo || '',
      remarks: '',
      assignedEmail: '',
      visit_by: '',
      visit_with: 'None',
      visit_with_other: '',
      visitType: 'Initial Visit',
      visitNotes: '',
      status: 'Scheduled',
      createdBy: currentUserEmail,
      modifiedBy: currentUserEmail
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Array<{ email: string; name: string }>>([]);
  interface Region {
    id: number;
    name: string;
  }

  interface Promo {
    id: number;
    promo_name: string;
    description?: string;
  }

  interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }

  const [regions, setRegions] = useState<Region[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allBarangays, setAllBarangays] = useState<Barangay[]>([]);
  const [allLocations, setAllLocations] = useState<LocationDetail[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  // Fetch plans from database
  useEffect(() => {
    const fetchPlans = async () => {
      if (isOpen) {
        try {
          console.log('Loading plans from database...');
          const response = await planService.getAllPlans();
          console.log('Plans API Response:', response);
          
          if (Array.isArray(response)) {
            setPlans(response);
            console.log('Loaded Plans:', response.length);
          } else {
            console.warn('Unexpected Plans response structure:', response);
            setPlans([]);
          }
        } catch (error) {
          console.error('Error fetching Plans:', error);
          setPlans([]);
        }
      }
    };
    
    fetchPlans();
  }, [isOpen]);

  // Fetch promos from database
  useEffect(() => {
    const loadPromos = async () => {
      if (isOpen) {
        try {
          console.log('Loading promos from database...');
          const response = await apiClient.get<ApiResponse<Promo[]> | Promo[]>('/promos');
          const data = response.data;
          
          if (data && typeof data === 'object' && 'success' in data && data.success && Array.isArray(data.data)) {
            setPromos(data.data);
            console.log('Loaded promos:', data.data.length);
          } else if (Array.isArray(data)) {
            setPromos(data);
            console.log('Loaded promos:', data.length);
          } else {
            console.warn('No promos data found');
            setPromos([]);
          }
        } catch (error) {
          console.error('Error loading promos:', error);
          setPromos([]);
        }
      }
    };

    loadPromos();
  }, [isOpen]);

  // Fetch regions from database
  useEffect(() => {
    const fetchRegions = async () => {
      if (isOpen) {
        try {
          console.log('========== FETCHING REGIONS ==========');
          console.log('Loading regions from database...');
          const fetchedRegions = await getRegions();
          console.log('Regions API Response:', fetchedRegions);
          
          if (Array.isArray(fetchedRegions)) {
            console.log('Regions Count:', fetchedRegions.length);
            setRegions(fetchedRegions);
            console.log('Successfully set regions state');
          } else {
            console.warn('Unexpected Regions response structure:', fetchedRegions);
            setRegions([]);
          }
          console.log('======================================');
        } catch (error) {
          console.error('========== ERROR FETCHING REGIONS ==========');
          console.error('Error fetching Regions:', error);
          console.error('===========================================');
          setRegions([]);
        }
      }
    };
    
    fetchRegions();
  }, [isOpen]);

  useEffect(() => {
    const fetchAllCities = async () => {
      if (isOpen) {
        try {
          console.log('Loading all cities from database...');
          const fetchedCities = await getCities();
          console.log('All Cities API Response:', fetchedCities);
          
          if (Array.isArray(fetchedCities)) {
            setAllCities(fetchedCities);
            console.log('Loaded All Cities:', fetchedCities.length);
          } else {
            setAllCities([]);
          }
        } catch (error) {
          console.error('Error fetching Cities:', error);
          setAllCities([]);
        }
      }
    };
    
    fetchAllCities();
  }, [isOpen]);

  useEffect(() => {
    const fetchAllBarangays = async () => {
      if (isOpen) {
        try {
          console.log('Loading all barangays from database...');
          const response = await barangayService.getAll();
          console.log('All Barangays API Response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            setAllBarangays(response.data);
            console.log('Loaded All Barangays:', response.data.length);
          } else {
            setAllBarangays([]);
          }
        } catch (error) {
          console.error('Error fetching Barangays:', error);
          setAllBarangays([]);
        }
      }
    };
    
    fetchAllBarangays();
  }, [isOpen]);

  useEffect(() => {
    const fetchAllLocations = async () => {
      if (isOpen) {
        try {
          console.log('Loading all locations from database...');
          const response = await locationDetailService.getAll();
          console.log('All Locations API Response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            setAllLocations(response.data);
            console.log('Loaded All Locations:', response.data.length);
          } else {
            setAllLocations([]);
          }
        } catch (error) {
          console.error('Error fetching Locations:', error);
          setAllLocations([]);
        }
      }
    };
    
    fetchAllLocations();
  }, [isOpen]);

  // Fetch technicians
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

  // Update form data when applicationData changes
  useEffect(() => {
    if (applicationData) {
      console.log('DEBUG - Application data loaded:', applicationData);
      console.log('DEBUG - Second contact field:', applicationData.secondary_mobile_number);
      
      setFormData(prev => {
        const secondContact = applicationData.secondary_mobile_number || '';
        console.log('DEBUG - Selected second contact number:', secondContact);        
        
        return {
          ...prev,
          firstName: applicationData.first_name || prev.firstName,
          middleInitial: applicationData.middle_initial || prev.middleInitial,
          lastName: applicationData.last_name || prev.lastName,
          contactNumber: applicationData.mobile_number || prev.contactNumber,
          secondContactNumber: secondContact,
          email: applicationData.email_address || prev.email,
          address: applicationData.installation_address || prev.address,
          barangay: applicationData.barangay || prev.barangay,
          city: applicationData.city || prev.city,
          region: applicationData.region || prev.region,
          location: applicationData.location || prev.location,
          choosePlan: applicationData.desired_plan || prev.choosePlan,
          promo: applicationData.promo || prev.promo
        };
      });
    }
  }, [applicationData]);

  const handleInputChange = (field: keyof VisitFormData, value: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // If assignedEmail is updated, also update visit_by
      if (field === 'assignedEmail') {
        newFormData.visit_by = value;
      }
      
      // Handle cascading dropdowns
      if (field === 'region') {
        newFormData.city = '';
        newFormData.barangay = '';
        newFormData.location = '';
      } else if (field === 'city') {
        newFormData.barangay = '';
        newFormData.location = '';
      } else if (field === 'barangay') {
        newFormData.location = '';
      }
      
      return newFormData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getFilteredCities = () => {
    if (!formData.region) return [];
    const selectedRegion = regions.find(reg => reg.name === formData.region);
    if (!selectedRegion) return [];
    return allCities.filter(city => city.region_id === selectedRegion.id);
  };

  const getFilteredBarangays = () => {
    if (!formData.city) return [];
    const selectedCity = allCities.find(city => city.name === formData.city);
    if (!selectedCity) return [];
    return allBarangays.filter(brgy => brgy.city_id === selectedCity.id);
  };

  const getFilteredLocations = () => {
    if (!formData.barangay) return [];
    const selectedBarangay = allBarangays.find(brgy => brgy.barangay === formData.barangay);
    if (!selectedBarangay) return [];
    return allLocations.filter(loc => loc.barangay_id === selectedBarangay.id);
  };

  const filteredCities = getFilteredCities();
  const filteredBarangays = getFilteredBarangays();
  const filteredLocations = getFilteredLocations();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.assignedEmail.trim()) {
      newErrors.assignedEmail = 'Assigned Email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormDataToVisitData = (applicationId: string): ApplicationVisitData => {
    const appId = parseInt(applicationId);
    
    if (isNaN(appId) || appId <= 0) {
      throw new Error(`Invalid application ID: ${applicationId}`);
    }
    
    console.log('Mapping form data to visit data:', {
      applicationId,
      parsedAppId: appId,
      assignedEmail: formData.assignedEmail,
      visitStatus: formData.status,
      createdByEmail: currentUserEmail,
      region: formData.region,
      city: formData.city,
      barangay: formData.barangay,
      location: formData.location,
      choosePlan: formData.choosePlan,
      promo: formData.promo,
      house_front_picture_url: applicationData?.house_front_picture_url
    });
    
    return {
      application_id: appId,
      assigned_email: formData.assignedEmail,
      visit_by: formData.assignedEmail,
      visit_with: formData.visit_with !== 'Other' && formData.visit_with !== 'None' ? formData.visit_with : (formData.visit_with === 'Other' ? formData.visit_with_other : null),
      visit_status: formData.status,
      visit_remarks: formData.remarks || formData.visitNotes || null,
      application_status: 'Scheduled',
      region: formData.region,
      city: formData.city,
      barangay: formData.barangay,
      location: formData.location,
      choose_plan: formData.choosePlan,
      promo: formData.promo || null,
      house_front_picture_url: applicationData?.house_front_picture_url || null,
      created_by_user_email: currentUserEmail,
      updated_by_user_email: currentUserEmail
    };
  };

  const handleSave = async () => {
    console.log('Save button clicked!', formData);
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed. Errors:', errors);
      alert('Please fill in all required fields before saving.');
      return;
    }
    
    if (!applicationData?.id) {
      console.error('No application ID available');
      alert('Missing application ID. Cannot save visit.');
      return;
    }

    setLoading(true);
    try {
      const applicationId = applicationData.id;
      
      // Step 1: Update the applications table with region, city, barangay, location, desired_plan, and promo
      console.log('========== UPDATING APPLICATION TABLE ==========');
      const applicationUpdateData: any = {
        first_name: formData.firstName,
        middle_initial: formData.middleInitial || null,
        last_name: formData.lastName,
        mobile_number: formData.contactNumber,
        secondary_mobile_number: formData.secondContactNumber || null,
        email_address: formData.email,
        installation_address: formData.address,
        region: formData.region,
        city: formData.city,
        barangay: formData.barangay,
        location: formData.location,
        desired_plan: formData.choosePlan,
        promo: formData.promo || null
      };
      
      console.log('Application update data:', JSON.stringify(applicationUpdateData, null, 2));
      
      try {
        const applicationResponse = await updateApplication(applicationId.toString(), applicationUpdateData);
        console.log('Application updated successfully:', applicationResponse);
      } catch (appError: any) {
        console.error('========== APPLICATION UPDATE ERROR ==========');
        console.error('Error updating application:', appError);
        console.error('Error response:', appError.response?.data);
        console.error('Error message:', appError.message);
        console.error('==============================================');
        
        const errorMsg = appError.response?.data?.message || appError.message || 'Unknown error';
        alert(`Failed to update application data!\n\nError: ${errorMsg}\n\nPlease try again.`);
        setLoading(false);
        return;
      }
      console.log('===============================================');
      
      // Step 2: Create the application visit
      console.log('========== CREATING APPLICATION VISIT ==========');
      const visitData = mapFormDataToVisitData(applicationId);
      
      console.log('Final visit data being sent to API:', JSON.stringify(visitData, null, 2));
      
      const result = await createApplicationVisit(visitData);
      console.log('Application visit created successfully:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create application visit');
      }
      
      console.log('Visit created successfully with ID:', result.data?.id);
      console.log('===============================================');
      
      alert(`Visit created successfully!\n\nApplication data has been updated with the new location and plan information.`);
      
      setErrors({});
      
      onSave(visitData);
      onClose();
    } catch (error: any) {
      console.error('Error creating application visit:', error);
      
      let errorMessage = 'Unknown error occurred';
      let errorDetails = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        const responseData = error.response.data;
        errorMessage = responseData.message || 'Server error occurred';
        
        if (responseData.errors) {
          errorDetails = Object.entries(responseData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
        } else if (responseData.error) {
          errorDetails = responseData.error;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      const fullErrorMessage = errorDetails 
        ? `${errorMessage}\n\nDetails:\n${errorDetails}` 
        : errorMessage;
      
      alert(`Failed to schedule visit:\n\n${fullErrorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Application Form Visit</h2>
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
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
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
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.contactNumber ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
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
                Applicant Email Address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.address ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Region<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.region ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value="">Select Region</option>
                  {formData.region && !regions.some(reg => reg.name === formData.region) && (
                    <option value={formData.region}>{formData.region}</option>
                  )}
                  {regions.map((region) => (
                    <option key={region.id} value={region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
              {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!formData.region}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">{formData.region ? 'Select City' : 'Select Region First'}</option>
                  {formData.city && !filteredCities.some(city => city.name === formData.city) && (
                    <option value={formData.city}>{formData.city}</option>
                  )}
                  {filteredCities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Barangay<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.barangay}
                  onChange={(e) => handleInputChange('barangay', e.target.value)}
                  disabled={!formData.city}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.barangay ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">{formData.city ? 'Select Barangay' : 'Select City First'}</option>
                  {formData.barangay && !filteredBarangays.some(brgy => brgy.barangay === formData.barangay) && (
                    <option value={formData.barangay}>{formData.barangay}</option>
                  )}
                  {filteredBarangays.map((barangay) => (
                    <option key={barangay.id} value={barangay.barangay}>
                      {barangay.barangay}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
              {errors.barangay && <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!formData.barangay}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.location ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">{formData.barangay ? 'Select Location' : 'Select Barangay First'}</option>
                  {formData.location && formData.location.trim() !== '' && !filteredLocations.some(loc => loc.location_name === formData.location) && (
                    <option value={formData.location}>{formData.location}</option>
                  )}
                  {filteredLocations.map((location) => (
                    <option key={location.id} value={location.location_name}>
                      {location.location_name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            {/* Choose Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Plan<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.choosePlan}
                  onChange={(e) => handleInputChange('choosePlan', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.choosePlan ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value="">Select Plan</option>
                  {formData.choosePlan && !plans.some(plan => {
                    const planWithPrice = plan.price ? `${plan.name} - P${plan.price}` : plan.name;
                    return planWithPrice === formData.choosePlan || plan.name === formData.choosePlan;
                  }) && (
                    <option value={formData.choosePlan}>{formData.choosePlan}</option>
                  )}
                  {plans.map((plan) => {
                    const planWithPrice = plan.price ? `${plan.name} - P${plan.price}` : plan.name;
                    return (
                      <option key={plan.id} value={planWithPrice}>
                        {planWithPrice}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
              {errors.choosePlan && <p className="text-red-500 text-xs mt-1">{errors.choosePlan}</p>}
            </div>

            {/* Promo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Promo
              </label>
              <div className="relative">
                <select
                  value={formData.promo}
                  onChange={(e) => handleInputChange('promo', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="">Select Promo</option>
                  <option value="None">None</option>
                  {formData.promo && formData.promo !== 'None' && !promos.some(p => p.promo_name === formData.promo) && (
                    <option value={formData.promo}>{formData.promo}</option>
                  )}
                  {promos.map((promo) => (
                    <option key={promo.id} value={promo.promo_name}>
                      {promo.promo_name}{promo.description ? ` - ${promo.description}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
              </div>
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
                {formData.assignedEmail && !technicians.some(t => t.email === formData.assignedEmail) && (
                  <option value={formData.assignedEmail}>{formData.assignedEmail}</option>
                )}
                {technicians.map((technician, index) => (
                  <option key={index} value={technician.email}>{technician.email}</option>
                ))}
              </select>
              {errors.assignedEmail && <p className="text-red-500 text-xs mt-1">{errors.assignedEmail}</p>}
            </div>



            {/* Hidden fields for form completion */}
            <input type="hidden" value={formData.visit_by || formData.assignedEmail} />
            <input type="hidden" value={formData.visitType} />
            <input type="hidden" value={formData.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationVisitFormModal;
