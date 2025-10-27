import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Plus } from 'lucide-react';
import AddColorPaletteModal from '../modals/AddColorPaletteModal';

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
