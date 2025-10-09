import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, Minus, Plus } from 'lucide-react';
import { createJobOrder, JobOrderData } from '../services/jobOrderService';
import { getContractTemplates, ContractTemplate } from '../services/lookupService';
import apiClient from '../config/api';
import { UserData } from '../types/api';
import { userService } from '../services/userService';

interface JOAssignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: JobOrderData) => void;
  applicationData?: any;
}

// Form interface for UI handling
interface JOFormData {
  timestamp: string;
  provider: string;
  status: string;
  referredBy: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  contactNumber: string;
  email: string;
  address: string;
  barangay: string;
  city: string;
  region: string;
  choosePlan: string;
  remarks: string;
  installationFee: number;
  contractTemplate: string;
  billingDay: string;
  isLastDayOfMonth: boolean;
  onsiteStatus: string;
  assignedEmail: string;
  modifiedBy: string;
  modifiedDate: string;
  installationLandmark: string;
}

const JOAssignFormModal: React.FC<JOAssignFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  applicationData
}) => {
  // Get current logged-in user
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

  const [formData, setFormData] = useState<JOFormData>({
    timestamp: new Date().toLocaleString('sv-SE').replace(' ', ' '),
    provider: '',
    status: '',
    referredBy: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    contactNumber: '',
    email: '',
    address: '',
    barangay: '',
    city: '',
    region: '',
    choosePlan: '',
    remarks: '',
    installationFee: 0.00,
    contractTemplate: '0',
    billingDay: '30',
    isLastDayOfMonth: false,
    onsiteStatus: 'In Progress',
    assignedEmail: '',
    modifiedBy: currentUserEmail,
    modifiedDate: new Date().toLocaleString('sv-SE').replace(' ', ' '),
    installationLandmark: ''
  });

  interface Region {
    id: number;
    region: string;
  }

  interface City {
    id: number;
    city: string;
    region_id: number;
  }

  interface Barangay {
    id: number;
    barangay: string;
    city_id: number;
  }

  interface Plan {
    id: number;
    name: string;
    description?: string;
    price?: number;
  }

  interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Contract template state
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [lookupLoading, setLookupLoading] = useState(true);
  
  // Location state
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  
  // Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [technicians, setTechnicians] = useState<Array<{ email: string; name: string }>>([]);

  // Fetch technicians from database
  useEffect(() => {
    const fetchTechnicians = async () => {
      if (isOpen) {
        try {
          console.log('Loading technicians from database...');
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
              .filter((tech: any) => tech.name && tech.email);
            setTechnicians(technicianList);
            console.log('Loaded technicians:', technicianList.length);
          }
        } catch (error) {
          console.error('Error fetching technicians:', error);
          setTechnicians([]);
        }
      }
    };
    
    fetchTechnicians();
  }, [isOpen]);

  // Load contract templates on component mount
  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        setLookupLoading(true);
        const templates = await getContractTemplates();
        setContractTemplates(templates);
      } catch (error) {
        console.error('Failed to load contract templates:', error);
      } finally {
        setLookupLoading(false);
      }
    };

    if (isOpen) {
      fetchLookupData();
    }
  }, [isOpen]);

  // Fetch plans from database
  useEffect(() => {
    const loadPlans = async () => {
      if (isOpen) {
        try {
          console.log('Loading plans from database...');
          const response = await apiClient.get<ApiResponse<Plan[]> | Plan[]>('/plans');
          const data = response.data;
          
          if (data && typeof data === 'object' && 'success' in data && data.success && Array.isArray(data.data)) {
            setPlans(data.data);
            console.log('Loaded plans:', data.data.length);
          } else if (Array.isArray(data)) {
            setPlans(data);
            console.log('Loaded plans:', data.length);
          } else {
            console.warn('No plans data found');
            setPlans([]);
          }
        } catch (error) {
          console.error('Error loading plans:', error);
          setPlans([]);
        }
      }
    };

    loadPlans();
  }, [isOpen]);

  // Fetch regions from database
  useEffect(() => {
    const loadRegions = async () => {
      if (isOpen) {
        try {
          setLocationsLoading(true);
          console.log('Loading regions from database...');
          const response = await apiClient.get<ApiResponse<Region[]> | Region[]>('/region_list');
          const data = response.data;
          
          if (data && typeof data === 'object' && 'success' in data && data.success && Array.isArray(data.data)) {
            setRegions(data.data);
            console.log('Loaded regions:', data.data.length);
          } else if (Array.isArray(data)) {
            setRegions(data);
            console.log('Loaded regions:', data.length);
          } else {
            console.warn('No regions data found');
            setRegions([]);
          }
        } catch (error) {
          console.error('Error loading regions:', error);
          setRegions([]);
        } finally {
          setLocationsLoading(false);
        }
      }
    };

    loadRegions();
  }, [isOpen]);

  // Load cities when region is selected
  useEffect(() => {
    const loadCities = async () => {
      if (selectedRegionId) {
        try {
          console.log('Loading cities for region ID:', selectedRegionId);
          const response = await apiClient.get<ApiResponse<City[]> | City[]>(`/city_list/region/${selectedRegionId}`);
          const data = response.data;
          
          if (data && typeof data === 'object' && 'success' in data && data.success && Array.isArray(data.data)) {
            setCities(data.data);
            console.log('Loaded cities:', data.data.length);
          } else if (Array.isArray(data)) {
            setCities(data);
            console.log('Loaded cities:', data.length);
          } else {
            console.warn('No cities data found');
            setCities([]);
          }
          
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
          const response = await apiClient.get<ApiResponse<Barangay[]> | Barangay[]>(`/barangay_list/city/${selectedCityId}`);
          const data = response.data;
          
          if (data && typeof data === 'object' && 'success' in data && data.success && Array.isArray(data.data)) {
            setBarangays(data.data);
            console.log('Loaded barangays:', data.data.length);
          } else if (Array.isArray(data)) {
            setBarangays(data);
            console.log('Loaded barangays:', data.length);
          } else {
            console.warn('No barangays data found');
            setBarangays([]);
          }
        } catch (error) {
          console.error('Error loading barangays:', error);
          setBarangays([]);
        }
      } else {
        setBarangays([]);
      }
    };

    loadBarangays();
  }, [selectedCityId]);

  // Match region from application data
  useEffect(() => {
    if (regions.length > 0 && formData.region && !selectedRegionId) {
      console.log('Looking for region match:', formData.region, 'in regions:', regions.map(r => r.region));
      const matchingRegion = regions.find(r => 
        r.region.toLowerCase().trim() === formData.region.toLowerCase().trim()
      );
      console.log('Found matching region:', matchingRegion);
      if (matchingRegion) {
        console.log('Setting selectedRegionId to:', matchingRegion.id);
        setSelectedRegionId(matchingRegion.id);
      } else {
        console.warn('No matching region found for:', formData.region);
      }
    }
  }, [regions, formData.region, selectedRegionId]);

  // Match city from application data
  useEffect(() => {
    if (cities.length > 0 && formData.city && !selectedCityId) {
      console.log('Looking for city match:', formData.city, 'in cities:', cities.map(c => c.city));
      const matchingCity = cities.find(c => 
        c.city.toLowerCase().trim() === formData.city.toLowerCase().trim()
      );
      console.log('Found matching city:', matchingCity);
      if (matchingCity) {
        console.log('Setting selectedCityId to:', matchingCity.id);
        setSelectedCityId(matchingCity.id);
      } else {
        console.warn('No matching city found for:', formData.city);
      }
    }
  }, [cities, formData.city, selectedCityId]);

  useEffect(() => {
    console.log('JO Form Modal - useEffect triggered');
    console.log('JO Form Modal - Full applicationData:', JSON.stringify(applicationData, null, 2));
    
    if (applicationData && isOpen) {
      console.log('JO Form - Application Data exists and modal is open');
      console.log('JO Form - Referred By value:', applicationData.referred_by);
      console.log('JO Form - First Name:', applicationData.first_name);
      console.log('JO Form - Last Name:', applicationData.last_name);
      
      setFormData(prev => {
        const newFormData = {
          ...prev,
          referredBy: applicationData.referred_by || '',
          firstName: applicationData.first_name || '',
          middleInitial: applicationData.middle_initial || '',
          lastName: applicationData.last_name || '',
          contactNumber: applicationData.mobile_number || '',
          email: applicationData.email_address || '',
          address: applicationData.installation_address || '',
          barangay: applicationData.barangay || '',
          city: applicationData.city || '',
          region: applicationData.region || '',
          choosePlan: applicationData.desired_plan || '',
          installationLandmark: applicationData.landmark || ''
        };
        
        console.log('JO Form - New form data to set:', JSON.stringify(newFormData, null, 2));
        return newFormData;
      });
    } else {
      console.log('JO Form - No applicationData available or modal closed');
    }
  }, [applicationData, isOpen]);

  const handleInputChange = (field: keyof JOFormData, value: string | number | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'isLastDayOfMonth' && value === true) {
        newData.billingDay = '0';
      }
      
      // Handle cascading dropdowns
      if (field === 'region') {
        const selectedRegion = regions.find(r => r.region === value);
        setSelectedRegionId(selectedRegion ? selectedRegion.id : null);
        newData.city = '';
        newData.barangay = '';
      } else if (field === 'city') {
        const selectedCity = cities.find(c => c.city === value);
        setSelectedCityId(selectedCity ? selectedCity.id : null);
        newData.barangay = '';
      }
      
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInstallationFeeChange = (value: string) => {
    if (value === '' || value === '-') {
      setFormData(prev => ({ ...prev, installationFee: 0 }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, installationFee: numValue }));
      }
    }
    if (errors.installationFee) {
      setErrors(prev => ({ ...prev, installationFee: '' }));
    }
  };

  const handleNumberChange = (field: 'installationFee' | 'contractTemplate' | 'billingDay', increment: boolean) => {
    setFormData(prev => {
      if (field === 'installationFee') {
        return {
          ...prev,
          [field]: increment ? prev[field] + 0.01 : Math.max(0, prev[field] - 0.01)
        };
      } else if (field === 'billingDay') {
        const currentValue = parseInt(prev[field]) || 1;
        const newValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1);
        return {
          ...prev,
          [field]: newValue.toString()
        };
      } else {
        const currentValue = parseInt(prev[field]) || 0;
        const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
        return {
          ...prev,
          [field]: newValue.toString()
        };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required personal information
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required';
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Validate installation fee (must be non-negative)
    if (formData.installationFee < 0) {
      newErrors.installationFee = 'Installation fee cannot be negative';
    }
    
    // Validate billing day
    const billingDayNum = parseInt(formData.billingDay);
    if (!formData.isLastDayOfMonth) {
      if (isNaN(billingDayNum) || billingDayNum < 1) {
        newErrors.billingDay = 'Billing Day must be at least 1';
      } else if (billingDayNum > 1000) {
        newErrors.billingDay = 'Billing Day cannot exceed 1000';
      }
    }
    
    // Validate contract template (must be a valid number if provided)
    if (formData.contractTemplate && formData.contractTemplate !== '0') {
      const templateNum = parseInt(formData.contractTemplate);
      if (isNaN(templateNum)) {
        newErrors.contractTemplate = 'Contract Template must be a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormDataToJobOrder = (applicationId: string, data: JOFormData = formData): any => {
    const toNullIfEmpty = (value: string | number | undefined): string | null => {
      if (value === undefined || value === null || value === '' || value === 'None' || value === 'All') {
        return null;
      }
      return String(value);
    };
    
    const toNullIfEmptyOrZero = (value: string | number | undefined): string | null => {
      if (value === undefined || value === null || value === '' || value === 0 || value === '0') {
        return null;
      }
      return String(value);
    };

    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const formattedTimestamp = data.timestamp ? 
      new Date(data.timestamp).toISOString().slice(0, 19).replace('T', ' ') : 
      currentTimestamp;

    return {
      application_id: applicationId,
      timestamp: formattedTimestamp,
      installation_fee: data.installationFee || 0,
      billing_day: data.isLastDayOfMonth ? 0 : (parseInt(data.billingDay) || 30),
      billing_status_id: 1,
      modem_router_sn: toNullIfEmpty(data.contractTemplate),
      onsite_status: data.onsiteStatus || 'In Progress',
      assigned_email: toNullIfEmpty(data.assignedEmail),
      onsite_remarks: toNullIfEmpty(data.remarks),
      contract_link: null,
      username: null,
      created_by_user_email: data.modifiedBy,
      updated_by_user_email: data.modifiedBy,
    };
  };

  const handleSave = async () => {
    console.log('Save button clicked - JO Assign Form', formData);
    
    const updatedFormData = {
      ...formData,
      modifiedBy: currentUserEmail,
      modifiedDate: new Date().toLocaleString('sv-SE').replace(' ', ' ')
    };
    
    setFormData(updatedFormData);
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed. Errors:', errors);
      alert('Please fill in all required fields before saving.');
      return;
    }
    
    if (!applicationData?.id) {
      console.error('No application ID available');
      alert('Missing application ID. Cannot create job order.');
      return;
    }

    setLoading(true);
    try {
      const jobOrderData = mapFormDataToJobOrder(applicationData.id, updatedFormData);
      
      console.log('Final job order data being sent to API:', JSON.stringify(jobOrderData, null, 2));
      
      const result = await createJobOrder(jobOrderData);
      console.log('Job Order created successfully:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create job order');
      }
      
      console.log('Job order saved successfully with data:', result.data);
      alert(`Job Order created successfully!`);
      
      setErrors({});
      onSave(result.data);
      onClose();
    } catch (error: any) {
      console.error('Error creating job order:', error);
      console.error('Error response:', error.response);
      console.error('Validation errors:', error.response?.data?.errors);
      
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorDetails = Object.entries(validationErrors)
          .map(([field, messages]: [string, any]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('\n');
        errorMessage = `Validation failed:\n${errorDetails}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(`Failed to create job order: ${errorMessage}`);
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
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">JO Assign Form</h2>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timestamp<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => handleInputChange('timestamp', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Provider<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value=""></option>
                  <option value="Provider 1">Provider 1</option>
                  <option value="Provider 2">Provider 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="" disabled>Select Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="For Confirmation">For Confirmation</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Referred By</label>
              <input
                type="text"
                value={formData.referredBy}
                onChange={(e) => handleInputChange('referredBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Middle Initial</label>
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
          </div>

          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Region<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  disabled={locationsLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50"
                >
                  <option value="">Select Region</option>
                  {formData.region && !regions.some(r => r.region === formData.region) && (
                    <option value={formData.region}>{formData.region}</option>
                  )}
                  {regions.map((region) => (
                    <option key={region.id} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {locationsLoading && (
                <p className="text-gray-400 text-xs mt-1">Loading regions...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!selectedRegionId}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50"
                >
                  <option value="">Select City</option>
                  {formData.city && !cities.some(c => c.city === formData.city) && (
                    <option value={formData.city}>{formData.city}</option>
                  )}
                  {cities.map((city) => (
                    <option key={city.id} value={city.city}>
                      {city.city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Barangay<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.barangay}
                  onChange={(e) => handleInputChange('barangay', e.target.value)}
                  disabled={!selectedCityId}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50"
                >
                  <option value="">Select Barangay</option>
                  {formData.barangay && !barangays.some(b => b.barangay === formData.barangay) && (
                    <option value={formData.barangay}>{formData.barangay}</option>
                  )}
                  {barangays.map((barangay) => (
                    <option key={barangay.id} value={barangay.barangay}>
                      {barangay.barangay}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Plan<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.choosePlan}
                  onChange={(e) => handleInputChange('choosePlan', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="">Select Plan</option>
                  {formData.choosePlan && !plans.some(p => p.name === formData.choosePlan) && (
                    <option value={formData.choosePlan}>{formData.choosePlan}</option>
                  )}
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.name}>
                      {plan.name}{plan.price ? ` - ₱${parseFloat(plan.price.toString()).toFixed(2)}` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Installation Fee<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <span className="px-3 text-gray-400">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.installationFee === 0 ? '' : formData.installationFee}
                  onChange={(e) => handleInstallationFeeChange(e.target.value)}
                  className={`flex-1 px-3 py-2 bg-transparent text-white focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${errors.installationFee ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                />
              </div>
              {errors.installationFee && <p className="text-red-500 text-xs mt-1">{errors.installationFee}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contract Template<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <input
                  type="number"
                  value={formData.contractTemplate}
                  onChange={(e) => handleInputChange('contractTemplate', e.target.value)}
                  className={`flex-1 px-3 py-2 bg-transparent text-white focus:outline-none ${errors.contractTemplate ? 'border-red-500' : ''}`}
                />
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('contractTemplate', false)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('contractTemplate', true)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {errors.contractTemplate && <p className="text-red-500 text-xs mt-1">{errors.contractTemplate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Billing Day<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.billingDay}
                  onChange={(e) => handleInputChange('billingDay', e.target.value)}
                  disabled={formData.isLastDayOfMonth}
                  className={`flex-1 px-3 py-2 bg-transparent text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.billingDay ? 'border-red-500' : ''}`}
                />
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('billingDay', false)}
                    disabled={formData.isLastDayOfMonth}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('billingDay', true)}
                    disabled={formData.isLastDayOfMonth}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="isLastDayOfMonth"
                  checked={formData.isLastDayOfMonth}
                  onChange={(e) => handleInputChange('isLastDayOfMonth', e.target.checked)}
                  className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-orange-600 focus:ring-orange-500 focus:ring-2"
                />
                <label htmlFor="isLastDayOfMonth" className="ml-2 text-sm text-gray-300 cursor-pointer">
                  Always use last day of the month
                </label>
              </div>
              
              {parseInt(formData.billingDay) > 1000 && !formData.isLastDayOfMonth && (
                <p className="text-orange-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  Billing Day count cannot exceed 1000
                </p>
              )}
              {errors.billingDay && <p className="text-red-500 text-xs mt-1">{errors.billingDay}</p>}
            </div>
          </div>

          <div className="space-y-4">
            {formData.status === 'Confirmed' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Onsite Status<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.onsiteStatus}
                    onChange={(e) => handleInputChange('onsiteStatus', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                    <option value="Failed">Failed</option>
                    <option value="Reschedule">Reschedule</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>
            )}

            {formData.status === 'Confirmed' && formData.onsiteStatus !== 'Failed' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned Email<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.assignedEmail}
                    onChange={(e) => handleInputChange('assignedEmail', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                  >
                    <option value="">Select Assigned Email</option>
                    {formData.assignedEmail && !technicians.some(t => t.email === formData.assignedEmail) && (
                      <option value={formData.assignedEmail}>{formData.assignedEmail}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.email}>
                        {technician.email}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modified By<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.modifiedBy}
                readOnly
                className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
                title="Auto-populated with logged-in user"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modified Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.modifiedDate}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-700 rounded text-gray-400 cursor-not-allowed"
                  title="Auto-populated with current timestamp"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Installation Landmark</label>
              <input
                type="text"
                value={formData.installationLandmark}
                onChange={(e) => handleInputChange('installationLandmark', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JOAssignFormModal;
