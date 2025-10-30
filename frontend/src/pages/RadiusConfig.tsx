import React, { useState, useEffect } from 'react';
import { Server, Edit2, Trash2, Save, X, Shield } from 'lucide-react';
import apiClient from '../config/api';

interface RadiusConfigData {
  id: number;
  ssl_type: string;
  ip: string;
  port: string;
  username: string;
  password: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

interface RadiusConfigResponse {
  success: boolean;
  data: RadiusConfigData | null;
  message?: string;
}

interface ModalConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const RadiusConfig: React.FC = () => {
  const [radiusConfig, setRadiusConfig] = useState<RadiusConfigData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    ssl_type: '',
    ip: '',
    port: '',
    username: '',
    password: ''
  });

  const [modal, setModal] = useState<ModalConfig>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const fetchRadiusConfig = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<RadiusConfigResponse>('/radius-config');
      if (response.data.success && response.data.data) {
        setRadiusConfig(response.data.data);
        setFormData({
          ssl_type: response.data.data.ssl_type || '',
          ip: response.data.data.ip || '',
          port: response.data.data.port || '',
          username: response.data.data.username || '',
          password: response.data.data.password || ''
        });
      } else {
        setRadiusConfig(null);
      }
    } catch (error) {
      console.error('Error fetching radius config:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadiusConfig();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const authData = localStorage.getItem('authData');
      let userEmail = 'unknown@user.com';
      
      if (authData) {
        try {
          const userData = JSON.parse(authData);
          userEmail = userData.email || userData.user?.email || 'unknown@user.com';
        } catch (error) {
          console.error('Error parsing auth data:', error);
        }
      }

      const payload = {
        ...formData,
        updated_by: userEmail
      };

      if (radiusConfig) {
        await apiClient.put('/radius-config', payload);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'RADIUS configuration updated successfully'
        });
      } else {
        await apiClient.post('/radius-config', payload);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'RADIUS configuration created successfully'
        });
      }
      await fetchRadiusConfig();
      setIsEditing(false);
      setShowPassword(false);
    } catch (error: any) {
      console.error('Error saving radius config:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error occurred';
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: `Failed to save: ${errorMessage}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!radiusConfig) return;

    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete the RADIUS configuration?',
      onConfirm: async () => {
        try {
          setLoading(true);
          await apiClient.delete('/radius-config');
          setModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'RADIUS configuration deleted successfully'
          });
          setRadiusConfig(null);
          setFormData({
            ssl_type: '',
            ip: '',
            port: '',
            username: '',
            password: ''
          });
          setIsEditing(false);
          setShowPassword(false);
        } catch (error: any) {
          console.error('Error deleting radius config:', error);
          setModal({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: `Failed to delete: ${error.response?.data?.message || error.message}`
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        setModal({ ...modal, isOpen: false });
      }
    });
  };

  const handleCancel = () => {
    if (radiusConfig) {
      setFormData({
        ssl_type: radiusConfig.ssl_type || '',
        ip: radiusConfig.ip || '',
        port: radiusConfig.port || '',
        username: radiusConfig.username || '',
        password: radiusConfig.password || ''
      });
    } else {
      setFormData({
        ssl_type: '',
        ip: '',
        port: '',
        username: '',
        password: ''
      });
    }
    setIsEditing(false);
    setShowPassword(false);
  };

  return (
    <div className="p-6 bg-gray-950 min-h-full">
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-3">
              <Server className="h-7 w-7 text-orange-500" />
              RADIUS Configuration
            </h2>
            <p className="text-gray-400 text-sm">
              Configure RADIUS server connection settings for network authentication
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading && !radiusConfig && !isEditing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : radiusConfig && !isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-xs mb-1">SSL Type</p>
                <p className="text-white font-medium text-lg">{radiusConfig.ssl_type || 'Not set'}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-xs mb-1">IP Address</p>
                <p className="text-white font-medium text-lg">{radiusConfig.ip || 'Not set'}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-xs mb-1">Port</p>
                <p className="text-white font-medium text-lg">{radiusConfig.port || 'Not set'}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-xs mb-1">Username</p>
                <p className="text-white font-medium text-lg">{radiusConfig.username || 'Not set'}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-xs mb-1">Password</p>
                <p className="text-white font-medium text-lg">
                  {showPassword ? radiusConfig.password : '••••••••'}
                </p>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-orange-400 hover:text-orange-300 text-xs mt-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-xs mb-1">Last Updated By</p>
                <p className="text-white font-medium text-lg">{radiusConfig.updated_by || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900 rounded transition-colors"
              >
                <Edit2 size={18} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-colors"
              >
                <Trash2 size={18} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SSL Type
                </label>
                <select
                  value={formData.ssl_type}
                  onChange={(e) => handleInputChange('ssl_type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                  disabled={loading}
                >
                  <option value="">Select SSL Type</option>
                  <option value="https">HTTPS</option>
                  <option value="http">HTTP</option>
                </select>
                <p className="text-gray-500 text-xs mt-2">
                  Choose the connection protocol type
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IP Address
                </label>
                <input
                  type="text"
                  value={formData.ip}
                  onChange={(e) => handleInputChange('ip', e.target.value)}
                  placeholder="e.g., 192.168.1.1"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                  disabled={loading}
                />
                <p className="text-gray-500 text-xs mt-2">
                  RADIUS server IP address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port
                </label>
                <input
                  type="text"
                  value={formData.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                  placeholder="e.g., 1812"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                  disabled={loading}
                />
                <p className="text-gray-500 text-xs mt-2">
                  RADIUS server port number (default: 1812)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                  disabled={loading}
                />
                <p className="text-gray-500 text-xs mt-2">
                  RADIUS authentication username
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    <Shield size={18} />
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">
                  RADIUS authentication password
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded transition-colors"
              >
                <Save size={18} />
                <span>{radiusConfig ? 'Update' : 'Create'}</span>
              </button>
              {radiusConfig && (
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition-colors"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">{modal.title}</h3>
            <p className="text-gray-300 mb-6">{modal.message}</p>
            <div className="flex items-center justify-end gap-3">
              {modal.type === 'confirm' ? (
                <>
                  <button
                    onClick={modal.onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={modal.onConfirm}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadiusConfig;
