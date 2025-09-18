import React, { useState, useEffect } from 'react';
import { User, UpdateUserRequest, Organization } from '../types/api';
import { userService, organizationService } from '../services/userService';
import Breadcrumb from '../pages/Breadcrumb';

interface EditUserFormProps {
  user: User;
  onCancel: () => void;
  onUserUpdated: (user: User) => void;
}

const salutationOptions = [
  { value: '', label: 'Select Salutation' },
  { value: 'Mr', label: 'Mr' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' }
];

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onCancel, onUserUpdated }) => {
  
  // Initialize hooks first (they must always be called in the same order)
  const [formData, setFormData] = useState<UpdateUserRequest>({
    salutation: user?.salutation || '',
    full_name: user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
    mobile_number: user?.mobile_number || '',
    org_id: user?.org_id
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrganizations();
  }, []);
  
  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        salutation: user.salutation || '',
        full_name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        mobile_number: user.mobile_number || '',
        org_id: user.org_id
      });
    }
  }, [user]);
  
  // Validate that we have a valid user with proper ID
  if (!user || !user.user_id || user.user_id <= 0) {
    console.error('EditUserForm received invalid user data');
    return (
      <div className="p-6">
        <div className="bg-red-900 border border-red-600 rounded p-4 text-red-200">
          <h3 className="text-lg font-semibold mb-2">Invalid User Data</h3>
          <p>Cannot edit user: Invalid or missing user ID.</p>
          <button 
            onClick={onCancel}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Users
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
      const orgValue = value && value !== '' ? parseInt(value, 10) : undefined;
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

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.mobile_number && formData.mobile_number.trim() && !/^[+]?[0-9\s\-\(\)]+$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Mobile number format is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) {
      return;
    }

    // Additional validation before making the API call
    if (!user.user_id || user.user_id <= 0) {
      console.error('Cannot update user: Invalid user_id');
      setErrors({ general: 'Cannot update user: Invalid user ID' });
      return;
    }

    setLoading(true);
    try {
      // Clean and prepare the data with proper typing
      const dataToSend: UpdateUserRequest = {};
      
      // Only include fields that have values and are different from original
      if (formData.salutation !== undefined && formData.salutation !== (user.salutation || '')) {
        dataToSend.salutation = formData.salutation.trim() || undefined;
      }
      
      if (formData.full_name && formData.full_name.trim() !== (user.full_name || '')) {
        dataToSend.full_name = formData.full_name.trim();
      }
      
      if (formData.username && formData.username.trim() !== (user.username || '')) {
        dataToSend.username = formData.username.trim();
      }
      
      if (formData.email && formData.email.trim() !== (user.email || '')) {
        dataToSend.email = formData.email.trim();
      }
      
      if (formData.mobile_number !== (user.mobile_number || '')) {
        dataToSend.mobile_number = formData.mobile_number?.trim() || undefined;
      }
      
      if (formData.org_id !== user.org_id) {
        dataToSend.org_id = formData.org_id;
      }
      
      // Only include password if it's being changed
      if (formData.password && formData.password.trim()) {
        dataToSend.password = formData.password;
      }
      
      const response = await userService.updateUser(user.user_id, dataToSend);
      
      if (response.success && response.data) {
        onUserUpdated(response.data);
        onCancel();
      } else {
        setErrors({ general: response.message || 'Failed to update user' });
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      
      if (error.response?.status === 422) {
        // Handle validation errors
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
          general: error.response?.data?.message || error.message || 'Failed to update user'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Users', onClick: onCancel },
        { label: 'Edit User' }
      ]} />
      <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden text-white">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Edit User
            </h2>
            <p className="text-gray-400 text-sm">
              Update user information
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded text-red-200">
              {errors.general}
            </div>
          )}

          <div className="max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Salutation
                </label>
                <select
                  name="salutation"
                  value={formData.salutation || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-gray-400"
                >
                  {salutationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.full_name ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter full name"
                  required
                />
                {errors.full_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.username ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter username"
                  required
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.email ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter email address"
                  required
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile_number"
                  value={formData.mobile_number || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.mobile_number ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter mobile number"
                />
                {errors.mobile_number && (
                  <p className="text-red-400 text-sm mt-1">{errors.mobile_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization (Optional)
                </label>
                <select
                  name="org_id"
                  value={formData.org_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-gray-400"
                >
                  <option value="">No Organization</option>
                  {organizations.map(org => (
                    <option key={org.org_id} value={org.org_id}>
                      {org.org_name} ({org.org_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.password ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Leave blank to keep current password"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  Leave blank to keep current password. Minimum 8 characters if changing.
                </p>
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
                onClick={handleUpdateUser}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;
