import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, Eye } from 'lucide-react';
import AddLcpNapModal from '../modals/AddLcpNapModal';

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
  lcp_id?: number;
  nap_id?: number;
}

const LcpNapList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lcpNapItems, setLcpNapItems] = useState<LcpNapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LcpNapItem | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    loadLcpNapItems();
  }, [currentPage, searchQuery]);

  const loadLcpNapItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`${API_BASE_URL}/lcp-nap-list?${params}`, {
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
      const response = await fetch(`${API_BASE_URL}/lcp-nap-list/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
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

  const handleEdit = (item: LcpNapItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSave = () => {
    loadLcpNapItems();
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
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-white">LCP NAP List</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddNew}
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
        
        {totalPages > 1 && renderPagination()}
      </div>

      <AddLcpNapModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        editingItem={editingItem}
      />
    </div>
  );
};

export default LcpNapList;
