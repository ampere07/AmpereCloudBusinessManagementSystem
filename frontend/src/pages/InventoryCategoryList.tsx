import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface InventoryCategory {
  id: string;
  name: string;
  created_at?: string;
  modified_date?: string;
  modified_by?: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

const InventoryCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, we'll create some sample data since we don't have a dedicated API endpoint
      // In a real implementation, you would fetch from an API endpoint like `/api/inventory-categories`
      const sampleCategories: InventoryCategory[] = [
        {
          id: '1',
          name: 'FTTH',
          modified_date: '2024-12-16T11:22:09.000Z',
          modified_by: 'admin'
        },
        {
          id: '2', 
          name: 'OSP',
          modified_date: '2024-12-14T15:22:34.000Z',
          modified_by: 'admin'
        },
        {
          id: '3',
          name: 'SERVER',
          modified_date: '2024-12-14T15:19:57.000Z',
          modified_by: 'admin'
        },
        {
          id: '4',
          name: 'ETC.',
          modified_date: '2024-12-10T10:15:30.000Z',
          modified_by: 'admin'
        },
        {
          id: '5',
          name: 'EVENT',
          modified_date: '2023-11-29T18:41:29.000Z',
          modified_by: 'admin'
        },
        {
          id: '6',
          name: 'CABLE TIES',
          modified_date: '2024-12-14T15:19:57.000Z',
          modified_by: 'admin'
        },
        {
          id: '7',
          name: 'FOC',
          modified_date: '2024-12-14T15:22:34.000Z',
          modified_by: 'admin'
        },
        {
          id: '8',
          name: 'TAPE',
          modified_date: '2024-12-16T11:22:09.000Z',
          modified_by: 'admin'
        }
      ];
      
      setCategories(sampleCategories);
    } catch (error) {
      console.error('Error fetching inventory categories:', error);
      setError('Failed to fetch inventory categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = (category: InventoryCategory) => {
    // Implement view functionality
    console.log('View category:', category);
  };

  const handleEdit = (category: InventoryCategory) => {
    // Implement edit functionality
    console.log('Edit category:', category);
  };

  const handleDelete = (category: InventoryCategory) => {
    // Implement delete functionality
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      console.log('Delete category:', category);
      // Remove from state for now
      setCategories(prev => prev.filter(c => c.id !== category.id));
    }
  };

  const formatDateTime = (dateString: string) => {
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

  if (loading) {
    return (
      <div className="bg-gray-950 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <div className="text-white text-lg">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-950 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Error Loading Categories</div>
          <div className="text-gray-400 mb-4">{error}</div>
          <button 
            onClick={fetchCategories}
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
      {/* Header */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Inventory Category List</h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Add Section */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search Inventory Category List"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-600 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 hover:bg-orange-700 transition-colors ml-4">
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors group"
              >
                <div className="flex-1">
                  <div className="text-white font-medium text-lg">
                    {category.name}
                  </div>
                  {category.modified_date && (
                    <div className="text-gray-400 text-sm mt-1">
                      {formatDateTime(category.modified_date)}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleView(category)}
                    className="p-2 text-gray-400 hover:text-blue-400 rounded transition-colors"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-green-400 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <div className="text-lg mb-2">No categories found</div>
            <div className="text-sm">
              {categories.length === 0 
                ? 'Start by adding some inventory categories' 
                : 'Try adjusting your search filter'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryCategoryList;