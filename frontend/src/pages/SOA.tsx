import React, { useState, useEffect } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import SOADetails from '../components/SOADetails';

interface DateItem {
  date: string;
  id: string;
}

// SOA-specific interface for records
interface SOARecord {
  id: string;
  statementDate: string;
  accountNo: string;
  dateInstalled: string;
  fullName: string;
  contactNumber: string;
  emailAddress: string;
  address: string;
  plan: string;
  provider?: string;
  balanceFromPreviousBill?: number;
  statementNo?: string;
  paymentReceived?: number;
  remainingBalance?: number;
  monthlyServiceFee?: number;
  otherCharges?: number;
  vat?: number;
  dueDate?: string;
  amountDue?: number;
  totalAmountDue?: number;
  deliveryStatus?: string;
  deliveryDate?: string;
  deliveredBy?: string;
  deliveryRemarks?: string;
  deliveryProof?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  printLink?: string;
  barangay?: string;
  city?: string;
  region?: string;
}

const SOA: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<SOARecord | null>(null);
  const [soaRecords, setSOARecords] = useState<SOARecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<number>(1); // To toggle between different table views

  // All columns for the table - combine all columns from the different views
  const allColumns = [
    // Customer Info
    { key: 'statementDate', label: 'Statement Date', width: 'min-w-36' },
    { key: 'accountNo', label: 'Account No.', width: 'min-w-32' },
    { key: 'dateInstalled', label: 'Date Installed', width: 'min-w-32' },
    { key: 'fullName', label: 'Full Name', width: 'min-w-40' },
    { key: 'contactNumber', label: 'Contact Number', width: 'min-w-36' },
    { key: 'emailAddress', label: 'Email Address', width: 'min-w-48' },
    { key: 'address', label: 'Address', width: 'min-w-56' },
    { key: 'plan', label: 'Plan', width: 'min-w-32' },
    
    // Billing Info
    { key: 'provider', label: 'Provider', width: 'min-w-28' },
    { key: 'balanceFromPreviousBill', label: 'Balance from Previous Bill', width: 'min-w-40' },
    { key: 'statementNo', label: 'Statement No.', width: 'min-w-32' },
    { key: 'paymentReceived', label: 'Payment Received', width: 'min-w-36' },
    { key: 'remainingBalance', label: 'Remaining Balance', width: 'min-w-36' },
    { key: 'monthlyServiceFee', label: 'Monthly Service Fee', width: 'min-w-36' },
    { key: 'otherCharges', label: 'Others and Basic Charges', width: 'min-w-40' },
    { key: 'vat', label: 'VAT', width: 'min-w-24' },
    { key: 'dueDate', label: 'DUE DATE', width: 'min-w-28' },
    { key: 'amountDue', label: 'AMOUNT', width: 'min-w-28' },
    
    // Delivery Info
    { key: 'totalAmountDue', label: 'TOTAL AMOUNT DUE', width: 'min-w-36' },
    { key: 'deliveryStatus', label: 'Delivery Status', width: 'min-w-32' },
    { key: 'deliveryDate', label: 'Delivery Date', width: 'min-w-32' },
    { key: 'deliveredBy', label: 'Delivered By', width: 'min-w-32' },
    { key: 'deliveryRemarks', label: 'Delivery Remarks', width: 'min-w-40' },
    { key: 'deliveryProof', label: 'Delivery Proof', width: 'min-w-32' },
    { key: 'modifiedBy', label: 'Modified By', width: 'min-w-32' },
    { key: 'modifiedDate', label: 'Modified Date', width: 'min-w-32' },
    
    // Location Info
    { key: 'printLink', label: 'Print Link', width: 'min-w-28' },
    { key: 'barangay', label: 'Barangay', width: 'min-w-32' },
    { key: 'city', label: 'City', width: 'min-w-32' },
    { key: 'region', label: 'Region', width: 'min-w-32' },
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

  // Sample SOA data
  useEffect(() => {
    const fetchSOAData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, this would fetch from an API
        // For now, we'll create sample data
        const sampleData: SOARecord[] = [
          {
            id: '1782',
            statementDate: '9/23/2025',
            accountNo: '202306870',
            dateInstalled: '6/18/2025',
            fullName: 'Violeta A Espinolilla',
            contactNumber: '9701304853',
            emailAddress: 'violetaarabit@gmail.com',
            address: '0225 Ilang Ilang St',
            plan: 'SwitchLite - P699',
            provider: 'SWITCH',
            balanceFromPreviousBill: 0,
            statementNo: 'SOA-9809',
            paymentReceived: 699,
            remainingBalance: 0,
            monthlyServiceFee: 699,
            otherCharges: 0,
            vat: 83.88,
            dueDate: '10/15/2025',
            amountDue: 782.88,
            totalAmountDue: 782.88,
            deliveryStatus: 'Delivered',
            deliveryDate: '9/25/2025',
            deliveredBy: 'Juan Santos',
            deliveryRemarks: 'Left at door',
            deliveryProof: 'View',
            modifiedBy: 'admin',
            modifiedDate: '9/23/2025',
            printLink: 'Print',
            barangay: 'Ilang Ilang',
            city: 'Quezon City',
            region: 'Metro Manila'
          },
          {
            id: '5475',
            statementDate: '8/23/2025',
            accountNo: '202306869',
            dateInstalled: '6/18/2025',
            fullName: 'Maybelle B Molilla',
            contactNumber: '9850873214',
            emailAddress: 'jmaybzm@gmail.com',
            address: '0426 San Juan Ext St',
            plan: 'SwitchConnect - P799',
            provider: 'SWITCH',
            balanceFromPreviousBill: 0,
            statementNo: 'SOA-9810',
            paymentReceived: 799,
            remainingBalance: 0,
            monthlyServiceFee: 799,
            otherCharges: 0,
            vat: 95.88,
            dueDate: '9/15/2025',
            amountDue: 894.88,
            totalAmountDue: 894.88,
            deliveryStatus: 'Delivered',
            deliveryDate: '8/25/2025',
            deliveredBy: 'Marco Polo',
            deliveryRemarks: 'Handed to recipient',
            deliveryProof: 'View',
            modifiedBy: 'admin',
            modifiedDate: '8/23/2025',
            printLink: 'Print',
            barangay: 'San Juan',
            city: 'Quezon City',
            region: 'Metro Manila'
          },
          {
            id: '5226',
            statementDate: '7/23/2025',
            accountNo: '202306868',
            dateInstalled: '6/18/2025',
            fullName: 'Jonell P Enriquez',
            contactNumber: '9052592462',
            emailAddress: 'jajarojas089@gmail.com',
            address: '51 National Rd',
            plan: 'SwitchNet - P999',
            provider: 'SWITCH',
            balanceFromPreviousBill: 0,
            statementNo: 'SOA-9811',
            paymentReceived: 999,
            remainingBalance: 0,
            monthlyServiceFee: 999,
            otherCharges: 0,
            vat: 119.88,
            dueDate: '8/15/2025',
            amountDue: 1118.88,
            totalAmountDue: 1118.88,
            deliveryStatus: 'Delivered',
            deliveryDate: '7/25/2025',
            deliveredBy: 'Pedro Penduko',
            deliveryRemarks: 'Placed in mailbox',
            deliveryProof: 'View',
            modifiedBy: 'admin',
            modifiedDate: '7/23/2025',
            printLink: 'Print',
            barangay: 'National',
            city: 'Manila',
            region: 'Metro Manila'
          }
        ];
        
        // Add more sample data by duplicating and modifying the first few records
        const additionalData = [];
        for (let i = 0; i < 10; i++) {
          const baseRecord = sampleData[i % sampleData.length];
          additionalData.push({
            ...baseRecord,
            id: `${i + 9000}`,
            accountNo: `2023068${70 + i}`,
            fullName: `Customer ${i + 1}`,
            emailAddress: `customer${i + 1}@example.com`
          });
        }
        
        setSOARecords([...sampleData, ...additionalData]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch SOA records:', err);
        setError('Failed to load SOA records. Please try again.');
        setSOARecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSOAData();
  }, []);

  const filteredRecords = soaRecords.filter(record => {
    const matchesDate = selectedDate === 'All' || record.statementDate === selectedDate;
    const matchesSearch = searchQuery === '' || 
                         record.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.accountNo.includes(searchQuery);
    
    return matchesDate && matchesSearch;
  });

  const handleRowClick = (record: SOARecord) => {
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

  const renderCellValue = (record: SOARecord, columnKey: string) => {
    switch (columnKey) {
      case 'statementDate':
        return record.statementDate || '-';
      case 'accountNo':
        return <span className="text-red-400">{record.accountNo}</span>;
      case 'dateInstalled':
        return record.dateInstalled || '-';
      case 'fullName':
        return record.fullName;
      case 'contactNumber':
        return record.contactNumber || '-';
      case 'emailAddress':
        return record.emailAddress || '-';
      case 'address':
        return <span title={record.address}>{record.address}</span>;
      case 'plan':
        return record.plan || '-';
      case 'provider':
        return record.provider || '-';
      case 'balanceFromPreviousBill':
        return record.balanceFromPreviousBill !== undefined ? `₱ ${record.balanceFromPreviousBill.toFixed(2)}` : '-';
      case 'statementNo':
        return record.statementNo || '-';
      case 'paymentReceived':
        return record.paymentReceived !== undefined ? `₱ ${record.paymentReceived.toFixed(2)}` : '-';
      case 'remainingBalance':
        return record.remainingBalance !== undefined ? `₱ ${record.remainingBalance.toFixed(2)}` : '-';
      case 'monthlyServiceFee':
        return record.monthlyServiceFee !== undefined ? `₱ ${record.monthlyServiceFee.toFixed(2)}` : '-';
      case 'otherCharges':
        return record.otherCharges !== undefined ? `₱ ${record.otherCharges.toFixed(2)}` : '-';
      case 'vat':
        return record.vat !== undefined ? `₱ ${record.vat.toFixed(2)}` : '-';
      case 'dueDate':
        return record.dueDate || '-';
      case 'amountDue':
        return record.amountDue !== undefined ? `₱ ${record.amountDue.toFixed(2)}` : '-';
      case 'totalAmountDue':
        return record.totalAmountDue !== undefined ? `₱ ${record.totalAmountDue.toFixed(2)}` : '-';
      case 'deliveryStatus':
        return record.deliveryStatus || '-';
      case 'deliveryDate':
        return record.deliveryDate || '-';
      case 'deliveredBy':
        return record.deliveredBy || '-';
      case 'deliveryRemarks':
        return record.deliveryRemarks || '-';
      case 'deliveryProof':
        return record.deliveryProof ? <button className="text-blue-400 hover:text-blue-300">{record.deliveryProof}</button> : '-';
      case 'modifiedBy':
        return record.modifiedBy || '-';
      case 'modifiedDate':
        return record.modifiedDate || '-';
      case 'printLink':
        return record.printLink ? <button className="text-blue-400 hover:text-blue-300">{record.printLink}</button> : '-';
      case 'barangay':
        return record.barangay || '-';
      case 'city':
        return record.city || '-';
      case 'region':
        return record.region || '-';
      default:
        return '-';
    }
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">SOA</h2>
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
                    placeholder="Search SOA records..."
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
                  <p className="mt-4">Loading SOA records...</p>
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
                            No SOA records found matching your filters
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
          <SOADetails soaRecord={selectedRecord} />
        </div>
      )}
    </div>
  );
};

export default SOA;