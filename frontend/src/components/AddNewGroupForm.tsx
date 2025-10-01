import React, { useState } from 'react';
import { Group } from '../types/api';
import { groupService } from '../services/userService';
import Breadcrumb from '../pages/Breadcrumb';

interface AddNewGroupFormProps {
  onCancel: () => void;
  onGroupCreated: (group: Group) => void;
}

const AddNewGroupForm: React.FC<AddNewGroupFormProps> = ({ onCancel, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    group_name: '',
    fb_page_link: '',
    fb_messenger_link: '',
    template: '',
    company_name: '',
    portal_url: '',
    hotline: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.group_name?.trim()) {
      newErrors.group_name = 'Group name is required';
    }

    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        group_name: formData.group_name.trim(),
        fb_page_link: formData.fb_page_link.trim() || null,
        fb_messenger_link: formData.fb_messenger_link.trim() || null,
        template: formData.template.trim() || null,
        company_name: formData.company_name.trim() || null,
        portal_url: formData.portal_url.trim() || null,
        hotline: formData.hotline.trim() || null,
        email: formData.email.trim() || null
      };
      
      const response = await groupService.createGroup(dataToSend);
      
      if (response.success && response.data) {
        console.log('Group creation response:', response.data);
        
        if (!response.data || typeof response.data !== 'object') {
          console.error('Invalid response data:', response.data);
          setErrors({ general: 'Failed to create group. Please try again.' });
          return;
        }
        
        onGroupCreated(response.data);
        onCancel();
      } else {
        setErrors({ general: response.message || 'Failed to create group' });
      }
    } catch (error: any) {
      console.error('Create group error:', error);
      
      if (error.response?.status === 422) {
        if (error.response?.data?.errors) {
          const backendErrors: Record<string, string> = {};
          const errorData = error.response.data.errors;
          
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              backendErrors[key] = errorData[key][0];
            } else {
              backendErrors[key] = errorData[key];
            }
          });
          
          setErrors(backendErrors);
        } else if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'Validation error: Please check all required fields' });
        }
      } else {
        setErrors({ 
          general: error.response?.data?.message || error.message || 'Failed to create group'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Groups', onClick: onCancel },
        { label: 'Add Group' }
      ]} />
      <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden text-white">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Add New Group
            </h2>
            <p className="text-gray-400 text-sm">
              Create a new group in the system
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded text-red-200">
              {errors.general}
            </div>
          )}

          <div className="max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="group_name"
                  value={formData.group_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.group_name ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter group name"
                  required
                />
                {errors.group_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.group_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.company_name ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter company name"
                />
                {errors.company_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.company_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.email ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hotline
                </label>
                <input
                  type="text"
                  name="hotline"
                  value={formData.hotline}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.hotline ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter hotline number"
                />
                {errors.hotline && (
                  <p className="text-red-400 text-sm mt-1">{errors.hotline}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Portal URL
                </label>
                <input
                  type="url"
                  name="portal_url"
                  value={formData.portal_url}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.portal_url ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter portal URL"
                />
                {errors.portal_url && (
                  <p className="text-red-400 text-sm mt-1">{errors.portal_url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facebook Page Link
                </label>
                <input
                  type="url"
                  name="fb_page_link"
                  value={formData.fb_page_link}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.fb_page_link ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter Facebook page link"
                />
                {errors.fb_page_link && (
                  <p className="text-red-400 text-sm mt-1">{errors.fb_page_link}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facebook Messenger Link
                </label>
                <input
                  type="url"
                  name="fb_messenger_link"
                  value={formData.fb_messenger_link}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.fb_messenger_link ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter Facebook Messenger link"
                />
                {errors.fb_messenger_link && (
                  <p className="text-red-400 text-sm mt-1">{errors.fb_messenger_link}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Template
                </label>
                <textarea
                  name="template"
                  value={formData.template}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.template ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter template content"
                />
                {errors.template && (
                  <p className="text-red-400 text-sm mt-1">{errors.template}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 border border-gray-600 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewGroupForm;
