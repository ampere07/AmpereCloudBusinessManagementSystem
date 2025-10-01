import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface NapItem {
  id: number;
  name: string;
  modified_by?: string;
  modified_date?: string;
  created_at?: string;
  updated_at?: string;
}

const NapList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [napItems, setNapItems] = useState<NapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingItem, setEditingItem] = useState<NapItem | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // Add/Edit form states
  const [formData, setFormData] = useState({
    name: '',
    modified_by: 'ravenampere0123@gmail.com',
    modified_date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' am'
  });
  
  // Loading states for individual operations
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [savingForm, setSavingForm] = useState(false);
  const [panelAnimating, setPanelAnimating] = useState(false);

  // Base API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    loadNapItems();
  }, [currentPage, searchQuery]);
  
  useEffect(() => {
    if (showAddPanel) {
      setTimeout(() => setPanelAnimating(true), 10);
    }
  }, [showAddPanel]);

  const loadNapItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`${API_BASE_URL}/nap?${params}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNapItems(data.data || []);
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalItems(data.pagination?.total_items || 0);
      } else {
        console.error('API returned error:', data.message);
        setNapItems([]);
      }
    } catch (error) {
      console.error('Error loading NAP items:', error);
      setNapItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: NapItem) => {
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to permanently delete NAP "${item.name}"?\n\nThis will PERMANENTLY REMOVE the item from the database and CANNOT BE UNDONE!\n\nClick OK to permanently delete, or Cancel to keep the item.`)) {
      return;
    }

    setDeletingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(item.id);
      return newSet;
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/nap/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        await loadNapItems();
        alert('✅ NAP item permanently deleted from database: ' + (data.message || 'Item deleted successfully'));
      } else {
        alert('❌ Failed to delete NAP item: ' + (data.message || 'Failed to delete item'));
      }
    } catch (error) {
      console.error('Error deleting NAP item:', error);
      alert('Failed to delete NAP item: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

  const handleEdit = (item: NapItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      modified_by: 'ravenampere0123@gmail.com',
      modified_date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' am'
    });
    setShowAddPanel(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('NAP Name is required');
      return;
    }
    
    setSavingForm(true);
    
    try {
      const dataToSend = {
        name: formData.name.trim(),
        modified_by: formData.modified_by,
        modified_date: formData.modified_date
      };

      const url = editingItem 
        ? `${API_BASE_URL}/nap/${editingItem.id}`
        : `${API_BASE_URL}/nap`;
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        await loadNapItems();
        closePanel();
        resetForm();
        alert(data.message || `NAP item ${editingItem ? 'updated' : 'added'} successfully`);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          alert('Validation errors:\n' + errorMessages);
        } else {
          alert(data.message || `Failed to ${editingItem ? 'update' : 'add'} NAP item`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to ${editingItem ? 'update' : 'add'} NAP item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingForm(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      modified_by: 'ravenampere0123@gmail.com',
      modified_date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' am'
    });
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

  const renderTableRow = (item: NapItem) => {
    return (
      <tr key={item.id} className="bg-gray-900 border-b border-gray-800">
        <td className="px-6 py-4 text-white font-medium">{item.name}</td>
        <td className="px-6 py-4 text-gray-400 text-sm">{item.modified_by || 'System'}</td>
        <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(item.modified_date)}</td>
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
            <h1 className="text-xl font-semibold text-white">NAP</h1>
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
              placeholder="Search NAP"
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
        ) : napItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-medium">NAP Name</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Modified By</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Modified Date</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {napItems.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No NAP items found
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
                NAP Form
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
                {/* NAP Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    NAP Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-red-600 focus:border-red-500 focus:outline-none"
                    placeholder="Enter NAP name"
                  />
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

export default NapList;