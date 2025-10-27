import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { updateApplicationVisit, uploadApplicationVisitImages } from '../services/applicationVisitService';
import { getRegions, getCities, City } from '../services/cityService';
import { barangayService, Barangay } from '../services/barangayService';
import { locationDetailService, LocationDetail } from '../services/locationDetailService';
import { statusRemarksService, StatusRemark } from '../services/statusRemarksService';
import { userService } from '../services/userService';
import { planService, Plan } from '../services/planService';

interface Region {
  id: number;
  name: string;
}

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

interface ModalConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
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
  location: string;
  choosePlan: string;
  remarks: string;
  assignedEmail: string;
  modifiedBy: string;
}

interface TechnicianFormData {
  fullAddress: string;
  image1: File | null;
  image2: File | null;
  image3: File | null;
  visit_by: string;
  visit_with: string;
  visit_with_other: string;
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
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  
  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  useEffect(() => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        setUserRole(user.role?.toLowerCase() || '');
      } catch (error) {
        // Error parsing user data
      }
    }
  }, []);

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
      location: visitData?.location || '',
      choosePlan: visitData?.choose_plan || 'SwitchConnect - P799',
      remarks: visitData?.visit_remarks || '',
      assignedEmail: visitData?.assigned_email || '',
      modifiedBy: 'current_user@ampere.com'
    };
  });

  const [technicianFormData, setTechnicianFormData] = useState<TechnicianFormData>({
    fullAddress: visitData?.address || '',
    image1: null,
    image2: null,
    image3: null,
    visit_by: visitData?.visit_by || '',
    visit_with: visitData?.visit_with || '',
    visit_with_other: visitData?.visit_with_other || 'None',
    visitStatus: visitData?.visit_status || '',
    visitRemarks: visitData?.visit_remarks || '',
    statusRemarks: visitData?.status_remarks || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [statusRemarks, setStatusRemarks] = useState<StatusRemark[]>([]);
  const [technicians, setTechnicians] = useState<Array<{ email: string; name: string }>>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allBarangays, setAllBarangays] = useState<Barangay[]>([]);
  const [allLocations, setAllLocations] = useState<LocationDetail[]>([]);

  useEffect(() => {
    if (visitData) {
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
        location: visitData.location || prev.location,
        choosePlan: visitData.choose_plan || prev.choosePlan,
        remarks: visitData.visit_remarks || prev.remarks,
        assignedEmail: visitData.assigned_email || prev.assignedEmail
      }));

      setTechnicianFormData(prev => ({
        ...prev,
        fullAddress: visitData.address || prev.fullAddress,
        image1: null,
        image2: null,
        image3: null,
        visit_by: visitData.visit_by || prev.visit_by,
        visit_with: visitData.visit_with || prev.visit_with,
        visit_with_other: visitData.visit_with_other || 'None',
        visitStatus: visitData.visit_status || prev.visitStatus,
        visitRemarks: visitData.visit_remarks || prev.visitRemarks,
        statusRemarks: visitData.status_remarks || prev.statusRemarks
      }));
    }
  }, [visitData]);

  useEffect(() => {
    const fetchRegions = async () => {
      if (isOpen) {
        try {
          const fetchedRegions = await getRegions();
          
          if (Array.isArray(fetchedRegions)) {
            setRegions(fetchedRegions);
          } else {
            setRegions([]);
          }
        } catch (error) {
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
          const fetchedCities = await getCities();
          
          if (Array.isArray(fetchedCities)) {
            setAllCities(fetchedCities);
          } else {
            setAllCities([]);
          }
        } catch (error) {
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
          const response = await barangayService.getAll();
          
          if (response.success && Array.isArray(response.data)) {
            setAllBarangays(response.data);
          } else {
            setAllBarangays([]);
          }
        } catch (error) {
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
          const response = await locationDetailService.getAll();
          
          if (response.success && Array.isArray(response.data)) {
            setAllLocations(response.data);
          } else {
            setAllLocations([]);
          }
        } catch (error) {
          setAllLocations([]);
        }
      }
    };
    
    fetchAllLocations();
  }, [isOpen]);

  useEffect(() => {
    const fetchStatusRemarks = async () => {
      if (isOpen) {
        try {
          const fetchedStatusRemarks = await statusRemarksService.getAllStatusRemarks();
          setStatusRemarks(fetchedStatusRemarks);
        } catch (error) {
          // Error fetching status remarks
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
          // Error fetching technicians
        }
      }
    };
    
    fetchTechnicians();
  }, [isOpen, visitData]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (isOpen) {
        try {
          const response = await planService.getAllPlans();
          
          if (Array.isArray(response)) {
            setPlans(response);
          } else {
            setPlans([]);
          }
        } catch (error) {
          setPlans([]);
        }
      }
    };
    
    fetchPlans();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && visitData) {
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
        location: visitData.location || '',
        choosePlan: visitData.choose_plan || 'SwitchConnect - P799',
        remarks: visitData.visit_remarks || '',
        assignedEmail: visitData.assigned_email || '',
        modifiedBy: 'current_user@ampere.com'
      });

      setTechnicianFormData({
        fullAddress: visitData.address || '',
        image1: null,
        image2: null,
        image3: null,
        visit_by: visitData.visit_by || '',
        visit_with: visitData.visit_with || '',
        visit_with_other: visitData.visit_with_other || 'None',
        visitStatus: visitData.visit_status || '',
        visitRemarks: visitData.visit_remarks || '',
        statusRemarks: visitData.status_remarks || ''
      });
    }
  }, [isOpen, visitData]);

  const handleInputChange = (field: keyof StatusFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'region') {
        newData.city = '';
        newData.barangay = '';
        newData.location = '';
      }
      if (field === 'city') {
        newData.barangay = '';
        newData.location = '';
      }
      if (field === 'barangay') {
        newData.location = '';
      }
      return newData;
    });
    
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

  const handleImageChange = (field: 'image1' | 'image2' | 'image3', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleTechnicianInputChange(field, e.target.files[0]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (userRole === 'technician') {
      if (!technicianFormData.image1) {
        newErrors.image1 = 'Image is required';
      }
      if (!technicianFormData.visit_by.trim()) {
        newErrors.visit_by = 'Visit By is required';
      }
      if (!technicianFormData.visit_with.trim()) {
        newErrors.visit_with = 'Visit With is required';
      }
      if (!technicianFormData.visit_with_other.trim()) {
        newErrors.visit_with_other = 'Visit With (Other) is required';
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
        visit_by: technicianFormData.visit_by,
        visit_with: technicianFormData.visit_with,
        visit_with_other: technicianFormData.visit_with_other,
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
        region: formData.region,
        city: formData.city,
        barangay: formData.barangay,
        location: formData.location,
        choose_plan: formData.choosePlan,
        updated_by_user_id: null
      };
    }
  };

  const handleSave = async () => {
    const isValid = validateForm();
    
    if (!isValid) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Validation Error',
        message: 'Please fill in all required fields before saving.'
      });
      return;
    }
    
    if (!visitData?.id) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Missing visit ID. Cannot update status.'
      });
      return;
    }

    setLoading(true);
    try {
      const updateData = mapFormDataToUpdateData();
      
      const result = await updateApplicationVisit(visitData.id, updateData);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update application visit');
      }
      
      if (userRole === 'technician' && (technicianFormData.image1 || technicianFormData.image2 || technicianFormData.image3)) {
        try {
          const uploadResult = await uploadApplicationVisitImages(
            visitData.id,
            visitData.first_name,
            visitData.middle_initial,
            visitData.last_name,
            {
              image1: technicianFormData.image1,
              image2: technicianFormData.image2,
              image3: technicianFormData.image3
            }
          );
          
          if (uploadResult.success) {
            const updatedVisit = { ...visitData, ...updateData };
            setPendingUpdate(updatedVisit);
            setModal({
              isOpen: true,
              type: 'success',
              title: 'Success',
              message: `Visit details updated and images uploaded successfully!\n\nCustomer: ${visitData.first_name} ${visitData.last_name}`,
              onConfirm: () => {
                setErrors({});
                onSave(pendingUpdate!);
                setPendingUpdate(null);
                onClose();
                setModal({ ...modal, isOpen: false });
              }
            });
          } else {
            setModal({
              isOpen: true,
              type: 'warning',
              title: 'Partial Success',
              message: `Visit details updated, but image upload failed: ${uploadResult.message}`
            });
          }
        } catch (uploadError: any) {
          const errorMsg = uploadError.response?.data?.message || uploadError.message || 'Unknown error';
          setModal({
            isOpen: true,
            type: 'warning',
            title: 'Partial Success',
            message: `Visit details updated, but image upload failed: ${errorMsg}`
          });
        }
      } else {
        const updatedVisit = { ...visitData, ...updateData };
        setPendingUpdate(updatedVisit);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: `Visit details updated successfully!\n\nCustomer: ${formData.firstName} ${formData.lastName}`,
          onConfirm: () => {
            setErrors({});
            onSave(pendingUpdate!);
            setPendingUpdate(null);
            onClose();
            setModal({ ...modal, isOpen: false });
          }
        });
      }
    } catch (error: any) {
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
      
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Failed to Update',
        message: `Failed to update visit details: ${errorMessage}`
      });
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

  if (!isOpen) return null;

  return (
    <>
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
                      onChange={(e) => handleImageChange('image1', e)}
                      className="hidden"
                      id="image-upload-1"
                    />
                    <label htmlFor="image-upload-1" className="cursor-pointer flex flex-col items-center">
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

                {technicianFormData.image1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image 2
                    </label>
                    <div className="w-full px-3 py-12 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange('image2', e)}
                        className="hidden"
                        id="image-upload-2"
                      />
                      <label htmlFor="image-upload-2" className="cursor-pointer flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {technicianFormData.image2 ? (
                          <span className="text-sm text-gray-300">{technicianFormData.image2.name}</span>
                        ) : (
                          <span className="text-sm text-gray-500">Click to upload image</span>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                {technicianFormData.image1 && technicianFormData.image2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image 3
                    </label>
                    <div className="w-full px-3 py-12 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange('image3', e)}
                        className="hidden"
                        id="image-upload-3"
                      />
                      <label htmlFor="image-upload-3" className="cursor-pointer flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {technicianFormData.image3 ? (
                          <span className="text-sm text-gray-300">{technicianFormData.image3.name}</span>
                        ) : (
                          <span className="text-sm text-gray-500">Click to upload image</span>
                        )}
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visit By<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={technicianFormData.visit_by}
                    onChange={(e) => handleTechnicianInputChange('visit_by', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_by ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                  >
                    <option value="">Select Visit By</option>
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  {errors.visit_by && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="mr-1">⚠</span>{errors.visit_by}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visit With<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={technicianFormData.visit_with}
                    onChange={(e) => handleTechnicianInputChange('visit_with', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_with ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                  >
                    <option value="">Select Visit With</option>
                    <option value="None">None</option>
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  {errors.visit_with && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="mr-1">⚠</span>{errors.visit_with}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visit With(Other)<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={technicianFormData.visit_with_other}
                    onChange={(e) => handleTechnicianInputChange('visit_with_other', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_with_other ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                  >
                    <option value="">Select Visit With(Other)</option>
                    <option value="None">None</option>
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  {errors.visit_with_other && <p className="text-red-500 text-xs mt-1 flex items-center"><span className="mr-1">⚠</span>{errors.visit_with_other}</p>}
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
                    Region
                  </label>
                  <div className="relative">
                    <select
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <div className="relative">
                    <select
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={!formData.region}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Barangay
                  </label>
                  <div className="relative">
                    <select
                      value={formData.barangay}
                      onChange={(e) => handleInputChange('barangay', e.target.value)}
                      disabled={!formData.city}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <select
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!formData.barangay}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{formData.barangay ? 'Select Location' : 'Select Barangay First'}</option>
                      {formData.location && !filteredLocations.some(loc => loc.location_name === formData.location) && (
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Choose Plan
                  </label>
                  <div className="relative">
                    <select
                      value={formData.choosePlan}
                      onChange={(e) => handleInputChange('choosePlan', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
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
                  <div className="relative">
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
                    <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                  </div>
                  {errors.assignedEmail && <p className="text-red-500 text-xs mt-1">{errors.assignedEmail}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">{modal.title}</h3>
            <p className="text-gray-300 mb-6 whitespace-pre-line">{modal.message}</p>
            <div className="flex items-center justify-end gap-3">
              {modal.type === 'confirm' ? (
                <>
                  <button
                    onClick={modal.onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modal.onConfirm}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (modal.onConfirm) {
                      modal.onConfirm();
                    } else {
                      setModal({ ...modal, isOpen: false });
                    }
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationVisitStatusModal;
