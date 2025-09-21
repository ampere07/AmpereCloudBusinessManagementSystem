import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, Minus, Plus } from 'lucide-react';
import { createJobOrder, JobOrderData } from '../services/jobOrderService';
import { getContractTemplates, ContractTemplate } from '../services/lookupService';

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
  const [formData, setFormData] = useState<JOFormData>({
    timestamp: new Date().toLocaleString('sv-SE').replace(' ', ' '),
    provider: '',
    status: 'Confirmed',
    referredBy: applicationData?.source || '',
    firstName: applicationData?.first_name || '',
    middleInitial: applicationData?.middle_initial || '',
    lastName: applicationData?.last_name || '',
    contactNumber: applicationData?.mobile || applicationData?.mobileNumber || applicationData?.mobile_number || '',
    email: applicationData?.email || '',
    address: applicationData?.address_line || applicationData?.address || '',
    barangay: 'All',
    city: 'All',
    region: applicationData?.region_id || 'Rizal',
    choosePlan: 'SwitchConnect - P799',
    remarks: '',
    installationFee: 0.00,
    contractTemplate: '0',
    billingDay: '30',
    onsiteStatus: 'In Progress',
    assignedEmail: '',
    modifiedBy: 'ravenampere0123@gmail.com',
    modifiedDate: new Date().toLocaleString('sv-SE').replace(' ', ' '),
    installationLandmark: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Contract template state
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [lookupLoading, setLookupLoading] = useState(true);

  // Load contract templates on component mount
  useEffect(() => {
    const fetchContractTemplates = async () => {
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
      fetchContractTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (applicationData) {
      console.log('JO Form - Application Data:', applicationData);
      console.log('JO Form - Mobile fields:', {
        mobile: applicationData.mobile,
        mobileNumber: applicationData.mobileNumber,
        mobile_number: applicationData.mobile_number
      });
      
      setFormData(prev => ({
        ...prev,
        referredBy: applicationData.source || prev.referredBy,
        firstName: applicationData.first_name || prev.firstName,
        middleInitial: applicationData.middle_initial || prev.middleInitial,
        lastName: applicationData.last_name || prev.lastName,
        contactNumber: applicationData.mobile || applicationData.mobileNumber || applicationData.mobile_number || prev.contactNumber,
        email: applicationData.email || prev.email,
        address: applicationData.address_line || applicationData.address || prev.address,
        region: applicationData.region_id || prev.region
      }));
    }
  }, [applicationData]);

  const handleInputChange = (field: keyof JOFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberChange = (field: 'installationFee' | 'contractTemplate' | 'billingDay', increment: boolean) => {
    setFormData(prev => {
      if (field === 'installationFee') {
        return {
          ...prev,
          [field]: increment ? prev[field] + 0.01 : Math.max(0, prev[field] - 0.01)
        };
      } else {
        const currentValue = field === 'contractTemplate' ? parseInt(prev[field]) || 0 : parseInt(prev[field]) || 1;
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

    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    const billingDayNum = parseInt(formData.billingDay);
    if (isNaN(billingDayNum) || billingDayNum > 1000) {
      newErrors.billingDay = 'Billing Day cannot exceed 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapFormDataToJobOrder = (applicationId: string): JobOrderData => {
    return {
      Application_ID: applicationId,
      Timestamp: formData.timestamp,
      Email_Address: formData.email,
      Referred_By: formData.referredBy,
      First_Name: formData.firstName,
      Middle_Initial: formData.middleInitial,
      Last_Name: formData.lastName,
      Contact_Number: formData.contactNumber,
      Applicant_Email_Address: formData.email,
      Address: formData.address,
      Location: `${formData.city}, ${formData.region}`,
      Barangay: formData.barangay,
      City: formData.city,
      Region: formData.region,
      Choose_Plan: formData.choosePlan,
      Remarks: formData.remarks,
      Installation_Fee: formData.installationFee,
      Contract_Template: formData.contractTemplate,
      Billing_Day: formData.billingDay,
      Status: formData.status,
      Onsite_Status: formData.onsiteStatus,
      Assigned_Email: formData.assignedEmail,
      Modified_By: formData.modifiedBy,
      Modified_Date: formData.modifiedDate,
      Installation_Landmark: formData.installationLandmark,
      // Set these to undefined rather than null to match the JobOrderData interface
      Modem_Router_SN: undefined,
      LCP: undefined,
      NAP: undefined,
      PORT: undefined,
      VLAN: undefined,
      LCPNAP: undefined
    };
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    if (!applicationData?.id) {
      console.error('No application ID available');
      return;
    }

    setLoading(true);
    try {
      const jobOrderData = mapFormDataToJobOrder(applicationData.id);
      console.log('Creating Job Order with data:', jobOrderData);
      
      const result = await createJobOrder(jobOrderData);
      console.log('Job Order created successfully:', result);
      
      // Pass the created job order data back to parent
      onSave(jobOrderData);
      onClose();
    } catch (error) {
      console.error('Error creating job order:', error);
      // You could show an error message to the user here
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

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            {/* Timestamp */}
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

            {/* Provider */}
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

            {/* Status */}
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
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Referred By */}
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

          {/* Personal Information Section */}
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Middle Initial</label>
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
          </div>

          {/* Address Information Section */}
          <div className="space-y-4">
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
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="All">All</option>
                  <option value="Barangay 1">Barangay 1</option>
                  <option value="Barangay 2">Barangay 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
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
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Service Information Section */}
          <div className="space-y-4">
            {/* Choose Plan */}
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
                  <option value="SwitchConnect - P799">SwitchConnect - P799</option>
                  <option value="SwitchConnect - P999">SwitchConnect - P999</option>
                  <option value="SwitchConnect - P1299">SwitchConnect - P1299</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Installation Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Installation Fee<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <span className="px-3 text-gray-400">₱</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.installationFee.toFixed(2)}
                  onChange={(e) => handleInputChange('installationFee', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-transparent text-white focus:outline-none"
                />
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('installationFee', false)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('installationFee', true)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Contract Template */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contract Template<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <input
                  type="number"
                  value={formData.contractTemplate}
                  onChange={(e) => handleInputChange('contractTemplate', e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent text-white focus:outline-none"
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
            </div>

            {/* Billing Day */}
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
                  className={`flex-1 px-3 py-2 bg-transparent text-white focus:outline-none ${errors.billingDay ? 'border-red-500' : ''}`}
                />
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('billingDay', false)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('billingDay', true)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {parseInt(formData.billingDay) > 1000 && (
                <p className="text-orange-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠</span>
                  Billing Day count cannot exceed 1000
                </p>
              )}
              {errors.billingDay && <p className="text-red-500 text-xs mt-1">{errors.billingDay}</p>}
            </div>
          </div>

          {/* Assignment Information Section */}
          <div className="space-y-4">
            {/* Onsite Status */}
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
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
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
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value=""></option>
                  <option value="tech1@ampere.com">tech1@ampere.com</option>
                  <option value="tech2@ampere.com">tech2@ampere.com</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Modified By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modified By<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.modifiedBy}
                onChange={(e) => handleInputChange('modifiedBy', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Modified Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modified Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.modifiedDate}
                  onChange={(e) => handleInputChange('modifiedDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Installation Landmark */}
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