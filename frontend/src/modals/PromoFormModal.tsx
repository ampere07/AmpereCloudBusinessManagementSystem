import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Promo {
  id: number;
  name: string;
  status?: string;
}

interface PromoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingPromo: Promo | null;
}

const PromoFormModal: React.FC<PromoFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPromo
}) => {
  const [formData, setFormData] = useState({
    name: '',
    status: ''
  });
  const [savingForm, setSavingForm] = useState(false);
  const [panelAnimating, setPanelAnimating] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend.atssfiber.ph/api';

  useEffect(() => {
    if (isOpen) {
      if (editingPromo) {
        setFormData({
          name: editingPromo.name,
          status: editingPromo.status || ''
        });
      } else {
        resetForm();
      }
      setTimeout(() => setPanelAnimating(true), 10);
    } else {
      setPanelAnimating(false);
    }
  }, [isOpen, editingPromo]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Promo name is required');
      return;
    }
    
    setSavingForm(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        status: formData.status.trim()
      };

      const url = editingPromo 
        ? `${API_BASE_URL}/promos/${editingPromo.id}`
        : `${API_BASE_URL}/promos`;
      
      const method = editingPromo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(data.message || `Promo ${editingPromo ? 'updated' : 'added'} successfully`);
        onSave();
        handleClose();
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          alert('Validation errors:\n' + errorMessages);
        } else {
          alert(data.message || `Failed to ${editingPromo ? 'update' : 'add'} promo`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to ${editingPromo ? 'update' : 'add'} promo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingForm(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      status: ''
    });
  };

  const handleClose = () => {
    setPanelAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
          panelAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      <div className={`fixed right-0 top-0 h-full w-[500px] bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-out ${
        panelAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            Promo List Form
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={savingForm}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingForm && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Promo Name<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                placeholder="Enter promo name"
              />
            </div>

            <div className="animate-fade-in [animation-delay:100ms]">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="animate-fade-in [animation-delay:200ms]">
              <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> Created and updated timestamps will be set automatically when the promo is created or updated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromoFormModal;
