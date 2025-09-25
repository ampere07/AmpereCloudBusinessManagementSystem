import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import InvoiceDetails from '../components/InvoiceDetails';

interface DateItem {
  date: string;
  id: string;
}

// Invoice-specific interface for records
interface InvoiceRecord {
  id: string;
  invoiceDate: string;
  invoiceStatus: string;
  accountNo: string;
  fullName: string;
  contactNumber: string;
  emailAddress: string;
  address: string;
  plan: string;
  dateInstalled?: string;
  provider?: string;
  invoiceNo?: string;
  invoiceBalance?: number;
  otherCharges?: number;
  totalAmountDue?: number;
  dueDate?: string;
  invoicePayment?: number;
  paymentMethod?: string;
  dateProcessed?: string;
  processedBy?: string;
  vat?: number;
  amountDue?: number;
  balanceFromPreviousBill?: number;
  paymentReceived?: number;
  remainingBalance?: number;
  monthlyServiceFee?: number;
  remarks?: string;
  staggeredPaymentsCount?: number;
}

const Invoice: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<InvoiceRecord | null>(null);
  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<number>(1); // To toggle between different table views

  // All columns for the table based on the provided requirements
  const allColumns = [
    { key: 'invoiceDate', label: 'Invoice Date', width: 'min-w-36' },
    { key: 'invoiceStatus', label: 'Invoice Status', width: 'min-w-36' },
    { key: 'accountNo', label: 'Account No.', width: 'min-w-32' },
    { key: 'invoiceBalance', label: 'Invoice Balance', width: 'min-w-36' },
    { key: 'otherCharges', label: 'Others and Basic Charges', width: 'min-w-44' },
    { key: 'totalAmountDue', label: 'Total Amount', width: 'min-w-32' },
    { key: 'dueDate', label: 'Due Date', width: 'min-w-32' },
    { key: 'invoicePayment', label: 'Invoice Payment', width: 'min-w-36' },
    { key: 'paymentMethod', label: 'Payment Method', width: 'min-w-36' },
    { key: 'dateProcessed', label: 'Date Processed', width: 'min-w-36' },
    { key: 'processedBy', label: 'Processed By', width: 'min-w-32' }
  ];

  // Date navigation items
  const dateItems = [
    { date: 'All', id: '' },
    { date: '9/23/2025', id: '1782' },
    { date: '8/23/2025', id: '5475' },
    { date: '7/23/2025', id: '5226' },
    { date: '6/23/2025', id: '9005' },
    { date: '5/23/2025', id: '4711' },
    { date: '4/23/2025', id: '4474' },
    { date: '3/23/2025', id: '4211' },
    { date: '2/23/2025', id: '3023' },
    { date: '1/23/2025', id: '3549' },
  ];

  // Sample Invoice data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from an API
        // For now, we'll create sample data
        const sampleData: InvoiceRecord[] = [
          {
            id: '1782',
            invoiceDate: '9/23/2025',
            invoiceStatus: 'Paid',
            accountNo: '202306870',
            fullName: 'Violeta A Espinolilla',
            contactNumber: '9701304853',
            emailAddress: 'violetaarabit@gmail.com',
            address: '0225 Ilang Ilang St, Bilibiran, Binangonan, Rizal',
            plan: 'SwitchLite - P699',
            provider: 'SWITCH',
            invoiceNo: '2508182' + '1782',
            invoiceBalance: 0,
            otherCharges: 0,
            totalAmountDue: 2609.60,
            dueDate: '10/15/2025',
            invoicePayment: 2609.60,
            paymentMethod: 'Credit Card',
            dateProcessed: '9/28/2025',
            processedBy: 'admin',
            dateInstalled: '6/18/2025',
            balanceFromPreviousBill: 0,
            vat: 83.88,
            remarks: 'System Generated',
            staggeredPaymentsCount: 0
          },
          {
            id: '5475',
            invoiceDate: '8/23/2025',
            invoiceStatus: 'Unpaid',
            accountNo: '202307911',
            fullName: 'Winilyn R Luklukan',
            contactNumber: '9707551528',
            emailAddress: 'luklukanwinilyn@gmail.com',
            address: 'Tabing Dagat, Bilibiran, Binangonan, Rizal',
            plan: 'SwitchLite - P699',
            provider: 'SWITCH',
            invoiceNo: '2508182' + '5475',
            invoiceBalance: 699,
            otherCharges: 0,
            totalAmountDue: 2609.60,
            dueDate: '8/30/2025',
            invoicePayment: 0,
            paymentMethod: 'N/A',
            dateInstalled: '6/18/2025',
            vat: 95.88,
            remarks: 'System Generated',
            staggeredPaymentsCount: 0
          },
          {
            id: '5226',
            invoiceDate: '7/23/2025',
            invoiceStatus: 'Partial',
            accountNo: '202306868',
            fullName: 'Jonell P Enriquez',
            contactNumber: '9052592462',
            emailAddress: 'jajarojas089@gmail.com',
            address: '51 National Rd, Bilibiran, Binangonan, Rizal',
            plan: 'SwitchNet - P999',
            provider: 'SWITCH',
            invoiceNo: '2508182' + '5226',
            invoiceBalance: 518.88,
            otherCharges: 119.88,
            totalAmountDue: 2609.60,
            dueDate: '8/15/2025',
            invoicePayment: 600,
            paymentMethod: 'GCash',
            dateProcessed: '8/10/2025',
            processedBy: 'agent001',
            dateInstalled: '6/18/2025',
            vat: 119.88,
            remarks: 'System Generated',
            staggeredPaymentsCount: 0
          }
        ];
        
        // Add more sample data by duplicating and modifying the first few records
        const additionalData = [];
        for (let i = 0; i < 10; i++) {
          const baseRecord = sampleData[i % sampleData.length];
          const status = i % 3 === 0 ? 'Paid' : (i % 3 === 1 ? 'Unpaid' : 'Partial');
          const payment = status === 'Paid' ? (baseRecord.totalAmountDue || 0) : (status === 'Partial' ? (baseRecord.totalAmountDue || 0) / 2 : 0);
          
          additionalData.push({
            ...baseRecord,
            id: `${i + 9000}`,
            accountNo: `2023068${70 + i}`,
            fullName: `Customer ${i + 1}`,
            emailAddress: `customer${i + 1}@example.com`,
            invoiceStatus: status,
            invoicePayment: payment,
            invoiceBalance: (baseRecord.totalAmountDue || 0) - payment,
            paymentMethod: status === 'Unpaid' ? 'N/A' : (i % 2 === 0 ? 'GCash' : 'Credit Card'),
            dateProcessed: status === 'Unpaid' ? undefined : `9/${10 + i}/2025`,
            processedBy: status === 'Unpaid' ? undefined : 'agent' + (i % 5 + 1).toString().padStart(3, '0'),
            remarks: 'System Generated',
            staggeredPaymentsCount: i % 5 === 0 ? 2 : 0
          });
        }
        
        setInvoiceRecords([...sampleData, ...additionalData]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch Invoice records:', err);
        setError('Failed to load Invoice records. Please try again.');
        setInvoiceRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoiceData();
  }, []);

  const filteredRecords = invoiceRecords.filter(record => {
    const matchesDate = selectedDate === 'All' || record.invoiceDate === selectedDate;
    const matchesSearch = searchQuery === '' || 
                         record.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.accountNo.includes(searchQuery) ||
                         (record.invoiceNo && record.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (record.invoiceStatus && record.invoiceStatus.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (record.paymentMethod && record.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (record.processedBy && record.processedBy.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesDate && matchesSearch;
  });

  const handleRowClick = (record: InvoiceRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
  };

  const handleRefresh = async () => {
    // In a real implementation, this would re-fetch from the API
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const renderCellValue = (record: InvoiceRecord, columnKey: string) => {
    switch (columnKey) {
      case 'invoiceDate':
        return record.invoiceDate || '-';
      case 'invoiceStatus':
        return (
          <span className={`${record.invoiceStatus === 'Unpaid' ? 'text-red-500' : record.invoiceStatus === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
            {record.invoiceStatus || 'Unpaid'}
          </span>
        );
      case 'accountNo':
        return <span className="text-red-400">{record.accountNo}</span>;
      case 'invoiceBalance':
        return record.invoiceBalance !== undefined ? `₱ ${record.invoiceBalance.toFixed(2)}` : '-';
      case 'otherCharges':
        return record.otherCharges !== undefined ? `₱ ${record.otherCharges.toFixed(2)}` : '-';
      case 'totalAmountDue':
        return record.totalAmountDue !== undefined ? `₱ ${record.totalAmountDue.toFixed(2)}` : '-';
      case 'dueDate':
        return record.dueDate || '-';
      case 'invoicePayment':
        return record.invoicePayment !== undefined ? `₱ ${record.invoicePayment.toFixed(2)}` : '-';
      case 'paymentMethod':
        return record.paymentMethod || 'N/A';
      case 'dateProcessed':
        return record.dateProcessed || 'Pending';
      case 'processedBy':
        return record.processedBy || '-';
      default:
        return '-';
    }
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Invoice</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {dateItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(item.date)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-800 ${
                selectedDate === item.date
                  ? item.date === 'All' ? 'bg-orange-500 bg-opacity-20 text-orange-400 flex items-center' : 'bg-orange-500 bg-opacity-20 text-orange-400'
                  : 'text-gray-300'
              }`}
            >
              {item.date === 'All' ? (
                <span className="text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  {item.date}
                </span>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center">
                    {item.date}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${selectedDate === item.date ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{item.id}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-gray-900 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Invoice records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
              
              {/* Table View Selection removed as requested */}
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
                  <p className="mt-4">Loading Invoice records...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-12 text-center text-red-400">
                  <p>{error}</p>
                  <button 
                    onClick={handleRefresh}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                    Retry
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto overflow-y-hidden">
                  <table className="w-max min-w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
                        {allColumns.map((column, index) => (
                          <th
                            key={column.key}
                            className={`text-left py-3 px-3 text-gray-400 font-normal bg-gray-800 ${column.width} whitespace-nowrap ${
                              index < allColumns.length - 1 ? 'border-r border-gray-700' : ''
                            }`}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                          <tr 
                            key={record.id} 
                            className={`border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors ${
                              selectedRecord?.id === record.id ? 'bg-gray-800' : ''
                            }`}
                            onClick={() => handleRowClick(record)}
                          >
                            {allColumns.map((column, index) => (
                              <td
                                key={column.key}
                                className={`py-4 px-3 text-white whitespace-nowrap ${
                                  index < allColumns.length - 1 ? 'border-r border-gray-800' : ''
                                }`}
                              >
                                {renderCellValue(record, column.key)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={allColumns.length} className="px-4 py-12 text-center text-gray-400">
                            No Invoice records found matching your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="w-full max-w-3xl bg-gray-900 border-l border-gray-700 flex-shrink-0 relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded p-1"
            >
              <X size={20} />
            </button>
          </div>
          <InvoiceDetails invoiceRecord={selectedRecord} />
        </div>
      )}
    </div>
  );
};

export default Invoice;