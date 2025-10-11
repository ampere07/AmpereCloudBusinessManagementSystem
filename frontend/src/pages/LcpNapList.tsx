import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, Eye } from 'lucide-react';
import apiClient from '../config/api';

interface LcpNapItem {
  id: number;
  lcpnap: string;
  lcp: string;
  nap: string;
  port_total: number;
  image?: string;
  modified_by?: string;
  modified_date?: string;
  image2?: string;
  reading_image?: string;
  street?: string;
  barangay?: string;
  city?: string;
  region?: string;
  related_billing_details?: string;
  created_at?: string;
  updated_at?: string;
}

const LcpNapList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lcpNapItems, setLcpNapItems] = useState<LcpNapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingItem, setEditingItem] = useState<LcpNapItem | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Add/Edit form states
  const [formData, setFormData] = useState({
    lcpnap: '',
    lcp_id: '',
    nap_id: '',
    port_total: 8,
    image: null as File | null,
    image2: null as File | null,
    reading_image: null as File | null,
    street: '',
    barangay: '',
    city: '',
    region: '',
    coordinates: '',
    related_billing_details: '',
    modified_by: 'ravenampere0123@gmail.com',
    modified_date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' pm'
  });
  
  // Location data states
  const [regions, setRegions] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);
  const [lcpList, setLcpList] = useState<any[]>([]);
  const [napList, setNapList] = useState<any[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  // Loading states for individual operations
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [savingForm, setSavingForm] = useState(false);
  const [panelAnimating, setPanelAnimating] = useState(false);

  // No need for API_BASE_URL - using apiClient which already has baseURL configured

  useEffect(() => {
    loadLcpNapItems();
    loadRegions();
    loadLcpList();
    loadNapList();
  }, [currentPage, searchQuery]);
  
  useEffect(() => {
    if (showAddPanel) {
      setTimeout(() => setPanelAnimating(true), 10);
    }
  }, [showAddPanel]);

  // Load regions from Location API
  const loadRegions = async () => {
    try {
      const response = await apiClient.get('/locations/regions');
      const data = response.data as any;
      
      if (data.success) {
        setRegions(data.data || []);
      } else {
        console.error('Failed to load regions:', data.message);
        setRegions([]);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
      setRegions([]);
    }
  };

  // Load LCP list from app_lcp table
  const loadLcpList = async () => {
    try {
      const response = await apiClient.get('/lcp');
      const data = response.data as any;
      
      if (data.success) {
        setLcpList(data.data || []);
      } else {
        console.error('Failed to load LCP list:', data.message);
        setLcpList([]);
      }
    } catch (error) {
      console.error('Error loading LCP list:', error);
      setLcpList([]);
    }
  };

  // Load NAP list from app_nap table
  const loadNapList = async () => {
    try {
      const response = await apiClient.get('/nap');
      const data = response.data as any;
      
      if (data.success) {
        setNapList(data.data || []);
      } else {
        console.error('Failed to load NAP list:', data.message);
        setNapList([]);
      }
    } catch (error) {
      console.error('Error loading NAP list:', error);
      setNapList([]);
    }
  };

  // Load cities when region changes
  const loadCitiesByRegion = async (regionId: string) => {
    if (!regionId) {
      setCities([]);
      setBarangays([]);
      return;
    }

    setIsLoadingLocations(true);
    try {
      const response = await apiClient.get(`/locations/regions/${regionId}/cities`);
      const data = response.data as any;
      
      if (data.success) {
        setCities(data.data || []);
      } else {
        console.error('Failed to load cities:', data.message);
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Load barangays when city changes
  const loadBarangaysByCity = async (cityId: string) => {
    if (!cityId) {
      setBarangays([]);
      return;
    }

    setIsLoadingLocations(true);
    try {
      const response = await apiClient.get(`/locations/cities/${cityId}/barangays`);
      const data = response.data as any;
      
      if (data.success) {
        setBarangays(data.data || []);
      } else {
        console.error('Failed to load barangays:', data.message);
        setBarangays([]);
      }
    } catch (error) {
      console.error('Error loading barangays:', error);
      setBarangays([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Handle region change
  const handleRegionChange = (regionId: string) => {
    setFormData({
      ...formData,
      region: regionId,
      city: '',
      barangay: ''
    });
    setCities([]);
    setBarangays([]);
    
    if (regionId) {
      loadCitiesByRegion(regionId);
    }
  };

  // Handle city change
  const handleCityChange = (cityId: string) => {
    setFormData({
      ...formData,
      city: cityId,
      barangay: ''
    });
    setBarangays([]);
    
    if (cityId) {
      loadBarangaysByCity(cityId);
    }
  };

  // Handle barangay change
  const handleBarangayChange = (barangayId: string) => {
    setFormData({
      ...formData,
      barangay: barangayId
    });
  };

  const loadLcpNapItems = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery })
      };
      
      const response = await apiClient.get('/lcp-nap-list', { params });
      const data = response.data as any;
      
      if (data.success) {
        setLcpNapItems(data.data || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalItems(data.pagination?.total_items || 0);
      } else {
        console.error('API returned error:', data.message);
        setLcpNapItems([]);
      }
    } catch (error) {
      console.error('Error loading LCP NAP items:', error);
      setLcpNapItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: LcpNapItem) => {
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to permanently delete LCP NAP "${item.lcpnap}"?\n\nThis will PERMANENTLY REMOVE the item from the database and CANNOT BE UNDONE!\n\nClick OK to permanently delete, or Cancel to keep the item.`)) {
      return;
    }

    setDeletingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(item.id);
      return newSet;
    });
    
    try {
      const response = await apiClient.delete(`/lcp-nap-list/${item.id}`);
      const data = response.data as any;
      
      if (data.success) {
        await loadLcpNapItems();
        alert('✅ LCP NAP item permanently deleted from database: ' + (data.message || 'Item deleted successfully'));
      } else {
        alert('❌ Failed to delete LCP NAP item: ' + (data.message || 'Failed to delete item'));
      }
    } catch (error) {
      console.error('Error deleting LCP NAP item:', error);
      alert('Failed to delete LCP NAP item: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const closePanel = () => {
    setPanelAnimating(false);
    setTimeout(() => {
      setShowAddPanel(false);
      setEditingItem(null);
    }, 300);
  };

  const handleEdit = (item: LcpNapItem) => {
    setEditingItem(item);
    setFormData({
      lcpnap: item.lcpnap,
      lcp_id: (item as any).lcp_id?.toString() || '',
      nap_id: (item as any).nap_id?.toString() || '',
      port_total: item.port_total,
      image: null,
      image2: null,
      reading_image: null,
      street: item.street || '',
      barangay: item.barangay || '',
      city: item.city || '',
      region: item.region || '',
      coordinates: '',
      related_billing_details: item.related_billing_details || '',
      modified_by: 'ravenampere0123@gmail.com',
      modified_date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' pm'
    });
    setShowAddPanel(true);
  };

  const handleSubmit = async () => {
    if (!formData.lcpnap.trim()) {
      alert('LCP NAP is required');
      return;
    }
    
    if (!formData.lcp_id) {
      alert('LCP is required');
      return;
    }
    
    if (!formData.nap_id) {
      alert('NAP is required');
      return;
    }
    
    setSavingForm(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('lcpnap', formData.lcpnap.trim());
      formDataToSend.append('lcp_id', formData.lcp_id.toString());
      formDataToSend.append('nap_id', formData.nap_id.toString());
      formDataToSend.append('port_total', formData.port_total.toString());
      formDataToSend.append('street', formData.street.trim());
      formDataToSend.append('barangay', formData.barangay.trim());
      formDataToSend.append('city', formData.city.trim());
      formDataToSend.append('region', formData.region.trim());
      formDataToSend.append('coordinates', formData.coordinates.trim());
      formDataToSend.append('related_billing_details', formData.related_billing_details.trim());

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (formData.image2) {
        formDataToSend.append('image2', formData.image2);
      }
      if (formData.reading_image) {
        formDataToSend.append('reading_image', formData.reading_image);
      }

      let response;
      if (editingItem) {
        response = await apiClient.put(`/lcp-nap-list/${editingItem.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await apiClient.post('/lcp-nap-list', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const data = response.data as any;
      
      if (data.success) {
        await loadLcpNapItems();
        closePanel();
        resetForm();
        alert(data.message || `LCP NAP item ${editingItem ? 'updated' : 'added'} successfully`);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          alert('Validation errors:\n' + errorMessages);
        } else {
          alert(data.message || `Failed to ${editingItem ? 'update' : 'add'} LCP NAP item`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to ${editingItem ? 'update' : 'add'} LCP NAP item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingForm(false);
    }
  };

  const resetForm = () => {
    setFormData({
      lcpnap: '',
      lcp_id: '',
      nap_id: '',
      port_total: 8,
      image: null,
      image2: null,
      reading_image: null,
      street: '',
      barangay: '',
      city: '',
      region: '',
      coordinates: '',
      related_billing_details: '',
      modified_by: 'ravenampere0123@gmail.com',
      modified_date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' pm'
    });
    
    // Reset location dropdowns
    setCities([]);
    setBarangays([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        [fieldName]: files[0]
      }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded ${
            i === currentPage 
              ? 'bg-red-600 text-white' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderTableRow = (item: LcpNapItem) => {
    return (
      <tr key={item.id} className="bg-gray-900 border-b border-gray-800">
        <td className="px-6 py-4 text-white font-medium">{item.lcpnap}</td>
        <td className="px-6 py-4 text-gray-300">{item.lcp}</td>
        <td className="px-6 py-4 text-gray-300">{item.nap}</td>
        <td className="px-6 py-4 text-gray-300">{item.port_total}</td>
        <td className="px-6 py-4">
          {item.image ? (
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-green-400" />
              <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">No image</span>
          )}
        </td>
        <td className="px-6 py-4 text-gray-400 text-sm">{item.modified_by || 'System'}</td>
        <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(item.modified_date)}</td>
        <td className="px-6 py-4">
          {item.image2 ? (
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-green-400" />
              <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">No image</span>
          )}
        </td>
        <td className="px-6 py-4">
          {item.reading_image ? (
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-400" />
              <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
            </div>
          ) : (
            <span className="text-gray-500 text-sm">No image</span>
          )}
        </td>
        <td className="px-6 py-4 text-gray-300">{item.street || 'N/A'}</td>
        <td className="px-6 py-4">
          <div className="text-gray-300 text-sm">
            <div>{item.barangay || 'N/A'}</div>
            <div className="text-gray-500">{item.city || 'N/A'}</div>
            <div className="text-gray-500">{item.region || 'N/A'}</div>
          </div>
        </td>
        <td className="px-6 py-4 text-gray-400 text-sm max-w-xs">
          <div className="truncate">{item.related_billing_details || 'N/A'}</div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(item)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(item)}
              disabled={deletingItems.has(item.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title={deletingItems.has(item.id) ? 'Deleting...' : 'Delete'}
            >
              {deletingItems.has(item.id) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-white">LCP NAP List</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingItem(null);
                  resetForm();
                  setShowAddPanel(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search LCP NAP List"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : lcpNapItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-medium">LCPNAP</th>
                  <th className="px-6 py-4 text-left text-white font-medium">LCP</th>
                  <th className="px-6 py-4 text-left text-white font-medium">NAP</th>
                  <th className="px-6 py-4 text-left text-white font-medium">PORT TOTAL</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Image</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Modified By</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Modified Date</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Image 2</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Reading Image</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Street</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Location</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Related Billing Details</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lcpNapItems.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No LCP NAP items found
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </div>

      {/* Add/Edit Slide Panel */}
      {showAddPanel && (
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
              panelAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={closePanel}
          />
          
          {/* Slide Panel */}
          <div className={`fixed right-0 top-0 h-full w-[600px] bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-out ${
            panelAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <button onClick={closePanel} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                LCP NAP Location Form
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={closePanel}
                  className="px-6 py-2 text-red-400 hover:text-red-300 rounded-lg border border-red-600 hover:border-red-500"
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

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Reading Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reading Image<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'reading_image')}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.reading_image ? (
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-green-400">{formData.reading_image.name}</p>
                      </div>
                    ) : (
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Street
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    placeholder="Enter street"
                  />
                </div>

                {/* Barangay */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Barangay
                  </label>
                  <select
                    value={formData.barangay}
                    onChange={(e) => handleBarangayChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none appearance-none"
                    disabled={!formData.city || isLoadingLocations}
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map(barangay => (
                      <option key={barangay.id} value={barangay.id.toString()}>{barangay.name}</option>
                    ))}
                  </select>
                  {!formData.city && (
                    <p className="text-sm text-gray-500 mt-1">Please select a city first.</p>
                  )}
                  {formData.city && barangays.length === 0 && !isLoadingLocations && (
                    <p className="text-sm text-gray-500 mt-1">No barangays available for selected city.</p>
                  )}
                  {isLoadingLocations && (
                    <p className="text-sm text-gray-400 mt-1">Loading...</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none appearance-none"
                    disabled={!formData.region || isLoadingLocations}
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id.toString()}>{city.name}</option>
                    ))}
                  </select>
                  {!formData.region && (
                    <p className="text-sm text-gray-500 mt-1">Please select a region first.</p>
                  )}
                  {formData.region && cities.length === 0 && !isLoadingLocations && (
                    <p className="text-sm text-gray-500 mt-1">No cities available for selected region.</p>
                  )}
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none appearance-none"
                    disabled={isLoadingLocations}
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id.toString()}>{region.name}</option>
                    ))}
                  </select>
                  {regions.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No regions available. Please add regions in Location List.</p>
                  )}
                </div>

                {/* LCP */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LCP<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.lcp_id}
                    onChange={(e) => setFormData({ ...formData, lcp_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none appearance-none"
                  >
                    <option value="">Select LCP</option>
                    {lcpList.map(lcp => (
                      <option key={lcp.id} value={lcp.id.toString()}>
                        {lcp.lcp_name}
                      </option>
                    ))}
                  </select>
                  {lcpList.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No LCP entries available. Please add LCP entries in the LCP management section.</p>
                  )}
                </div>

                {/* NAP */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    NAP<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={formData.nap_id}
                    onChange={(e) => setFormData({ ...formData, nap_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none appearance-none"
                  >
                    <option value="">Select NAP</option>
                    {napList.map(nap => (
                      <option key={nap.id} value={nap.id.toString()}>
                        {nap.nap_name}
                      </option>
                    ))}
                  </select>
                  {napList.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No NAP entries available. Please add NAP entries in the NAP management section.</p>
                  )}
                </div>

                {/* Port Total */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PORT TOTAL<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, port_total: 8 })}
                      className={`flex-1 px-6 py-4 rounded-lg border text-center font-medium ${
                        formData.port_total === 8
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      8
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, port_total: 16 })}
                      className={`flex-1 px-6 py-4 rounded-lg border text-center font-medium ${
                        formData.port_total === 16
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      16
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, port_total: 32 })}
                      className={`flex-1 px-6 py-4 rounded-lg border text-center font-medium ${
                        formData.port_total === 32
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      32
                    </button>
                  </div>
                </div>

                {/* LCPNAP */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    LCPNAP<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lcpnap}
                    onChange={(e) => setFormData({ ...formData, lcpnap: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    placeholder="Enter LCPNAP"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Coordinates<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.coordinates}
                      onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder="Enter coordinates"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'image')}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.image ? (
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-green-400">{formData.image.name}</p>
                      </div>
                    ) : (
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Image 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image 2<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'image2')}
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.image2 ? (
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-green-400">{formData.image2.name}</p>
                      </div>
                    ) : (
                      <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Modified By */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modified By
                  </label>
                  <div className="px-4 py-3 bg-gray-800 text-gray-400 rounded-lg border border-gray-700">
                    {formData.modified_by}
                  </div>
                </div>

                {/* Modified Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modified Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.modified_date}
                      readOnly
                      className="w-full px-4 py-3 pr-12 bg-gray-800 text-gray-400 rounded-lg border border-gray-700"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LcpNapList;
