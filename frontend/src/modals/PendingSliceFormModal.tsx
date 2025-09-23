import React, { useState } from 'react';
import { X, Calendar, ChevronDown, Minus, Plus, Camera } from 'lucide-react';

interface PendingSliceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: PendingSliceFormData) => void;
}

interface PendingSliceFormData {
  transactionId: string;
  accountNo: string;
  receivedPayment: number;
  dateProcessed: string;
  processedBy: string;
  paymentMethod: string;
  referenceNo: string;
  orNo: string;
  remarks: string;
  modifiedBy: string;
  modifiedDate: string;
  userEmail: string;
  status: string;
  transactionType: string;
  paymentDate: string;
  city: string;
  image?: string;
}

const PendingSliceFormModal: React.FC<PendingSliceFormModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<PendingSliceFormData>({
    transactionId: '20250923092348',
    accountNo: '',
    receivedPayment: 0.00,
    dateProcessed: new Date().toLocaleString('sv-SE').replace(' ', ' ') + ' am',
    processedBy: '',
    paymentMethod: '',
    referenceNo: '',
    orNo: '',
    remarks: '',
    modifiedBy: 'ravenampere0123@gmail.com',
    modifiedDate: new Date().toLocaleString('sv-SE').replace(' ', ' ') + ' am',
    userEmail: 'ravenampere0123@gmail.com',
    status: 'Pending',
    transactionType: 'Recurring Fee',
    paymentDate: new Date().toLocaleString('sv-SE').replace(' ', ' ') + ' am',
    city: 'All',
    image: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof PendingSliceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberChange = (field: 'transactionId' | 'receivedPayment', increment: boolean) => {
    setFormData(prev => {
      if (field === 'receivedPayment') {
        return {
          ...prev,
          [field]: increment ? prev[field] + 0.01 : Math.max(0, prev[field] - 0.01)
        };
      } else {
        const currentValue = parseInt(prev[field]) || 0;
        const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
        return {
          ...prev,
          [field]: newValue.toString()
        };
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.accountNo.trim()) newErrors.accountNo = 'Account No. is required';
    if (!formData.processedBy.trim()) newErrors.processedBy = 'Processed By is required';
    if (!formData.paymentMethod.trim()) newErrors.paymentMethod = 'Payment Method is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      console.log('Saving Pending Slice Form data:', formData);
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving pending slice form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Pending Slice Form</h2>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Transaction Information Section */}
          <div className="space-y-4">
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction ID<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent text-white focus:outline-none"
                />
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('transactionId', false)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('transactionId', true)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Account No */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account No.<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.accountNo}
                  onChange={(e) => handleInputChange('accountNo', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.accountNo ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value=""></option>
                  <option value="ACC001">ACC001</option>
                  <option value="ACC002">ACC002</option>
                  <option value="ACC003">ACC003</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {errors.accountNo && <p className="text-red-500 text-xs mt-1">{errors.accountNo}</p>}
            </div>

            {/* Received Payment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Received Payment<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded">
                <span className="px-3 text-gray-400">₱</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.receivedPayment}
                  onChange={(e) => handleInputChange('receivedPayment', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-transparent text-white focus:outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder="0.00"
                />
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('receivedPayment', false)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Minus size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('receivedPayment', true)}
                    className="px-3 py-2 text-gray-400 hover:text-white border-l border-gray-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Date Processed */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date Processed<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.dateProcessed}
                  onChange={(e) => handleInputChange('dateProcessed', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
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

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.paymentMethod ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                >
                  <option value=""></option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
              {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
            </div>

            {/* Reference No */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reference No.<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.referenceNo}
                onChange={(e) => handleInputChange('referenceNo', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* OR No */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OR No.<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.orNo}
                onChange={(e) => handleInputChange('orNo', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* System Information Section */}
          <div className="space-y-4">
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
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-orange-400 focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="Pending" className="text-orange-400">Pending</option>
                  <option value="Processing" className="text-blue-400">Processing</option>
                  <option value="Completed" className="text-green-400">Completed</option>
                  <option value="Cancelled" className="text-red-400">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction Type<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Recurring Fee', 'Installation Fee', 'Security Deposit'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('transactionType', type)}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      formData.transactionType === type
                        ? 'bg-orange-600 text-white border border-orange-600'
                        : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Date<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.paymentDate}
                  onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
              <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750 transition-colors">
                <div className="text-center">
                  <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-400 text-sm">Click to upload image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleInputChange('image', file.name);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingSliceFormModal;