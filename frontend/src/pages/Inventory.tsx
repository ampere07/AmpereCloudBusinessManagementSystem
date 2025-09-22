import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Package, X } from 'lucide-react';
import InventoryFormModal from '../modals/InventoryFormModal';
import InventoryDetails from '../components/InventoryDetails';

interface InventoryItem {
  id: string;
  itemName: string;
  itemDescription: string;
  category: string;
  quantityAlert: number;
  totalStockIn: number;
  totalStockAvailable: number;
  supplier?: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface InventoryFormData {
  itemName: string;
  itemDescription: string;
  supplier: string;
  quantityAlert: number;
  image: File | null;
  modifiedBy: string;
  modifiedDate: string;
  userEmail: string;
  category: string;
  totalStockAvailable: number;
  totalStockIn: number;
}

const Inventory: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Sample inventory data
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      itemName: '1 CORE',
      itemDescription: '1KM FIBER OPTIC CABLE',
      category: 'FOC',
      quantityAlert: 50,
      totalStockIn: 363,
      totalStockAvailable: 24,
      supplier: 'Supplier 1'
    },
    {
      id: '2',
      itemName: '1 ROLL REFLECTORIZED TAPE (BLUE)',
      itemDescription: '1 ROLL REFLECTORIZED TAPE (BLUE)',
      category: 'TAPE',
      quantityAlert: 10,
      totalStockIn: 50,
      totalStockAvailable: 0,
      supplier: 'Supplier 2'
    },
    {
      id: '3',
      itemName: '1 ROLL REFLECTORIZED TAPE (GREEN)',
      itemDescription: '1 ROLL REFLECTORIZED TAPE (GREEN)',
      category: 'TAPE',
      quantityAlert: 10,
      totalStockIn: 50,
      totalStockAvailable: 0,
      supplier: 'Supplier 2'
    },
    {
      id: '4',
      itemName: '1 ROLL REFLECTORIZED TAPE (PINK)',
      itemDescription: '1 ROLL REFLECTORIZED TAPE (PINK)',
      category: 'TAPE',
      quantityAlert: 10,
      totalStockIn: 50,
      totalStockAvailable: 0,
      supplier: 'Supplier 2'
    },
    {
      id: '5',
      itemName: '2-WAY RADIO',
      itemDescription: '2-WAY RADIO',
      category: 'EVENT',
      quantityAlert: 5,
      totalStockIn: 10,
      totalStockAvailable: 1,
      supplier: 'Supplier 3'
    },
    {
      id: '6',
      itemName: '2U RACK DRAWER',
      itemDescription: '2U RACK DRAWER',
      category: 'SERVER',
      quantityAlert: 2,
      totalStockIn: 5,
      totalStockAvailable: 0,
      supplier: 'Supplier 1'
    },
    {
      id: '7',
      itemName: '3M DOUBLE SIDED TAPE',
      itemDescription: '3M DOUBLE SIDED TAPE',
      category: 'TAPE',
      quantityAlert: 20,
      totalStockIn: 100,
      totalStockAvailable: 72,
      supplier: 'Supplier 2'
    },
    {
      id: '8',
      itemName: '8 FT A-TYPE LADDER',
      itemDescription: '8 FT A-TYPE LADDER',
      category: 'LADDER',
      quantityAlert: 2,
      totalStockIn: 3,
      totalStockAvailable: 1,
      supplier: 'Supplier 3'
    },
    {
      id: '9',
      itemName: '12 CORE',
      itemDescription: 'FIGURE 8 FIBER OPTIC CABLE',
      category: 'FTTH',
      quantityAlert: 10,
      totalStockIn: 25,
      totalStockAvailable: 0,
      supplier: 'Supplier 1'
    }
  ];

  // Generate categories with counts
  const categories: Category[] = [
    {
      id: 'all',
      name: 'All',
      count: inventoryItems.length
    },
    {
      id: 'empty',
      name: '(empty)',
      count: inventoryItems.filter(item => item.totalStockAvailable === 0).length
    },
    ...Array.from(new Set(inventoryItems.map(item => item.category)))
      .map(category => ({
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
        count: inventoryItems.filter(item => item.category === category).length
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ];

  // Filter items based on selected category and search query
  const filteredItems = inventoryItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'empty' && item.totalStockAvailable === 0) ||
                           item.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
    
    const matchesSearch = searchQuery === '' || 
                         item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getQuantityColor = (item: InventoryItem) => {
    if (item.totalStockAvailable === 0) return 'text-red-500';
    if (item.totalStockAvailable <= item.quantityAlert / 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  // Sample data for inventory details
  const getSampleInventoryLogs = () => [
    {
      id: '1',
      date: '2024-11-30T21:31:31',
      itemQuantity: -2,
      requestedBy: 'David John Dimacali',
      requestedWith: 'None'
    },
    {
      id: '2',
      date: '2024-11-28T21:15:46',
      itemQuantity: -2,
      requestedBy: 'David John Dimacali',
      requestedWith: 'None'
    },
    {
      id: '3',
      date: '2024-11-27T21:11:59',
      itemQuantity: 1,
      requestedBy: 'David John Dimacali',
      requestedWith: 'None'
    }
  ];

  const handleAddItem = () => {
    setShowInventoryForm(true);
  };

  const handleSaveInventoryItem = async (formData: InventoryFormData) => {
    try {
      console.log('Saving inventory item:', formData);
      alert('Inventory item saved successfully!');
      setShowInventoryForm(false);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item');
    }
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Category Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Package className="mr-2" size={20} />
            Inventory
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-800 ${
                selectedCategory === category.id
                  ? 'bg-orange-500 bg-opacity-20 text-orange-400 border-r-2 border-orange-500'
                  : 'text-gray-300'
              }`}
            >
              <span className="uppercase font-medium">{category.name}</span>
              {category.count > 0 && (
                <span className={`px-2 py-1 rounded text-xs ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-900 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <button 
                className="bg-orange-600 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 hover:bg-orange-700 transition-colors"
                onClick={handleAddItem}
              >
                <Plus size={16} />
                <span>Add Item</span>
              </button>
            </div>
          </div>
          
          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-800">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`hover:bg-gray-800 transition-colors cursor-pointer ${
                      selectedItem?.id === item.id ? 'bg-gray-800 border-r-2 border-orange-500' : ''
                    }`}
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle 
                          className={`mt-1 ${
                            item.totalStockAvailable === 0 || item.totalStockAvailable <= item.quantityAlert / 2 
                              ? 'text-yellow-500' 
                              : 'text-gray-600'
                          }`} 
                          size={20} 
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium text-lg">
                            {item.itemName}
                          </div>
                          <div className="text-gray-400 text-sm mt-1">
                            {item.itemDescription}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${getQuantityColor(item)}`}>
                        {item.totalStockAvailable}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <Package size={48} className="mx-auto mb-4 text-gray-600" />
                  <div className="text-lg mb-2">No items found</div>
                  <div className="text-sm">Try adjusting your search or category filter</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Details Panel */}
      {selectedItem && (
        <div className="w-full max-w-2xl bg-gray-900 border-l border-gray-700 flex-shrink-0 relative">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded p-1"
              >
                <X size={20} />
              </button>
            </div>
          <InventoryDetails
            item={selectedItem}
            inventoryLogs={getSampleInventoryLogs()}
            borrowedLogs={[]}
            jobOrders={[]}
            serviceOrders={[]}
            defectiveLogs={[]}
          />
        </div>
      )}

      {/* Inventory Form Modal */}
      <InventoryFormModal
        isOpen={showInventoryForm}
        onClose={() => setShowInventoryForm(false)}
        onSave={handleSaveInventoryItem}
      />
    </div>
  );
};

export default Inventory;
