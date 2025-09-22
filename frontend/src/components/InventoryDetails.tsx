import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, OctagonX, HandCoins, BaggageClaim, Edit, ChevronLeft, ChevronRight as ChevronRightNav, Maximize2, X } from 'lucide-react';

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

interface InventoryLog {
  id: string;
  date: string;
  itemQuantity: number;
  requestedBy: string;
  requestedWith: string;
}

interface BorrowedLog {
  id: string;
  date: string;
  borrowedBy: string;
  quantity: number;
  returnDate?: string;
  status: string;
}

interface JobOrder {
  id: string;
  jobOrderNumber: string;
  date: string;
  assignedTo: string;
  quantity: number;
  status: string;
}

interface ServiceOrder {
  id: string;
  serviceOrderNumber: string;
  date: string;
  technician: string;
  quantity: number;
  status: string;
}

interface DefectiveLog {
  id: string;
  date: string;
  reportedBy: string;
  quantity: number;
  defectType: string;
  description: string;
}

interface InventoryDetailsProps {
  item: InventoryItem;
  inventoryLogs?: InventoryLog[];
  borrowedLogs?: BorrowedLog[];
  jobOrders?: JobOrder[];
  serviceOrders?: ServiceOrder[];
  defectiveLogs?: DefectiveLog[];
}

const InventoryDetails: React.FC<InventoryDetailsProps> = ({
  item,
  inventoryLogs = [],
  borrowedLogs = [],
  jobOrders = [],
  serviceOrders = [],
  defectiveLogs = []
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    inventoryLogs: true,
    borrowedLogs: false,
    jobOrders: false,
    serviceOrders: false,
    defectiveLogs: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header with Item Name and Actions */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-lg font-semibold text-white">{item.itemName}</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <Trash2 size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <OctagonX size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <HandCoins size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <BaggageClaim size={18} />
          </button>
          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
            Edit
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <ChevronRightNav size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <Maximize2 size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Item Details Header */}
      <div className="p-6 space-y-4">
        {/* Category */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Category</span>
          <span className="text-white font-medium">{item.category}</span>
        </div>

        {/* Item Name */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Item Name</span>
          <span className="text-white font-medium">{item.itemName}</span>
        </div>

        {/* Quantity Alert */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Quantity Alert</span>
          <span className="text-white font-medium">{item.quantityAlert}</span>
        </div>

        {/* Item Description */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Item Description</span>
          <span className="text-white font-medium">{item.itemDescription}</span>
        </div>

        {/* Total Stock IN */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Stock IN</span>
          <span className="text-white font-medium">{item.totalStockIn}</span>
        </div>

        {/* Total Stock Available */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Stock Available</span>
          <span className="text-green-400 font-bold text-lg">{item.totalStockAvailable}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Related Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Related Inventory Logs */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('inventoryLogs')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">Related Inventory Logs</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                {inventoryLogs.length}
              </span>
            </div>
            {expandedSections.inventoryLogs ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          {expandedSections.inventoryLogs && (
            <div className="px-6 pb-4">
              {inventoryLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Item Quantity</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Requested By</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Requested With</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-800">
                          <td className="py-2 text-white">{formatDate(log.date)}</td>
                          <td className="py-2 text-white">{log.itemQuantity}</td>
                          <td className="py-2 text-white">{log.requestedBy}</td>
                          <td className="py-2 text-white">{log.requestedWith}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Borrowed Logs */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('borrowedLogs')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">Related Borrowed Logs</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                {borrowedLogs.length}
              </span>
            </div>
            {expandedSections.borrowedLogs ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          {expandedSections.borrowedLogs && (
            <div className="px-6 pb-4">
              {borrowedLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Borrowed By</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Quantity</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Return Date</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowedLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-800">
                          <td className="py-2 text-white">{formatDate(log.date)}</td>
                          <td className="py-2 text-white">{log.borrowedBy}</td>
                          <td className="py-2 text-white">{log.quantity}</td>
                          <td className="py-2 text-white">{log.returnDate ? formatDate(log.returnDate) : '-'}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              log.status === 'Returned' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-orange-600 text-white'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Job Orders */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('jobOrders')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">Related Job Orders</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                {jobOrders.length}
              </span>
            </div>
            {expandedSections.jobOrders ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          {expandedSections.jobOrders && (
            <div className="px-6 pb-4">
              {jobOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400 font-medium">Job Order #</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Assigned To</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Quantity</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-800">
                          <td className="py-2 text-white">{order.jobOrderNumber}</td>
                          <td className="py-2 text-white">{formatDate(order.date)}</td>
                          <td className="py-2 text-white">{order.assignedTo}</td>
                          <td className="py-2 text-white">{order.quantity}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'Completed' 
                                ? 'bg-green-600 text-white' 
                                : order.status === 'In Progress'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-600 text-white'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Service Orders */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('serviceOrders')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">Related Service Orders</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                {serviceOrders.length}
              </span>
            </div>
            {expandedSections.serviceOrders ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          {expandedSections.serviceOrders && (
            <div className="px-6 pb-4">
              {serviceOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400 font-medium">Service Order #</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Technician</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Quantity</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-800">
                          <td className="py-2 text-white">{order.serviceOrderNumber}</td>
                          <td className="py-2 text-white">{formatDate(order.date)}</td>
                          <td className="py-2 text-white">{order.technician}</td>
                          <td className="py-2 text-white">{order.quantity}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'Completed' 
                                ? 'bg-green-600 text-white' 
                                : order.status === 'In Progress'
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-600 text-white'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Defective Logs */}
        <div className="border-b border-gray-700">
          <button
            onClick={() => toggleSection('defectiveLogs')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">Related Defective Logs</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                {defectiveLogs.length}
              </span>
            </div>
            {expandedSections.defectiveLogs ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          {expandedSections.defectiveLogs && (
            <div className="px-6 pb-4">
              {defectiveLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Reported By</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Quantity</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Defect Type</th>
                        <th className="text-left py-2 text-gray-400 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defectiveLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-800">
                          <td className="py-2 text-white">{formatDate(log.date)}</td>
                          <td className="py-2 text-white">{log.reportedBy}</td>
                          <td className="py-2 text-white">{log.quantity}</td>
                          <td className="py-2 text-white">{log.defectType}</td>
                          <td className="py-2 text-white max-w-xs truncate">{log.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Button at Bottom */}
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors">
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

export default InventoryDetails;