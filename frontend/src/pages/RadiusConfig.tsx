import React, { useState, useEffect } from 'react';
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
  data: RadiusConfigData[];
  count: number;
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
  const [radiusConfigs, setRadiusConfigs] = useState<RadiusConfigData[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

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

  const fetchRadiusConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<RadiusConfigResponse>('/radius-config');
      if (response.data.success && response.data.data) {
        setRadiusConfigs(response.data.data);
      } else {
        setRadiusConfigs([]);
      }
    } catch (error) {
      console.error('Error fetching radius configs:', error);
      setRadiusConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadiusConfigs();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      ssl_type: '',
      ip: '',
      port: '',
      username: '',
      password: ''
    });
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleStartEdit = (config: RadiusConfigData) => {
    setFormData({
      ssl_type: config.ssl_type || '',
      ip: config.ip || '',
      port: config.port || '',
      username: config.username || '',
      password: config.password || ''
    });
    setEditingId(config.id);
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

      if (isCreating) {
        await apiClient.post('/radius-config', payload);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'RADIUS configuration created successfully'
        });
        setIsCreating(false);
      } else if (editingId !== null) {
        await apiClient.put(`/radius-config/${editingId}`, payload);
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'RADIUS configuration updated successfully'
        });
        setEditingId(null);
      }
      
      await fetchRadiusConfigs();
      resetForm();
      setShowPassword({});
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

  const handleDelete = async (id: number) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this RADIUS configuration?',
      onConfirm: async () => {
        try {
          setLoading(true);
          await apiClient.delete(`/radius-config/${id}`);
          setModal({
            isOpen: true,
            type: 'success',
            title: 'Success',
            message: 'RADIUS configuration deleted successfully'
          });
          await fetchRadiusConfigs();
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
    resetForm();
    setIsCreating(false);
    setEditingId(null);
    setShowPassword({});
  };

  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const canCreateNew = radiusConfigs.length < 2;

  return (
    <div className="p-6 bg-gray-950 min-h-full">
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              RADIUS Configuration
            </h2>
          </div>
          {canCreateNew && !isCreating && editingId === null && (
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
            >
              <span>Create New</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {loading && radiusConfigs.length === 0 && !isCreating ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {radiusConfigs.map((config) => (
              <div key={config.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                {editingId === config.id ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Edit Configuration #{config.id}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          SSL Type
                        </label>
                        <select
                          value={formData.ssl_type}
                          onChange={(e) => handleInputChange('ssl_type', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                          disabled={loading}
                        >
                          <option value="">Select SSL Type</option>
                          <option value="https">HTTPS</option>
                          <option value="http">HTTP</option>
                        </select>
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
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                          disabled={loading}
                        />
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
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                          disabled={loading}
                        />
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
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                          disabled={loading}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword[config.id] ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(config.id)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            {showPassword[config.id] ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded transition-colors"
                      >
                        <span>Update</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition-colors"
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Configuration #{config.id}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(config)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900 rounded transition-colors"
                        >
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(config.id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-colors"
                        >
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-4 rounded">
                        <p className="text-gray-400 text-xs mb-1">SSL Type</p>
                        <p className="text-white font-medium text-lg uppercase">{config.ssl_type || 'Not set'}</p>
                      </div>
                      <div className="bg-gray-700 p-4 rounded">
                        <p className="text-gray-400 text-xs mb-1">IP Address</p>
                        <p className="text-white font-medium text-lg">{config.ip || 'Not set'}</p>
                      </div>
                      <div className="bg-gray-700 p-4 rounded">
                        <p className="text-gray-400 text-xs mb-1">Port</p>
                        <p className="text-white font-medium text-lg">{config.port || 'Not set'}</p>
                      </div>
                      <div className="bg-gray-700 p-4 rounded">
                        <p className="text-gray-400 text-xs mb-1">Username</p>
                        <p className="text-white font-medium text-lg">{config.username || 'Not set'}</p>
                      </div>
                      <div className="bg-gray-700 p-4 rounded">
                        <p className="text-gray-400 text-xs mb-1">Password</p>
                        <p className="text-white font-medium text-lg">
                          {showPassword[config.id] ? config.password : '••••••••'}
                        </p>
                        <button
                          onClick={() => togglePasswordVisibility(config.id)}
                          className="text-orange-400 hover:text-orange-300 text-xs mt-1"
                        >
                          {showPassword[config.id] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="bg-gray-700 p-4 rounded">
                        <p className="text-gray-400 text-xs mb-1">Last Updated By</p>
                        <p className="text-white font-medium text-lg">{config.updated_by || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isCreating && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Configuration</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SSL Type
                      </label>
                      <select
                        value={formData.ssl_type}
                        onChange={(e) => handleInputChange('ssl_type', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                        disabled={loading}
                      >
                        <option value="">Select SSL Type</option>
                        <option value="https">HTTPS</option>
                        <option value="http">HTTP</option>
                      </select>
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
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                        disabled={loading}
                      />
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
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                        disabled={loading}
                      />
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
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                        disabled={loading}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword[0] ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter password"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(0)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword[0] ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      <span>Create</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {radiusConfigs.length === 0 && !isCreating && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg mb-2">No RADIUS configurations found</p>
              </div>
            )}
          </>
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
