import React, { useState, useEffect } from 'react';
import { Group, Organization } from '../types/api';
import { groupService, organizationService } from '../services/userService';
import Breadcrumb from '../pages/Breadcrumb';

interface EditGroupFormProps {
  group: Group;
  onCancel: () => void;
  onGroupUpdated: (group: Group) => void;
}

const EditGroupForm: React.FC<EditGroupFormProps> = ({ group, onCancel, onGroupUpdated }) => {
  
  const [formData, setFormData] = useState({
    group_name: group?.group_name || '',
    org_id: group?.org_id || 0
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    loadOrganizations();
  }, []);
  
  useEffect(() => {
    if (group) {
      setFormData({
        group_name: group.group_name || '',
        org_id: group.org_id || 0
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

  const loadOrganizations = async () => {
    try {
      const response = await organizationService.getAllOrganizations();
      if (response.success && response.data) {
        setOrganizations(response.data);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'org_id') {
      const orgValue = value && value !== '' ? parseInt(value, 10) : 0;
      setFormData(prev => ({
        ...prev,
        [name]: orgValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.group_name?.trim()) {
      newErrors.group_name = 'Group name is required';
    }

    if (!formData.org_id || formData.org_id <= 0) {
      newErrors.org_id = 'Organization is required';
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
      const dataToSend: { group_name?: string; org_id?: number } = {};
      
      if (formData.group_name.trim() !== (group.group_name || '')) {
        dataToSend.group_name = formData.group_name.trim();
      }
      
      if (formData.org_id !== group.org_id) {
        dataToSend.org_id = formData.org_id;
      }
      
      const response = await groupService.updateGroup(group.group_id, dataToSend);
      
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
            <div className="grid grid-cols-1 gap-6">
              <div>
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
                  Organization *
                </label>
                <select
                  name="org_id"
                  value={formData.org_id || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white focus:outline-none focus:border-gray-400 ${
                    errors.org_id ? 'border-red-600' : 'border-gray-600'
                  }`}
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map(org => (
                    <option key={org.org_id} value={org.org_id}>
                      {org.org_name} ({org.org_type})
                    </option>
                  ))}
                </select>
                {errors.org_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.org_id}</p>
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
