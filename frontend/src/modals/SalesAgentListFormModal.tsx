import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SalesAgentListFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: SalesAgentFormData) => void;
}

interface SalesAgentFormData {
  name: string;
  contactNo: string;
  email: string;
  location: string;
  idNumber: string;
  status: string;
}

const SalesAgentListFormModal: React.FC<SalesAgentListFormModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<SalesAgentFormData>({
    name: '',
    contactNo: '',
    email: '',
    location: '',
    idNumber: '',
    status: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof SalesAgentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    // Add other validations as needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      console.log('Saving Sales Agent Form data:', formData);
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving sales agent form:', error);
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
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            <h2 className="text-base font-normal text-white">Sales Agent List Form</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-sm text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-sm text-sm flex items-center"
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
              className="text-white mr-3"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Name Field */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">
              NAME<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } rounded-sm text-white focus:outline-none focus:border-orange-500`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Contact No Field */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">
              CONTACT NO.
            </label>
            <input
              type="text"
              value={formData.contactNo}
              onChange={(e) => handleInputChange('contactNo', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">
              EMAIL
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">
              LOCATION
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* ID Number Field */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">
              ID NUMBER
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => handleInputChange('idNumber', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-xs text-gray-300 mb-1">
              STATUS
            </label>
            <input
              type="text"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAgentListFormModal;