import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import EditNapModal from '../modals/EditNapModal';
import {
  getAllNaps,
  createNap,
  updateNap,
  deleteNap,
  NapItem
} from '../services/napService';

interface NapFormData {
  name: string;
}

const NapList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [napItems, setNapItems] = useState<NapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NapItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadNapItems();
  }, []);

  const loadNapItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllNaps();
      setNapItems(data);
    } catch (error) {
      console.error('Error loading NAP items:', error);
      setError('Failed to load NAP items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (item: NapItem, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to permanently delete "${item.nap_name}"?\n\nThis action CANNOT BE UNDONE!\n\nClick OK to permanently delete, or Cancel to keep the item.`)) {
      return;
    }

    setDeletingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(item.id);
      return newSet;
    });
    
    try {
      await deleteNap(item.id);
      await loadNapItems();
    } catch (error: any) {
      console.error('Error deleting NAP:', error);
      alert('❌ Failed to delete NAP: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleEdit = (item: NapItem, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: NapFormData) => {
    try {
      if (editingItem) {
        await updateNap(editingItem.id, { name: formData.name.trim() });
      } else {
        await createNap({ name: formData.name.trim() });
      }
      await loadNapItems();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      throw new Error(errorMessage);
    }
  };

  const filteredNapItems = napItems.filter(item => {
    if (!searchQuery) return true;
    return item.nap_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="bg-gray-900 overflow-hidden flex-1">
        <div className="flex flex-col h-full">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search NAP"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={handleAddNew}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-1/3 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
                  </div>
                  <p className="mt-4">Loading NAP items...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-12 text-center text-red-400">
                  <p>{error}</p>
                  <button 
                    onClick={() => loadNapItems()}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                    Retry
                  </button>
                </div>
              ) : filteredNapItems.length > 0 ? (
                <div className="space-y-0">
                  {filteredNapItems.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm mb-1 uppercase">
                            {item.nap_name}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                          <button
                            onClick={(e) => handleEdit(item, e)}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                            title="Edit NAP"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(item, e)}
                            disabled={deletingItems.has(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={deletingItems.has(item.id) ? 'Deleting...' : 'Delete NAP'}
                          >
                            {deletingItems.has(item.id) ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No NAP items found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditNapModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        napItem={editingItem}
      />
    </div>
  );
};

export default NapList;
