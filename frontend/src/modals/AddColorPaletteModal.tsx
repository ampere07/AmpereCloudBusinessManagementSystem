import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddColorPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (palette: ColorPaletteData) => void;
}

interface ColorPaletteData {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
}

const AddColorPaletteModal: React.FC<AddColorPaletteModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [paletteName, setPaletteName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f97316');
  const [secondaryColor, setSecondaryColor] = useState('#1f2937');
  const [accentColor, setAccentColor] = useState('#fb923c');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paletteName.trim()) {
      newErrors.name = 'Palette name is required';
    }

    if (!validateHexColor(primaryColor)) {
      newErrors.primary = 'Invalid hex color';
    }

    if (!validateHexColor(secondaryColor)) {
      newErrors.secondary = 'Invalid hex color';
    }

    if (!validateHexColor(accentColor)) {
      newErrors.accent = 'Invalid hex color';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const newPalette: ColorPaletteData = {
      id: `custom_${Date.now()}`,
      name: paletteName,
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor
    };

    onSave(newPalette);
    handleClose();
  };

  const handleClose = () => {
    setPaletteName('');
    setPrimaryColor('#f97316');
    setSecondaryColor('#1f2937');
    setAccentColor('#fb923c');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Custom Color Palette</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm"
            >
              Save
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Palette Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={paletteName}
              onChange={(e) => {
                setPaletteName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="Enter palette name"
              className={`w-full px-3 py-2 bg-gray-800 border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } rounded text-white focus:outline-none focus:border-orange-500`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Color<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      if (errors.primary) setErrors({ ...errors, primary: '' });
                    }}
                    placeholder="#f97316"
                    className={`w-full px-3 py-2 bg-gray-800 border ${
                      errors.primary ? 'border-red-500' : 'border-gray-700'
                    } rounded text-white focus:outline-none focus:border-orange-500`}
                  />
                  {errors.primary && <p className="text-red-500 text-xs mt-1">{errors.primary}</p>}
                </div>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                />
              </div>
              <div
                className="mt-2 h-12 rounded border border-gray-700"
                style={{ backgroundColor: primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secondary Color<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      if (errors.secondary) setErrors({ ...errors, secondary: '' });
                    }}
                    placeholder="#1f2937"
                    className={`w-full px-3 py-2 bg-gray-800 border ${
                      errors.secondary ? 'border-red-500' : 'border-gray-700'
                    } rounded text-white focus:outline-none focus:border-orange-500`}
                  />
                  {errors.secondary && <p className="text-red-500 text-xs mt-1">{errors.secondary}</p>}
                </div>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-16 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                />
              </div>
              <div
                className="mt-2 h-12 rounded border border-gray-700"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Accent Color<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      if (errors.accent) setErrors({ ...errors, accent: '' });
                    }}
                    placeholder="#fb923c"
                    className={`w-full px-3 py-2 bg-gray-800 border ${
                      errors.accent ? 'border-red-500' : 'border-gray-700'
                    } rounded text-white focus:outline-none focus:border-orange-500`}
                  />
                  {errors.accent && <p className="text-red-500 text-xs mt-1">{errors.accent}</p>}
                </div>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-16 h-10 bg-gray-800 border border-gray-700 rounded cursor-pointer"
                />
              </div>
              <div
                className="mt-2 h-12 rounded border border-gray-700"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Preview</h3>
            <div className="bg-gray-800 p-4 rounded border border-gray-700">
              <div className="flex gap-3">
                <div className="flex-1">
                  <div
                    className="h-16 rounded"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">Primary</p>
                </div>
                <div className="flex-1">
                  <div
                    className="h-16 rounded"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">Secondary</p>
                </div>
                <div className="flex-1">
                  <div
                    className="h-16 rounded"
                    style={{ backgroundColor: accentColor }}
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">Accent</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddColorPaletteModal;
