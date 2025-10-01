import React, { useState, useEffect } from 'react';
import { Group } from '../types/api';
import { groupService } from '../services/userService';
import Breadcrumb from '../pages/Breadcrumb';

interface EditGroupFormProps {
  group: Group;
  onCancel: () => void;
  onGroupUpdated: (group: Group) => void;
}

const EditGroupForm: React.FC<EditGroupFormProps> = ({ group, onCancel, onGroupUpdated }) => {
  
  const [formData, setFormData] = useState({
    group_name: group?.group_name || '',
    fb_page_link: group?.fb_page_link || '',
    fb_messenger_link: group?.fb_messenger_link || '',
    template: group?.template || '',
    company_name: group?.company_name || '',
    portal_url: group?.portal_url || '',
    hotline: group?.hotline || '',
    email: group?.email || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (group) {
      setFormData({
        group_name: group.group_name || '',
        fb_page_link: group.fb_page_link || '',
        fb_messenger_link: group.fb_messenger_link || '',
        template: group.template || '',
        company_name: group.company_name || '',
        portal_url: group.portal_url || '',
        hotline: group.hotline || '',
        email: group.email || ''
      });
    }
  }, [group]);
  
  if (!group) {
    console.error('EditGroupForm received invalid group data');
    return (
      <div className="p-6">
        <div className="bg-red-900 border border-red-600 rounded p-4 text-red-200">
          <h3 className="text-lg font-semibold mb-2">Invalid Group Data</h3>
          <p>Cannot edit group: No group data provided.</p>
          <button 
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

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

  const handleUpdateGroup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSend: { 
        group_name?: string;
        fb_page_link?: string | null;
        fb_messenger_link?: string | null;
        template?: string | null;
        company_name?: string | null;
        portal_url?: string | null;
        hotline?: string | null;
        email?: string | null;
      } = {};
      
      if (formData.group_name.trim() !== (group.group_name || '')) {
        dataToSend.group_name = formData.group_name.trim();
      }

      if (formData.fb_page_link !== (group.fb_page_link || '')) {
        dataToSend.fb_page_link = formData.fb_page_link.trim() || null;
      }

      if (formData.fb_messenger_link !== (group.fb_messenger_link || '')) {
        dataToSend.fb_messenger_link = formData.fb_messenger_link.trim() || null;
      }

      if (formData.template !== (group.template || '')) {
        dataToSend.template = formData.template.trim() || null;
      }

      if (formData.company_name !== (group.company_name || '')) {
        dataToSend.company_name = formData.company_name.trim() || null;
      }

      if (formData.portal_url !== (group.portal_url || '')) {
        dataToSend.portal_url = formData.portal_url.trim() || null;
      }

      if (formData.hotline !== (group.hotline || '')) {
        dataToSend.hotline = formData.hotline.trim() || null;
      }

      if (formData.email !== (group.email || '')) {
        dataToSend.email = formData.email.trim() || null;
      }
      
      const response = await groupService.updateGroup(group.id, dataToSend);
      
      if (response.success && response.data) {
        onGroupUpdated(response.data);
        onCancel();
      } else {
        setErrors({ general: response.message || 'Failed to update group' });
      }
    } catch (error: any) {
      console.error('Update group error:', error);
      
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
          general: error.response?.data?.message || error.message || 'Failed to update group'
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
        { label: 'Edit Group' }
      ]} />
      <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden text-white">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Edit Group
            </h2>
            <p className="text-gray-400 text-sm">
              Update group information
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
                onClick={handleUpdateGroup}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Group'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGroupForm;
