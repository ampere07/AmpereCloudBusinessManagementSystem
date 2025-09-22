import React, { useState } from 'react';
import { X, Minus, Plus, Camera, Calendar } from 'lucide-react';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: InventoryFormData) => void;
  editData?: InventoryFormData | null;
}

interface InventoryFormData {
  itemName: string;
  itemDescription: string;
  supplier: string;
  quantityAlert: number;
  image: File | null;
  modifiedBy: string;
  modifiedDate: string;
  userEmail: string;
  category: string;
  totalStockAvailable: number;
  totalStockIn: number;
}

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData
}) => {
  const [formData, setFormData] = useState<InventoryFormData>({
    itemName: editData?.itemName || '',
    itemDescription: editData?.itemDescription || '',
    supplier: editData?.supplier || '',
    quantityAlert: editData?.quantityAlert || 0,
    image: editData?.image || null,
    modifiedBy: editData?.modifiedBy || 'ravenampere0123@gmail.com',
    modifiedDate: editData?.modifiedDate || new Date().toLocaleString('sv-SE').replace(' ', ' '),
    userEmail: editData?.userEmail || 'ravenampere0123@gmail.com',
    category: editData?.category || '',
    totalStockAvailable: editData?.totalStockAvailable || 0,
    totalStockIn: editData?.totalStockIn || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof InventoryFormData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleQuantityChange = (field: 'quantityAlert' | 'totalStockAvailable' | 'totalStockIn', increment: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: increment ? prev[field] + 1 : Math.max(0, prev[field] - 1)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleInputChange('image', file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) newErrors.itemName = 'Item Name is required';
    if (!formData.itemDescription.trim()) newErrors.itemDescription = 'Item Description is required';
    if (!formData.userEmail.trim()) newErrors.userEmail = 'User Email is required';
    if (!formData.modifiedDate.trim()) newErrors.modifiedDate = 'Modified Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const suppliers = [
    'Supplier 1',
    'Supplier 2',
    'Supplier 3'
  ];

  const categories = [
    'CABLE TIES',
    'ETC',
    'EVENT',
    'FOC',
    'FTTH',
    'LADDER',
    'OFFICE',
    'OSP',
    'SERVER',
    'TAPE'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Inventory Form</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Item Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(e) => handleInputChange('itemName', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 border ${errors.itemName ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              placeholder="Enter item name"
            />
            {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
          </div>

          {/* Item Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Item Description<span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.itemDescription}
              onChange={(e) => handleInputChange('itemDescription', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 bg-gray-800 border ${errors.itemDescription ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 resize-none`}
              placeholder="Enter item description"
            />
            {errors.itemDescription && <p className="text-red-500 text-xs mt-1">{errors.itemDescription}</p>}
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Supplier
            </label>
            <select
              value={formData.supplier}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Select supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>

          {/* Quantity Alert */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity Alert<span className="text-red-500">*</span>
            </label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
              <input
                type="number"
                value={formData.quantityAlert}
                onChange={(e) => handleInputChange('quantityAlert', parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-transparent text-white focus:outline-none"
                min="0"
              />
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleQuantityChange('quantityAlert', false)}
                  className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                >
                  <Minus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange('quantityAlert', true)}
                  className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full h-24 bg-gray-800 border-2 border-dashed border-gray-700 rounded flex items-center justify-center hover:border-gray-600 transition-colors">
                <Camera className="text-gray-400" size={24} />
              </div>
              {formData.image && (
                <p className="text-xs text-gray-400 mt-2">Selected: {formData.image.name}</p>
              )}
            </div>
          </div>

          {/* Modified By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modified By
            </label>
            <div className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-400">
              {formData.modifiedBy}
            </div>
          </div>

          {/* Modified Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modified Date<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.modifiedDate}
                onChange={(e) => handleInputChange('modifiedDate', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.modifiedDate ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            {errors.modifiedDate && <p className="text-red-500 text-xs mt-1">{errors.modifiedDate}</p>}
          </div>

          {/* User Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.userEmail}
              onChange={(e) => handleInputChange('userEmail', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 border ${errors.userEmail ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              placeholder="Enter user email"
            />
            {errors.userEmail && <p className="text-red-500 text-xs mt-1">{errors.userEmail}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Total Stock Available */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Stock Available
            </label>
            <input
              type="number"
              value={formData.totalStockAvailable}
              onChange={(e) => handleInputChange('totalStockAvailable', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              min="0"
              placeholder="0"
            />
          </div>

          {/* Total Stock IN */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Stock IN
            </label>
            <input
              type="number"
              value={formData.totalStockIn}
              onChange={(e) => handleInputChange('totalStockIn', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              min="0"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFormModal;