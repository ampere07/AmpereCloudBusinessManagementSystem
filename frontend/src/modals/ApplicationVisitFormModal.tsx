import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createApplicationVisit, ApplicationVisitData } from '../services/applicationVisitService';

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
  // Log initial application data
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
    // Capture initial values of second contact number with extended logging
    const initialSecondContact = applicationData?.mobile_alt ||
                                applicationData?.Secondary_Mobile_Number ||
                                applicationData?.secondary_number ||
                                applicationData?.second_contact_number ||
                                '';
                                
    console.log('DEBUG - Initial second contact values:', {
      mobile_alt: applicationData?.mobile_alt,
      Secondary_Mobile_Number: applicationData?.Secondary_Mobile_Number,
      secondary_number: applicationData?.secondary_number,
      second_contact_number: applicationData?.second_contact_number,
      initialSecondContact
    });
    
    return {
      firstName: applicationData?.First_Name || applicationData?.first_name || '',
      middleInitial: applicationData?.Middle_Initial || applicationData?.middle_initial || '',
      lastName: applicationData?.Last_Name || applicationData?.last_name || '',
      contactNumber: applicationData?.Mobile_Number || applicationData?.mobile || applicationData?.mobile_number || '',
      secondContactNumber: initialSecondContact,
      email: applicationData?.Email_Address || applicationData?.email || '',
      address: applicationData?.Installation_Address || applicationData?.address_line || applicationData?.address || '',
      barangay: applicationData?.Barangay || applicationData?.barangay || '',
      city: applicationData?.City || applicationData?.city || '',
      region: applicationData?.Region || applicationData?.region || '',
      choosePlan: applicationData?.Desired_Plan || 'SwitchConnect - P799',
      remarks: '',
      assignedEmail: '',
      visitBy: '',
      visitWith: 'None',
      visitWithOther: '',
      visitType: 'Initial Visit',
      visitNotes: '',
      status: 'Scheduled',
      createdBy: 'ravenampere0123@gmail.com',
      modifiedBy: 'ravenampere0123@gmail.com'
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Update form data when applicationData changes
  useEffect(() => {
    if (applicationData) {
      // Debug the exact application data structure
      console.log('DEBUG - Application data loaded:', applicationData);
      console.log('DEBUG - Second contact fields:', {
        mobile_alt: applicationData.mobile_alt,
        Secondary_Mobile_Number: applicationData.Secondary_Mobile_Number,
        secondary_number: applicationData.secondary_number,
        second_contact_number: applicationData.second_contact_number,
        // Log all properties to find the correct one
        allProps: Object.keys(applicationData)
      });
      
      // Note: Data is coming from 'applications' table, not 'application'
      
      setFormData(prev => {
        // Get second contact number from any available field
        const secondContact = applicationData.mobile_alt || 
                             applicationData.Secondary_Mobile_Number || 
                             applicationData.secondary_number || 
                             applicationData.second_contact_number || 
                             '';
                             
        console.log('DEBUG - Selected second contact number:', secondContact);        
        
        return {
          ...prev,
          firstName: applicationData.First_Name || applicationData.first_name || prev.firstName,
          middleInitial: applicationData.Middle_Initial || applicationData.middle_initial || prev.middleInitial,
          lastName: applicationData.Last_Name || applicationData.last_name || prev.lastName,
          contactNumber: applicationData.Mobile_Number || applicationData.mobile || applicationData.mobile_number || prev.contactNumber,
          secondContactNumber: secondContact,
          email: applicationData.Email_Address || applicationData.email || prev.email,
          address: applicationData.Installation_Address || applicationData.address_line || applicationData.address || prev.address,
          barangay: applicationData.Barangay || applicationData.barangay || prev.barangay,
          city: applicationData.City || applicationData.city || prev.city,
          region: applicationData.Region || applicationData.region || prev.region,
          choosePlan: applicationData.Desired_Plan || prev.choosePlan
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

    // Required fields validation
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
    
    if (!formData.barangay.trim()) {
      newErrors.barangay = 'Barangay is required';
    }
    
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }
    
    if (!formData.choosePlan.trim()) {
      newErrors.choosePlan = 'Plan is required';
    }
    
    if (!formData.assignedEmail.trim()) {
      newErrors.assignedEmail = 'Assigned Email is required';
    }
    
    // Automatically set visitBy to assignedEmail if empty
    if (!formData.visitBy && formData.assignedEmail) {
      setFormData(prev => ({
        ...prev,
        visitBy: formData.assignedEmail
      }));
    } else if (!formData.visitBy.trim()) {
      newErrors.visitBy = 'Assigned Technician is required';
    }

    // For "Visit With Other", only validate if "Other" is selected
    if (formData.visitWith === 'Other' && !formData.visitWithOther.trim()) {
      newErrors.visitWithOther = 'Please specify who else will visit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormDataToVisitData = (applicationId: string): ApplicationVisitData => {
    return {
      Application_ID: applicationId,
      First_Name: formData.firstName.trim(),
      Last_Name: formData.lastName.trim(),
      Middle_Initial: formData.middleInitial ? formData.middleInitial.trim() : null,
      Contact_Number: formData.contactNumber.trim(),
      Second_Contact_Number: formData.secondContactNumber ? formData.secondContactNumber.trim() : null,
      Email_Address: formData.email.trim(),
      Address: formData.address.trim(),
      Barangay: formData.barangay || null,
      City: formData.city || null,
      Region: formData.region || null,
      Choose_Plan: formData.choosePlan,
      Visit_Notes: formData.remarks ? formData.remarks.trim() : null,
      Installation_Landmark: formData.remarks ? formData.remarks.trim() : null,
      Assigned_Email: formData.assignedEmail,
      Visit_By: formData.visitBy || formData.assignedEmail,
      Visit_With: formData.visitWith !== 'Other' && formData.visitWith !== 'None' ? formData.visitWith : null,
      Visit_With_Other: formData.visitWith === 'Other' ? (formData.visitWithOther ? formData.visitWithOther.trim() : null) : null,
      Visit_Type: formData.visitType,
      Visit_Status: formData.status,
      Created_By: formData.createdBy,
      Modified_By: formData.modifiedBy
    };
  };

  const handleSave = async () => {
    console.log('Save button clicked!', formData);
    
    // Check validation
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (!isValid) {
      console.log('Form validation failed. Errors:', errors);
      alert('Please fill in all required fields before saving.');
      return;
    }
    
    if (!applicationData?.id && !applicationData?.Application_ID) {
      console.error('No application ID available');
      alert('Missing application ID. Cannot save visit.');
      return;
    }

    setLoading(true);
    try {
      // Use either id or Application_ID
      const applicationId = applicationData.id || applicationData.Application_ID;
      
      // Prepare visit data with proper validation and defaults
      const visitData = mapFormDataToVisitData(applicationId);
      
      // Ensure all critical fields are populated
      if (!visitData.Visit_By && visitData.Assigned_Email) {
        visitData.Visit_By = visitData.Assigned_Email;
      }
      
      // Validate required fields one more time before API call
      if (!visitData.Application_ID || !visitData.First_Name || !visitData.Last_Name || 
          !visitData.Contact_Number || !visitData.Email_Address || !visitData.Address || 
          !visitData.Assigned_Email) {
        throw new Error('Required fields are missing. Please check your form data.');
      }
      
      console.log('Final data being sent to API:', JSON.stringify(visitData, null, 2));
      
      // Call the API to create the visit
      const result = await createApplicationVisit(visitData);
      console.log('Application visit created successfully:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create application visit');
      }
      
      // Show success message
      console.log('Visit created successfully with ID:', result.data?.id || result.data?.ID);
      alert(`Visit created successfully!\n\nTechnician: ${visitData.Assigned_Email}`);
      
      // Reset form errors to show clean state
      setErrors({});
      
      // Pass the created visit data back to parent
      onSave(visitData);
      onClose();
    } catch (error: any) {
      console.error('Error creating application visit:', error);
      
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
      
      alert(`Failed to schedule visit: ${errorMessage}`);
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