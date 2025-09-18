import React, { useState, useEffect } from 'react';
import { User, CreateUserRequest, Organization } from '../types/api';
import { userService, organizationService } from '../services/userService';
import Breadcrumb from '../pages/Breadcrumb';

interface AddNewUserFormProps {
  onCancel: () => void;
  onUserCreated: (user: User) => void;
}

const salutationOptions = [
  { value: '', label: 'Select Salutation' },
  { value: 'Mr', label: 'Mr' },
  { value: 'Ms', label: 'Ms' },
  { value: 'Mrs', label: 'Mrs' },
  { value: 'Dr', label: 'Dr' },
  { value: 'Prof', label: 'Prof' }
];

const AddNewUserForm: React.FC<AddNewUserFormProps> = ({ onCancel, onUserCreated }) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    salutation: '',
    full_name: '',
    username: '',
    email: '',
    mobile_number: '',
    password: '',
    org_id: undefined
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadOrganizations();
  }, []);

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
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'org_id') {
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.mobile_number && formData.mobile_number.trim() && !/^[+]?[0-9\s\-\(\)]+$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Mobile number format is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Clean and prepare the data with proper typing
      const dataToSend: CreateUserRequest = {
        full_name: formData.full_name.trim(),
        username: formData.username.trim().toLowerCase(), // Ensure lowercase
        email: formData.email.trim().toLowerCase(), // Ensure lowercase  
        password: formData.password,
      };
      
      // Add optional fields only if they have values
      if (formData.salutation && formData.salutation.trim() && formData.salutation !== '') {
        dataToSend.salutation = formData.salutation.trim();
      }
      
      if (formData.mobile_number && formData.mobile_number.trim()) {
        dataToSend.mobile_number = formData.mobile_number.trim();
      }
      
      // Only include org_id if it's a valid number greater than 0
      if (formData.org_id && formData.org_id > 0) {
        dataToSend.org_id = formData.org_id;
      }
      
      const response = await userService.createUser(dataToSend);
      
      if (response.success && response.data) {
        onUserCreated(response.data);
        onCancel();
      } else {
        setErrors({ general: response.message || 'Failed to create user' });
      }
    } catch (error: any) {
      console.error('Failed to create user');
      
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
          general: error.response?.data?.message || error.message || 'Failed to create user'
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
        { label: 'Add a User' }
      ]} />
      <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden text-white">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Add New User
            </h2>
            <p className="text-gray-400 text-sm">
              Create a new user account
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
                  value={formData.salutation}
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
                  value={formData.full_name}
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
                  value={formData.username}
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
                  value={formData.email}
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
                  value={formData.mobile_number}
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
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white focus:outline-none focus:border-gray-400 ${
                    errors.org_id ? 'border-red-600' : 'border-gray-600'
                  }`}
                >
                  <option value="">No Organization (Optional)</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.password ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Enter password"
                  required
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 ${
                    errors.confirmPassword ? 'border-red-600' : 'border-gray-600'
                  }`}
                  placeholder="Confirm password"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
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
                onClick={handleCreateUser}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewUserForm;
