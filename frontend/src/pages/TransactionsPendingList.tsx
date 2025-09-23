import React, { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import PendingSliceFormModal from '../modals/PendingSliceFormModal';

interface PendingSliceFormData {
  transactionId: string;
  accountNo: string;
  receivedPayment: number;
  dateProcessed: string;
  processedBy: string;
  paymentMethod: string;
  referenceNo: string;
  orNo: string;
  remarks: string;
  modifiedBy: string;
  modifiedDate: string;
  userEmail: string;
  status: string;
  transactionType: string;
  paymentDate: string;
  city: string;
  image?: string;
}

interface TransactionPending {
  id: string;
  date: string;
  amount: number;
  customer: string;
  description: string;
  status: 'pending' | 'processing' | 'review';
  type: string;
}

const TransactionsPendingList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingTransactions] = useState<TransactionPending[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTransaction = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveTransaction = (formData: PendingSliceFormData) => {
    console.log('Saving transaction:', formData);
    // Here you would typically save the data to your backend
    // For now, just close the modal
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-900 h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Transactions Pending List</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleAddTransaction}
            className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Add
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center">
        {pendingTransactions.length === 0 ? (
          <div className="text-center text-gray-400">
            <p className="text-lg">No items</p>
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden">
            <div className="h-full overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-800">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTransactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 text-white">{transaction.date}</td>
                        <td className="py-3 px-4 text-white">₱{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-4 text-white">{transaction.customer}</td>
                        <td className="py-3 px-4 text-white">{transaction.description}</td>
                        <td className="py-3 px-4 text-white">{transaction.type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                            transaction.status === 'processing' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                            'bg-orange-500 bg-opacity-20 text-orange-400'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Slice Form Modal */}
      <PendingSliceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};

export default TransactionsPendingList;
