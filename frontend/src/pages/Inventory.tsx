import React from 'react';

const Inventory: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Inventory Management</h1>
        <p className="text-gray-400">Manage equipment and inventory items</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Inventory Module</div>
          <div className="text-gray-500">Coming soon...</div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
