import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { getAllPorts, deletePort, Port } from '../services/portService';
import AddPortModal from '../modals/AddPortModal';

const Ports: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPorts();
  }, [currentPage, searchQuery]);

  const fetchPorts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllPorts(searchQuery, currentPage, 10);
      
      if (response.success) {
        setPorts(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.total_pages);
        }
      } else {
        setError(response.message || 'Failed to fetch ports');
      }
    } catch (error) {
      console.error('Error fetching ports:', error);
      setError('Failed to fetch ports');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingPort(null);
    setShowAddModal(true);
  };

  const handleEditClick = (port: Port) => {
    setEditingPort(port);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingPort(null);
  };

  const handleSaveModal = async () => {
    await fetchPorts();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this port?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await deletePort(id);
      if (response.success) {
        await fetchPorts();
      } else {
        alert('Failed to delete port: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting port:', error);
      alert('Failed to delete port');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading && ports.length === 0) {
    return (
      <div className="bg-gray-950 h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-500 mb-4 mx-auto" />
          <div className="text-white text-lg">Loading ports...</div>
        </div>
      </div>
    );
  }

  if (error && ports.length === 0) {
    return (
      <div className="bg-gray-950 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Error Loading Ports</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button 
            onClick={fetchPorts}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 h-full flex flex-col">
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Ports</h1>
        </div>
      </div>

      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search Ports"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button 
            onClick={handleAddClick}
            className="bg-orange-600 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 hover:bg-orange-700 transition-colors ml-4"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {ports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-medium">PORT ID</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Label</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Created At</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Updated At</th>
                  <th className="px-6 py-4 text-left text-white font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((port) => (
                  <tr key={port.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{port.PORT_ID}</td>
                    <td className="px-6 py-4 text-gray-300">{port.Label}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDateTime(port.created_at)}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDateTime(port.updated_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(port)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(port.id)}
                          disabled={deletingId === port.id}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Delete"
                        >
                          {deletingId === port.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <div className="text-lg mb-2">No ports found</div>
            <div className="text-sm">
              {searchQuery 
                ? 'Try adjusting your search filter' 
                : 'Start by adding some ports'
              }
            </div>
          </div>
        )}
      </div>

      <AddPortModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        editingPort={editingPort}
      />
    </div>
  );
};

export default Ports;
