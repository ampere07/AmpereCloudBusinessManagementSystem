import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddLcpNapLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

interface LCP {
  id: number;
  lcp_name: string;
}

interface NAP {
  id: number;
  nap_name: string;
}

const AddLcpNapLocationModal: React.FC<AddLcpNapLocationModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    lcpnap_name: '',
    lcp_id: '',
    nap_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [lcpList, setLcpList] = useState<LCP[]>([]);
  const [napList, setNapList] = useState<NAP[]>([]);

  const API_BASE_URL = 'https://backend.atssfiber.ph/api';

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      resetForm();
    }
  }, [isOpen]);

  const loadDropdownData = async () => {
    try {
      const [lcpResponse, napResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/lcp`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/nap`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
      ]);

      const lcpData = await lcpResponse.json();
      const napData = await napResponse.json();

      if (lcpData.success) {
        setLcpList(lcpData.data || []);
      }
      if (napData.success) {
        setNapList(napData.data || []);
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.lcpnap_name.trim()) {
      newErrors.lcpnap_name = 'LCP/NAP name is required';
    }
    if (!formData.lcp_id) {
      newErrors.lcp_id = 'LCP is required';
    }
    if (!formData.nap_id) {
      newErrors.nap_id = 'NAP is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lcp-nap-locations`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lcpnap_name: formData.lcpnap_name,
          lcp_id: parseInt(formData.lcp_id),
          nap_id: parseInt(formData.nap_id),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save location');
      }

      onSave();
      handleClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      lcpnap_name: '',
      lcp_id: '',
      nap_id: '',
    });
    setErrors({});
  };

  const handleLcpChange = (lcpId: string) => {
    setFormData({ ...formData, lcp_id: lcpId });
    
    if (lcpId && formData.nap_id) {
      const selectedLcp = lcpList.find(l => l.id === parseInt(lcpId));
      const selectedNap = napList.find(n => n.id === parseInt(formData.nap_id));
      
      if (selectedLcp && selectedNap) {
        const generatedName = `${selectedLcp.lcp_name} to ${selectedNap.nap_name}`;
        setFormData(prev => ({ ...prev, lcpnap_name: generatedName, lcp_id: lcpId }));
      }
    }
  };

  const handleNapChange = (napId: string) => {
    setFormData({ ...formData, nap_id: napId });
    
    if (formData.lcp_id && napId) {
      const selectedLcp = lcpList.find(l => l.id === parseInt(formData.lcp_id));
      const selectedNap = napList.find(n => n.id === parseInt(napId));
      
      if (selectedLcp && selectedNap) {
        const generatedName = `${selectedLcp.lcp_name} to ${selectedNap.nap_name}`;
        setFormData(prev => ({ ...prev, lcpnap_name: generatedName, nap_id: napId }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={handleClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-[500px] bg-gray-900 shadow-2xl z-[9999] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-800">
          <h2 className="text-xl font-semibold text-white">Add LCP/NAP Location</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                LCP<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.lcp_id}
                onChange={(e) => handleLcpChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Select LCP</option>
                {lcpList.map(lcp => (
                  <option key={lcp.id} value={lcp.id}>{lcp.lcp_name}</option>
                ))}
              </select>
              {errors.lcp_id && <p className="text-red-500 text-xs mt-1">{errors.lcp_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                NAP<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nap_id}
                onChange={(e) => handleNapChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Select NAP</option>
                {napList.map(nap => (
                  <option key={nap.id} value={nap.id}>{nap.nap_name}</option>
                ))}
              </select>
              {errors.nap_id && <p className="text-red-500 text-xs mt-1">{errors.nap_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                LCP/NAP Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lcpnap_name}
                onChange={(e) => setFormData({ ...formData, lcpnap_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
                placeholder="e.g., LCP-001 to NAP-001"
              />
              {errors.lcpnap_name && <p className="text-red-500 text-xs mt-1">{errors.lcpnap_name}</p>}
              <p className="text-xs text-gray-500 mt-1">
                This will be auto-generated when you select LCP and NAP, but you can edit it.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800 bg-gray-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-orange-400 hover:text-orange-300 border border-orange-600 hover:border-orange-500 rounded bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddLcpNapLocationModal;
