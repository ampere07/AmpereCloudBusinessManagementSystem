import React, { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import DailyExpensesFormModal from '../modals/DailyExpensesFormModal';

const DailyExpenses: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddExpense = () => {
    setIsModalOpen(true);
  };

  const handleSaveExpense = (formData: any) => {
    console.log('Saving expense:', formData);
    // Here you would typically add the expense to your state or send it to the server
    setIsModalOpen(false);
  };
  return (
    <div className="bg-gray-900 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <h1 className="text-xl font-semibold text-white">Daily Expenses</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddExpense}
            className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add Expense
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-lg">No items</p>
        </div>
      </div>

      {/* Daily Expenses Form Modal */}
      <DailyExpensesFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
      />
    </div>
  );
};

export default DailyExpenses;