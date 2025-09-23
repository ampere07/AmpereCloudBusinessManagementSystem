import React, { useState } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';

interface DailyExpensesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: DailyExpensesFormData) => void;
}

interface DailyExpensesFormData {
  id: string;
  date: string;
  provider: string;
  totalAmount: number;
  processedBy: string;
  modifiedBy: string;
  modifiedDate: string;
  userEmail: string;
  barangay: string;
  city: string;
}

const DailyExpensesFormModal: React.FC<DailyExpensesFormModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<DailyExpensesFormData>({
    id: '20250923095124000',
    date: '23/09/2025',
    provider: '',
    totalAmount: 0.00,
    processedBy: '',
    modifiedBy: 'ravenampere0123@gmail.com',
    modifiedDate: '23/09/2025 09:51:24 am',
    userEmail: 'ravenampere0123@gmail.com',
    barangay: 'All',
    city: 'All'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof DailyExpensesFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) newErrors.id = 'ID is required';
    if (!formData.date.trim()) newErrors.date = 'Date is required';
    if (!formData.provider.trim()) newErrors.provider = 'Provider is required';
    if (formData.totalAmount <= 0) newErrors.totalAmount = 'Total Amount must be greater than 0';
    if (!formData.processedBy.trim()) newErrors.processedBy = 'Processed By is required';
    if (!formData.userEmail.trim()) newErrors.userEmail = 'User Email is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      console.log('Saving Daily Expenses Form data:', formData);
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving daily expenses form:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Daily Expenses Form</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm flex items-center"
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ID<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleInputChange('id', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.id ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.date ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
                  placeholder="23/09/2025"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Provider<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.provider ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value=""></option>
                  <option value="SWITCH">SWITCH</option>
                  <option value="Globe Telecom">Globe Telecom</option>
                  <option value="PLDT">PLDT</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Amount<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <span className="px-3 text-gray-400">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-transparent text-white focus:outline-none"
                  placeholder="0.00"
                />
              </div>
              {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount}</p>}
            </div>

            {/* Processed By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Processed By<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.processedBy}
                  onChange={(e) => handleInputChange('processedBy', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.processedBy ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value=""></option>
                  <option value="Jane Doe">Jane Doe</option>
                  <option value="John Smith">John Smith</option>
                  <option value="Mike Johnson">Mike Johnson</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {errors.processedBy && <p className="text-red-500 text-xs mt-1">{errors.processedBy}</p>}
            </div>

            {/* Modified By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Modified By<span className="text-red-500">*</span>
              </label>
              <div className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white">
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
                  type="text"
                  value={formData.modifiedDate}
                  onChange={(e) => handleInputChange('modifiedDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
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
              />
              {errors.userEmail && <p className="text-red-500 text-xs mt-1">{errors.userEmail}</p>}
            </div>

            {/* Barangay */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Barangay</label>
              <div className="relative">
                <select
                  value={formData.barangay}
                  onChange={(e) => handleInputChange('barangay', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="All">All</option>
                  <option value="Barangay 1">Barangay 1</option>
                  <option value="Barangay 2">Barangay 2</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
              <div className="relative">
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="All">All</option>
                  <option value="Angono">Angono</option>
                  <option value="Binangonan">Binangonan</option>
                  <option value="Cardona">Cardona</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyExpensesFormModal;