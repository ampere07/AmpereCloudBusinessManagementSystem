import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin } from 'lucide-react';

interface AddLcpNapLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: LocationFormData) => void;
}

interface LocationFormData {
  reading_image: File | null;
  street: string;
  barangay: string;
  city: string;
  region: string;
  lcp_id: string;
  nap_id: string;
  port_total: number;
  lcpnap: string;
  coordinates: string;
  image: File | null;
  image2: File | null;
  modified_by: string;
  modified_date: string;
  user_email: string;
}

const AddLcpNapLocationModal: React.FC<AddLcpNapLocationModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<LocationFormData>({
    reading_image: null,
    street: '',
    barangay: '',
    city: '',
    region: '',
    lcp_id: '',
    nap_id: '',
    port_total: 8,
    lcpnap: '',
    coordinates: '',
    image: null,
    image2: null,
    modified_by: 'ravenampere0123@gmail.com',
    modified_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    user_email: 'ravenampere0123@gmail.com'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [lcpList, setLcpList] = useState<any[]>([]);
  const [napList, setNapList] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  const loadDropdownData = async () => {
    try {
      const [lcpResponse, napResponse, regionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/lcp`),
        fetch(`${API_BASE_URL}/nap`),
        fetch(`${API_BASE_URL}/locations/regions`)
      ]);

      const lcpData = await lcpResponse.json();
      const napData = await napResponse.json();
      const regionsData = await regionsResponse.json();

      if (lcpData.success) setLcpList(lcpData.data || []);
      if (napData.success) setNapList(napData.data || []);
      if (regionsData.success) setRegions(regionsData.data || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const loadCities = async (regionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/regions/${regionId}/cities`);
      const data = await response.json();
      if (data.success) setCities(data.data || []);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadBarangays = async (cityId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/locations/cities/${cityId}/barangays`);
      const data = await response.json();
      if (data.success) setBarangays(data.data || []);
    } catch (error) {
      console.error('Error loading barangays:', error);
    }
  };

  const handleRegionChange = (value: string) => {
    setFormData({ ...formData, region: value, city: '', barangay: '' });
    setCities([]);
    setBarangays([]);
    if (value) loadCities(value);
  };

  const handleCityChange = (value: string) => {
    setFormData({ ...formData, city: value, barangay: '' });
    setBarangays([]);
    if (value) loadBarangays(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof LocationFormData) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reading_image) newErrors.reading_image = 'Reading image is required';
    if (!formData.lcp_id) newErrors.lcp_id = 'LCP is required';
    if (!formData.nap_id) newErrors.nap_id = 'NAP is required';
    if (!formData.lcpnap.trim()) newErrors.lcpnap = 'LCPNAP is required';
    if (!formData.coordinates.trim()) newErrors.coordinates = 'Coordinates are required';
    if (!formData.image) newErrors.image = 'Image is required';
    if (!formData.image2) newErrors.image2 = 'Image 2 is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = new FormData();
      
      if (formData.reading_image) submitData.append('reading_image', formData.reading_image);
      if (formData.image) submitData.append('image', formData.image);
      if (formData.image2) submitData.append('image2', formData.image2);
      
      submitData.append('street', formData.street);
      submitData.append('barangay', formData.barangay);
      submitData.append('city', formData.city);
      submitData.append('region', formData.region);
      submitData.append('lcp_id', formData.lcp_id);
      submitData.append('nap_id', formData.nap_id);
      submitData.append('port_total', formData.port_total.toString());
      submitData.append('lcpnap', formData.lcpnap);
      submitData.append('coordinates', formData.coordinates);
      submitData.append('modified_by', formData.modified_by);
      submitData.append('modified_date', formData.modified_date);

      onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save location');
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
      reading_image: null,
      street: '',
      barangay: '',
      city: '',
      region: '',
      lcp_id: '',
      nap_id: '',
      port_total: 8,
      lcpnap: '',
      coordinates: '',
      image: null,
      image2: null,
      modified_by: 'ravenampere0123@gmail.com',
      modified_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      user_email: 'ravenampere0123@gmail.com'
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={handleClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-[600px] bg-gray-900 shadow-2xl z-[9999] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-800">
          <h2 className="text-xl font-semibold text-white">LCP NAP Location Form</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-orange-400 hover:text-orange-300 border border-orange-600 hover:border-orange-500 rounded bg-transparent"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Reading Image<span className="text-red-500">*</span>
              </label>
              <div className="relative w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-gray-500">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'reading_image')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.reading_image ? (
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto text-green-400 mb-2" />
                    <p className="text-sm text-green-400">{formData.reading_image.name}</p>
                  </div>
                ) : (
                  <Camera className="w-12 h-12 text-gray-500" />
                )}
              </div>
              {errors.reading_image && <p className="text-red-500 text-xs mt-1">{errors.reading_image}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Street</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Barangay</label>
              <select
                value={formData.barangay}
                onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
                disabled={!formData.city}
              >
                <option value="">All</option>
                {barangays.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">City</label>
              <select
                value={formData.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
                disabled={!formData.region}
              >
                <option value="">All</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
                placeholder="Rizal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                LCP<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.lcp_id}
                onChange={(e) => setFormData({ ...formData, lcp_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                <option value=""></option>
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
                onChange={(e) => setFormData({ ...formData, nap_id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                <option value=""></option>
                {napList.map(nap => (
                  <option key={nap.id} value={nap.id}>{nap.nap_name}</option>
                ))}
              </select>
              {errors.nap_id && <p className="text-red-500 text-xs mt-1">{errors.nap_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                PORT TOTAL<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[8, 16, 32].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, port_total: value })}
                    className={`flex-1 px-6 py-3 rounded border text-center font-medium ${
                      formData.port_total === value
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                LCPNAP<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lcpnap}
                onChange={(e) => setFormData({ ...formData, lcpnap: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
              {errors.lcpnap && <p className="text-red-500 text-xs mt-1">{errors.lcpnap}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Coordinates<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.coordinates}
                  onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                  className="w-full px-3 py-2 pr-10 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
                />
                <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
              </div>
              {errors.coordinates && <p className="text-red-500 text-xs mt-1">{errors.coordinates}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Image<span className="text-red-500">*</span>
              </label>
              <div className="relative w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-gray-500">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.image ? (
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto text-green-400 mb-2" />
                    <p className="text-sm text-green-400">{formData.image.name}</p>
                  </div>
                ) : (
                  <Camera className="w-12 h-12 text-gray-500" />
                )}
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Image 2<span className="text-red-500">*</span>
              </label>
              <div className="relative w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-gray-500">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image2')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.image2 ? (
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto text-green-400 mb-2" />
                    <p className="text-sm text-green-400">{formData.image2.name}</p>
                  </div>
                ) : (
                  <Camera className="w-12 h-12 text-gray-500" />
                )}
              </div>
              {errors.image2 && <p className="text-red-500 text-xs mt-1">{errors.image2}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Modified By</label>
              <div className="px-3 py-2 bg-gray-800 text-gray-400 rounded border border-gray-700">
                {formData.modified_by}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Modified Date</label>
              <div className="px-3 py-2 bg-gray-800 text-gray-400 rounded border border-gray-700">
                {formData.modified_date}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">User Email</label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddLcpNapLocationModal;
