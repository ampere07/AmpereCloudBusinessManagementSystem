import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createApplicationVisit, ApplicationVisitData } from '../services/applicationVisitService';
import { UserData } from '../types/api';

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
  choosePlan: string;
  remarks: string;
  assignedEmail: string;
  visitBy: string;
  visitWith: string;
  visitWithOther: string;
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
      choosePlan: applicationData?.desired_plan || 'SwitchConnect - P799',
      remarks: '',
      assignedEmail: '',
      visitBy: '',
      visitWith: 'None',
      visitWithOther: '',
      visitType: 'Initial Visit',
      visitNotes: '',
      status: 'Scheduled',
      createdBy: currentUserEmail,
      modifiedBy: currentUserEmail
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
          choosePlan: applicationData.desired_plan || prev.choosePlan
        };
      });
    }
  }, [applicationData]);

  const handleInputChange = (field: keyof VisitFormData, value: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      
      // If assignedEmail is updated, also update visitBy
      if (field === 'assignedEmail') {
        newFormData.visitBy = value;
      }
      
      return newFormData;
    });
    
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
      createdByEmail: currentUserEmail
    });
    
    return {
      application_id: appId,
      assigned_email: formData.assignedEmail,
      visit_by_user_id: null,
      visit_with: formData.visitWith !== 'Other' && formData.visitWith !== 'None' ? formData.visitWith : (formData.visitWith === 'Other' ? formData.visitWithOther : null),
      visit_status: formData.status,
      visit_remarks: formData.remarks || formData.visitNotes || null,
      application_status: 'Scheduled',
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
      
      const visitData = mapFormDataToVisitData(applicationId);
      
      console.log('Final data being sent to API:', JSON.stringify(visitData, null, 2));
      
      const result = await createApplicationVisit(visitData);
      console.log('Application visit created successfully:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create application visit');
      }
      
      console.log('Visit created successfully with ID:', result.data?.id);
      alert(`Visit created successfully!`);
      
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

            {/* Barangay - Now using value from applications table */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Barangay<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.barangay}
                onChange={(e) => handleInputChange('barangay', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.barangay ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                placeholder="From application data"
              />
              {errors.barangay && <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>}
            </div>

            {/* City - Now using value from applications table */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                placeholder="From application data"
              />
            </div>

            {/* Region - Now using value from applications table */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Region<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.region ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                placeholder="From application data"
              />
              {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
            </div>

            {/* Choose Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Choose Plan<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.choosePlan}
                onChange={(e) => handleInputChange('choosePlan', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.choosePlan ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
              >
                <option value="SwitchConnect - P799">SwitchConnect - P799</option>
                <option value="SwitchConnect - P999">SwitchConnect - P999</option>
                <option value="SwitchConnect - P1299">SwitchConnect - P1299</option>
              </select>
              {errors.choosePlan && <p className="text-red-500 text-xs mt-1">{errors.choosePlan}</p>}
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
              </select>
              {errors.assignedEmail && <p className="text-red-500 text-xs mt-1">{errors.assignedEmail}</p>}
            </div>



            {/* Hidden fields for form completion */}
            <input type="hidden" value={formData.visitBy || formData.assignedEmail} />
            <input type="hidden" value={formData.visitType} />
            <input type="hidden" value={formData.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationVisitFormModal;