import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Plus, Hash, Edit2, Trash2, Save, X } from 'lucide-react';
import AddColorPaletteModal from '../modals/AddColorPaletteModal';
import { customAccountNumberService, CustomAccountNumber } from '../services/customAccountNumberService';

interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedPalette, setSelectedPalette] = useState<string>('default');
  const [showAddPaletteModal, setShowAddPaletteModal] = useState<boolean>(false);
  const [customPalettes, setCustomPalettes] = useState<ColorPalette[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [customAccountNumber, setCustomAccountNumber] = useState<CustomAccountNumber | null>(null);
  const [isEditingAccountNumber, setIsEditingAccountNumber] = useState<boolean>(false);
  const [accountNumberInput, setAccountNumberInput] = useState<string>('');
  const [loadingAccountNumber, setLoadingAccountNumber] = useState<boolean>(false);

  const colorPalettes: ColorPalette[] = [
    {
      id: 'default',
      name: 'Default Orange',
      primary: '#f97316',
      secondary: '#1f2937',
      accent: '#fb923c'
    },
    {
      id: 'blue',
      name: 'Ocean Blue',
      primary: '#3b82f6',
      secondary: '#1e293b',
      accent: '#60a5fa'
    }
  ];

  const fetchCustomAccountNumber = async () => {
    try {
      setLoadingAccountNumber(true);
      const response = await customAccountNumberService.get();
      if (response.success && response.data) {
        setCustomAccountNumber(response.data);
        setAccountNumberInput(response.data.starting_number);
      } else {
        setCustomAccountNumber(null);
        setAccountNumberInput('');
      }
    } catch (error) {
      console.error('Error fetching custom account number:', error);
    } finally {
      setLoadingAccountNumber(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedPalette = localStorage.getItem('colorPalette');
    const savedCustomPalettes = localStorage.getItem('customColorPalettes');
    
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    
    if (savedPalette) {
      setSelectedPalette(savedPalette);
    }

    if (savedCustomPalettes) {
      try {
        setCustomPalettes(JSON.parse(savedCustomPalettes));
      } catch (error) {
        console.error('Failed to parse custom palettes:', error);
      }
    }

    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        const role = userData.role?.toLowerCase() || '';
        setUserRole(role);
        
        if (role === 'administrator') {
          fetchCustomAccountNumber();
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePaletteChange = (paletteId: string) => {
    setSelectedPalette(paletteId);
    localStorage.setItem('colorPalette', paletteId);
    
    const allPalettes = [...colorPalettes, ...customPalettes];
    const palette = allPalettes.find(p => p.id === paletteId);
    if (palette) {
      document.documentElement.style.setProperty('--color-primary', palette.primary);
      document.documentElement.style.setProperty('--color-secondary', palette.secondary);
      document.documentElement.style.setProperty('--color-accent', palette.accent);
    }
  };

  const handleSaveAccountNumber = async () => {
    if (!accountNumberInput.trim()) {
      alert('Please enter a starting number');
      return;
    }

    const alphanumericRegex = /^[A-Za-z0-9]{6,9}$/;
    if (!alphanumericRegex.test(accountNumberInput.trim())) {
      alert('Starting number must be 6-9 characters long and contain only letters and numbers');
      return;
    }

    try {
      setLoadingAccountNumber(true);
      if (customAccountNumber) {
        await customAccountNumberService.update(accountNumberInput.trim());
        alert('Starting account number updated successfully');
      } else {
        await customAccountNumberService.create(accountNumberInput.trim());
        alert('Starting account number created successfully');
      }
      await fetchCustomAccountNumber();
      setIsEditingAccountNumber(false);
    } catch (error: any) {
      console.error('Error saving custom account number:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to save: ${errorMessage}`);
    } finally {
      setLoadingAccountNumber(false);
    }
  };

  const handleDeleteAccountNumber = async () => {
    if (!customAccountNumber) return;

    if (!window.confirm('Are you sure you want to delete the starting account number?')) {
      return;
    }

    try {
      setLoadingAccountNumber(true);
      await customAccountNumberService.delete();
      alert('Starting account number deleted successfully');
      setCustomAccountNumber(null);
      setAccountNumberInput('');
      setIsEditingAccountNumber(false);
    } catch (error: any) {
      console.error('Error deleting custom account number:', error);
      alert(`Failed to delete: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingAccountNumber(false);
    }
  };

  const handleCancelEdit = () => {
    if (customAccountNumber) {
      setAccountNumberInput(customAccountNumber.starting_number);
    } else {
      setAccountNumberInput('');
    }
    setIsEditingAccountNumber(false);
  };

  const handleAddPalette = (newPalette: ColorPalette) => {
    const updatedPalettes = [...customPalettes, newPalette];
    setCustomPalettes(updatedPalettes);
    localStorage.setItem('customColorPalettes', JSON.stringify(updatedPalettes));
    handlePaletteChange(newPalette.id);
  };

  const handleDeletePalette = (paletteId: string) => {
    const updatedPalettes = customPalettes.filter(p => p.id !== paletteId);
    setCustomPalettes(updatedPalettes);
    localStorage.setItem('customColorPalettes', JSON.stringify(updatedPalettes));
    
    if (selectedPalette === paletteId) {
      handlePaletteChange('default');
    }
  };

  const allPalettes = [...colorPalettes, ...customPalettes];

  return (
    <div className="p-6">
      <div className="mb-6 pb-6 border-b border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Settings
        </h2>
      </div>

      <div className="space-y-6">
        {userRole === 'administrator' && (
          <div className="pb-6 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">
                Starting Account Number
              </h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Set a custom starting number for new billing accounts. This can only be created once. You can edit or delete it after creation.
              </p>

              {loadingAccountNumber ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : customAccountNumber && !isEditingAccountNumber ? (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500 bg-opacity-20 flex items-center justify-center">
                      <Hash className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg">{customAccountNumber.starting_number}</p>
                      <p className="text-gray-400 text-xs">Current starting number</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingAccountNumber(true)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={handleDeleteAccountNumber}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Starting Number
                    </label>
                    <input
                      type="text"
                      value={accountNumberInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 9);
                        setAccountNumberInput(value);
                      }}
                      placeholder="e.g., ABC12345"
                      maxLength={9}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 uppercase"
                      disabled={loadingAccountNumber}
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Enter 6-9 alphanumeric characters (letters and numbers only) for the starting account number.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveAccountNumber}
                      disabled={loadingAccountNumber}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded transition-colors"
                    >
                      <Save size={18} />
                      <span>{customAccountNumber ? 'Update' : 'Create'}</span>
                    </button>
                    {customAccountNumber && (
                      <button
                        onClick={handleCancelEdit}
                        disabled={loadingAccountNumber}
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
          </div>
        )}

        <div className="pb-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">
              Theme Mode
            </h3>
          </div>
          
          <div className="flex items-center justify-between bg-gray-900 p-6 rounded border border-gray-700">
            <div>
              <p className="text-white font-medium mb-1">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-gray-400 text-sm">
                Switch between light and dark theme
              </p>
            </div>
            
            <button
              onClick={handleThemeToggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {isDarkMode ? (
                  <Moon className="h-4 w-4 text-orange-500 m-1" />
                ) : (
                  <Sun className="h-4 w-4 text-gray-600 m-1" />
                )}
              </span>
            </button>
          </div>
        </div>

        <div className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">
              Color Palette
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPalettes.map((palette) => {
              const isCustom = palette.id.startsWith('custom_');
              return (
                <div
                  key={palette.id}
                  onClick={() => handlePaletteChange(palette.id)}
                  className={`bg-gray-900 p-6 rounded border-2 cursor-pointer transition-all relative ${
                    selectedPalette === palette.id
                      ? 'border-orange-500 shadow-lg'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">
                      {palette.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      {selectedPalette === palette.id && (
                        <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${palette.name}?`)) {
                              handleDeletePalette(palette.id);
                            }
                          }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-colors"
                          title="Delete palette"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div
                        className="h-12 rounded"
                        style={{ backgroundColor: palette.primary }}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Primary
                      </p>
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-12 rounded"
                        style={{ backgroundColor: palette.secondary }}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Secondary
                      </p>
                    </div>
                    <div className="flex-1">
                      <div
                        className="h-12 rounded"
                        style={{ backgroundColor: palette.accent }}
                      />
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        Accent
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={() => setShowAddPaletteModal(true)}
              className="bg-gray-900 p-6 rounded border-2 border-dashed border-gray-700 hover:border-orange-500 transition-all flex flex-col items-center justify-center gap-3 min-h-[180px]"
            >
              <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                <Plus className="h-6 w-6 text-orange-400" />
              </div>
              <p className="text-white font-medium">Add Custom Palette</p>
              <p className="text-gray-400 text-sm text-center">
                Create your own color scheme
              </p>
            </button>
          </div>
        </div>
      </div>

      <AddColorPaletteModal
        isOpen={showAddPaletteModal}
        onClose={() => setShowAddPaletteModal(false)}
        onSave={handleAddPalette}
      />
    </div>
  );
};

export default Settings;
