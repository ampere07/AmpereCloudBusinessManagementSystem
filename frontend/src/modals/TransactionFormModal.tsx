import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, Minus, Plus, Camera } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: TransactionFormData) => void;
  billingRecord?: any;
}

interface TransactionFormData {
  provider: string;
  accountNo: string;
  fullName: string;
  contactNo: string;
  plan: string;
  accountBalance: string;
  paymentDate: string;
  receivedPayment: string;
  processedBy: string;
  paymentMethod: string;
  referenceNo: string;
  orNo: string;
  transactionType: string;
  remarks: string;
  image: File | null;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  billingRecord
}) => {
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<TransactionFormData>(() => ({
    provider: 'SWITCH',
    accountNo: billingRecord?.applicationId || '',
    fullName: billingRecord?.customerName || '',
    contactNo: billingRecord?.contactNumber || '',
    plan: billingRecord?.plan || 'SwitchLite - P699',
    accountBalance: billingRecord?.accountBalance?.toString() || '0.00',
    paymentDate: getCurrentDateTime(),
    receivedPayment: '0.00',
    processedBy: '',
    paymentMethod: '',
    referenceNo: '',
    orNo: '',
    transactionType: 'Recurring Fee',
    remarks: '',
    image: null
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (billingRecord) {
      setFormData(prev => ({
        ...prev,
        accountNo: billingRecord.applicationId || '',
        fullName: billingRecord.customerName || '',
        contactNo: billingRecord.contactNumber || '',
        plan: billingRecord.plan || 'SwitchLite - P699',
        accountBalance: billingRecord.accountBalance?.toString() || '0.00'
      }));
    }
  }, [billingRecord]);

  const handleInputChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleReceivedPaymentChange = (operation: 'increase' | 'decrease') => {
    const currentValue = parseFloat(formData.receivedPayment) || 0;
    const increment = 0.01;
    let newValue: number;

    if (operation === 'increase') {
      newValue = currentValue + increment;
    } else {
      newValue = Math.max(0, currentValue - increment);
    }

    setFormData(prev => ({
      ...prev,
      receivedPayment: newValue.toFixed(2)
    }));
  };

  const handleTransactionTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, transactionType: type }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.provider.trim()) newErrors.provider = 'Provider is required';
    if (!formData.accountNo.trim()) newErrors.accountNo = 'Account No. is required';
    if (!formData.plan.trim()) newErrors.plan = 'Plan is required';
    if (!formData.accountBalance.trim()) newErrors.accountBalance = 'Account Balance is required';
    if (!formData.paymentDate.trim()) newErrors.paymentDate = 'Payment Date is required';
    if (!formData.receivedPayment.trim()) newErrors.receivedPayment = 'Received Payment is required';
    if (!formData.processedBy.trim()) newErrors.processedBy = 'Processed By is required';
    if (!formData.paymentMethod.trim()) newErrors.paymentMethod = 'Payment Method is required';
    if (!formData.referenceNo.trim()) newErrors.referenceNo = 'Reference No. is required';
    if (!formData.orNo.trim()) newErrors.orNo = 'OR No. is required';
    if (!formData.transactionType.trim()) newErrors.transactionType = 'Transaction Type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('Transaction save button clicked!', formData);
    
    const isValid = validateForm();
    console.log('Transaction form validation result:', isValid);
    
    if (!isValid) {
      console.log('Transaction form validation failed. Errors:', errors);
      alert('Please fill in all required fields before saving.');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating transaction with data:', formData);
      
      // TODO: Call transaction API here
      
      alert('Transaction saved successfully!');
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(`Failed to save transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <h2 className="text-xl font-semibold text-white">Transactions Form</h2>
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
                <option value="SWITCH">SWITCH</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
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
                <option value={billingRecord?.applicationId || ''}>{billingRecord?.applicationId || ''} | {billingRecord?.customerName || ''} | {billingRecord?.address || ''}</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            {errors.accountNo && <p className="text-red-500 text-xs mt-1">{errors.accountNo}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Contact No */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ContactNo
            </label>
            <input
              type="text"
              value={formData.contactNo}
              onChange={(e) => handleInputChange('contactNo', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plan<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.plan}
                onChange={(e) => handleInputChange('plan', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.plan ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
              >
                <option value="SwitchLite - P699">SwitchLite - P699</option>
                <option value="SwitchConnect - P799">SwitchConnect - P799</option>
                <option value="SwitchConnect - P999">SwitchConnect - P999</option>
                <option value="SwitchConnect - P1299">SwitchConnect - P1299</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            {errors.plan && <p className="text-red-500 text-xs mt-1">{errors.plan}</p>}
          </div>

          {/* Account Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Account Balance<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={`₱ ${formData.accountBalance}`}
              onChange={(e) => handleInputChange('accountBalance', e.target.value.replace('₱ ', ''))}
              className={`w-full px-3 py-2 bg-gray-800 border ${errors.accountBalance ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
            />
            {errors.accountBalance && <p className="text-red-500 text-xs mt-1">{errors.accountBalance}</p>}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Date<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.paymentDate ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
              />
              <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
          </div>

          {/* Received Payment */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Received Payment<span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={`₱ ${formData.receivedPayment}`}
                  onChange={(e) => handleInputChange('receivedPayment', e.target.value.replace('₱ ', ''))}
                  className={`w-full px-3 py-2 bg-gray-800 border ${errors.receivedPayment ? 'border-red-500' : 'border-gray-700'} rounded-l text-white focus:outline-none focus:border-orange-500`}
                />
              </div>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => handleReceivedPaymentChange('increase')}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white border border-gray-700 border-l-0 text-sm"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleReceivedPaymentChange('decrease')}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white border border-gray-700 border-l-0 border-t-0 rounded-r text-sm"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>
            {errors.receivedPayment && <p className="text-red-500 text-xs mt-1">{errors.receivedPayment}</p>}
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
                <option value="">Select Processor</option>
                <option value="admin@ampere.com">admin@ampere.com</option>
                <option value="billing@ampere.com">billing@ampere.com</option>
                <option value="finance@ampere.com">finance@ampere.com</option>
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
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="PayMaya">PayMaya</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
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
              className={`w-full px-3 py-2 bg-gray-800 border ${errors.referenceNo ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
            />
            {errors.referenceNo && <p className="text-red-500 text-xs mt-1">{errors.referenceNo}</p>}
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
              className={`w-full px-3 py-2 bg-gray-800 border ${errors.orNo ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`}
            />
            {errors.orNo && <p className="text-red-500 text-xs mt-1">{errors.orNo}</p>}
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
                  onClick={() => handleTransactionTypeChange(type)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    formData.transactionType === type
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.transactionType && <p className="text-red-500 text-xs mt-1">{errors.transactionType}</p>}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8">
              <div className="text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-300">
                      Click to upload image
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                {formData.image && (
                  <p className="mt-2 text-xs text-gray-400">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFormModal;