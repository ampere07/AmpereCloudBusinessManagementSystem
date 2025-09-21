import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
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
  scheduledDate: string;
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
        properties: Object.keys(applicationData || {})
      });
    }
  }, [isOpen, applicationData]);
  
  // Get tomorrow's date for default scheduling
  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  const [formData, setFormData] = useState<VisitFormData>(() => {
    // Capture initial values of second contact number with extended logging
    const initialSecondContact = applicationData?.mobile_alt ||
                                applicationData?.secondaryNumber ||
                                applicationData?.second_contact_number ||
                                '';
                                
    console.log('DEBUG - Initial second contact values:', {
      mobile_alt: applicationData?.mobile_alt,
      secondaryNumber: applicationData?.secondaryNumber,
      second_contact_number: applicationData?.second_contact_number,
      initialSecondContact
    });
    
    return {
      firstName: applicationData?.first_name || '',
      middleInitial: applicationData?.middle_initial || '',
      lastName: applicationData?.last_name || '',
      contactNumber: applicationData?.mobile || applicationData?.mobileNumber || applicationData?.mobile_number || '',
      secondContactNumber: initialSecondContact,
      email: applicationData?.email || '',
      address: applicationData?.address_line || applicationData?.address || '',
      barangay: 'All',
      city: 'All',
      region: applicationData?.region_id || 'Rizal',
      choosePlan: 'SwitchConnect - P799',
      remarks: '',
      assignedEmail: '',
      scheduledDate: getTomorrow(),
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
        secondaryNumber: applicationData.secondaryNumber,
        second_contact_number: applicationData.second_contact_number,
        // Log all properties to find the correct one
        allProps: Object.keys(applicationData)
      });
      
      setFormData(prev => {
        // Get second contact number from any available field
        const secondContact = applicationData.mobile_alt || 
                             applicationData.secondaryNumber || 
                             applicationData.secondary_number || 
                             applicationData.second_contact_number || 
                             '';
                             
        console.log('DEBUG - Selected second contact number:', secondContact);        
        
        return {
          ...prev,
          firstName: applicationData.first_name || prev.firstName,
          middleInitial: applicationData.middle_initial || prev.middleInitial,
          lastName: applicationData.last_name || prev.lastName,
          contactNumber: applicationData.mobile || applicationData.mobileNumber || applicationData.mobile_number || prev.contactNumber,
          secondContactNumber: secondContact,
          email: applicationData.email || prev.email,
          address: applicationData.address_line || applicationData.address || prev.address,
          region: applicationData.region_id || prev.region
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

    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
    if (!formData.region.trim()) newErrors.region = 'Region is required';
    if (!formData.choosePlan.trim()) newErrors.choosePlan = 'Plan is required';
    if (!formData.assignedEmail.trim()) newErrors.assignedEmail = 'Assigned Email is required';
    if (!formData.scheduledDate.trim()) newErrors.scheduledDate = 'Scheduled Date is required';
    
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
      First_Name: formData.firstName,
      Last_Name: formData.lastName,
      Middle_Initial: formData.middleInitial,
      Contact_Number: formData.contactNumber,
      Second_Contact_Number: formData.secondContactNumber,
      Email_Address: formData.email,
      Address: formData.address,
      Barangay: formData.barangay,
      City: formData.city,
      Region: formData.region,
      Choose_Plan: formData.choosePlan,
      Visit_Notes: formData.remarks, // Use remarks as Visit_Notes
      Installation_Landmark: formData.remarks, // Also use remarks as Installation_Landmark
      Assigned_Email: formData.assignedEmail,
      Scheduled_Date: formData.scheduledDate,
      Visit_By: formData.visitBy || formData.assignedEmail,
      Visit_With: formData.visitWith !== 'Other' ? formData.visitWith : undefined,
      Visit_With_Other: formData.visitWith === 'Other' ? formData.visitWithOther : undefined,
      Visit_Type: formData.visitType,
      Status: formData.status,
      Location: `${formData.city}, ${formData.region}`,
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
      // Display error message to user
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
      const visitData = mapFormDataToVisitData(applicationData.id);
      console.log('Creating application visit with data:', visitData);
      
      // Ensure visitBy is set
      if (!visitData.Visit_By && visitData.Assigned_Email) {
        visitData.Visit_By = visitData.Assigned_Email;
      }
      
      // Log the data being sent to the API
      console.log('Second Contact Number:', formData.secondContactNumber);
      console.log('Visit By:', visitData.Visit_By);
      console.log('Assigned Email:', visitData.Assigned_Email);
      
      // Call the API to create the visit
      console.log('About to call createApplicationVisit API...');
      const result = await createApplicationVisit(visitData);
      console.log('Application visit created successfully:', result);
      
      // Show success message
      alert('Visit scheduled successfully!');
      
      // Pass the created visit data back to parent
      onSave(visitData);
      onClose();
    } catch (error) {
      console.error('Error creating application visit:', error);
      // Show error message to the user
      alert(`Failed to schedule visit: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
              {/* Debug value */}
              <div className="hidden">
                Debug: {JSON.stringify({secondContactNumber: formData.secondContactNumber, applicationDataMobileAlt: applicationData?.mobile_alt})}
              </div>
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

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Barangay<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.barangay}
                  onChange={(e) => handleInputChange('barangay', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.barangay ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value="All">All</option>
                  <option value="Barangay 1">Barangay 1</option>
                  <option value="Barangay 2">Barangay 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {errors.barangay && <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City
              </label>
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="All">All</option>
                  <option value="Binangonan">Binangonan</option>
                  <option value="Rizal">Rizal</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Region<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.region ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
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
                  <option value="SwitchConnect - P799">SwitchConnect - P799</option>
                  <option value="SwitchConnect - P999">SwitchConnect - P999</option>
                  <option value="SwitchConnect - P1299">SwitchConnect - P1299</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
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
              <div className="relative">
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
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {errors.assignedEmail && <p className="text-red-500 text-xs mt-1">{errors.assignedEmail}</p>}
            </div>

            {/* Visit Information - Hidden from view but included in form */}
            <div className="hidden">
              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scheduled Date & Time<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800 border ${errors.scheduledDate ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                  />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>

              {/* Visit By */}
              <div>
                <input
                  type="hidden"
                  value={formData.assignedEmail} // Use the same value as assigned email
                  onChange={(e) => handleInputChange('visitBy', e.target.value)}
                />
              </div>

              {/* Visit Type */}
              <div>
                <input
                  type="hidden"
                  value={formData.visitType}
                  onChange={(e) => handleInputChange('visitType', e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <input
                  type="hidden"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationVisitFormModal;