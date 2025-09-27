import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CreditCard, Search, Circle, X, ListFilter } from 'lucide-react';
import BillingDetails from '../components/BillingDetails';
import BillingListViewDetails from '../components/BillingListViewDetails';
import { getBillingRecords, BillingRecord } from '../services/billingService';
import { getCities, City } from '../services/cityService';
import { getRegions, Region } from '../services/regionService';

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

type DisplayMode = 'card' | 'table';

const Billing: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('card');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // All available columns for the table - extended list to match BillingListView
  const allColumns = [
    { key: 'status', label: 'Status', width: 'min-w-28' },
    { key: 'billingStatus', label: 'Billing Status', width: 'min-w-28' },
    { key: 'accountNo', label: 'Account No.', width: 'min-w-32' },
    { key: 'dateInstalled', label: 'Date Installed', width: 'min-w-28' },
    { key: 'customerName', label: 'Full Name', width: 'min-w-40' },
    { key: 'address', label: 'Address', width: 'min-w-56' },
    { key: 'contactNumber', label: 'Contact Number', width: 'min-w-36' },
    { key: 'emailAddress', label: 'Email Address', width: 'min-w-48' },
    { key: 'plan', label: 'Plan', width: 'min-w-40' },
    { key: 'balance', label: 'Account Balance', width: 'min-w-32' },
    { key: 'username', label: 'Username', width: 'min-w-32' },
    { key: 'connectionType', label: 'Connection Type', width: 'min-w-36' },
    { key: 'routerModel', label: 'Router Model', width: 'min-w-32' },
    { key: 'routerModemSN', label: 'Router/Modem SN', width: 'min-w-36' },
    { key: 'lcpnap', label: 'LCPNAP', width: 'min-w-32' },
    { key: 'port', label: 'PORT', width: 'min-w-28' },
    { key: 'vlan', label: 'VLAN', width: 'min-w-24' },
    { key: 'billingDay', label: 'Billing Day', width: 'min-w-28' },
    { key: 'totalPaid', label: 'Total Paid', width: 'min-w-28' },
    { key: 'provider', label: 'Provider', width: 'min-w-24' },
    { key: 'lcp', label: 'LCP', width: 'min-w-28' },
    { key: 'nap', label: 'NAP', width: 'min-w-28' },
    { key: 'modifiedBy', label: 'Modified By', width: 'min-w-32' },
    { key: 'modifiedDate', label: 'Modified Date', width: 'min-w-36' },
    { key: 'barangay', label: 'Barangay', width: 'min-w-32' },
    { key: 'city', label: 'City', width: 'min-w-28' },
    { key: 'region', label: 'Region', width: 'min-w-28' },
    { key: 'lcpnapport', label: 'LCPNAPPORT', width: 'min-w-36' },
    { key: 'usageType', label: 'Usage Type', width: 'min-w-32' },
    { key: 'referredBy', label: 'Referred By', width: 'min-w-36' },
    { key: 'secondContactNumber', label: 'Second Contact Number', width: 'min-w-40' },
    { key: 'referrersAccountNumber', label: 'Referrer\'s Account Number', width: 'min-w-44' },
    { key: 'relatedInvoices', label: 'Related Invoices', width: 'min-w-36' },
    { key: 'relatedStatementOfAccount', label: 'Related Statement of Account', width: 'min-w-52' },
    { key: 'relatedDiscounts', label: 'Related Discounts', width: 'min-w-36' },
    { key: 'relatedStaggeredInstallation', label: 'Related Staggered Installation', width: 'min-w-52' },
    { key: 'relatedStaggeredPayments', label: 'Related Staggered Payments', width: 'min-w-52' },
    { key: 'relatedOverdues', label: 'Related Overdues', width: 'min-w-36' },
    { key: 'relatedDCNotices', label: 'Related DC Notices', width: 'min-w-40' },
    { key: 'relatedServiceOrders', label: 'Related Service Orders', width: 'min-w-44' },
    { key: 'relatedDisconnectedLogs', label: 'Related Disconnected Logs', width: 'min-w-48' },
    { key: 'relatedReconnectionLogs', label: 'Related Reconnection Logs', width: 'min-w-48' },
    { key: 'relatedChangeDueLogs', label: 'Related Change Due Logs', width: 'min-w-48' },
    { key: 'relatedTransactions', label: 'Related Transactions', width: 'min-w-40' },
    { key: 'relatedDetailsUpdateLogs', label: 'Related Details Update Logs', width: 'min-w-48' },
    { key: 'computedAddress', label: '_ComputedAddress', width: 'min-w-40' },
    { key: 'computedStatus', label: '_ComputedStatus', width: 'min-w-36' },
    { key: 'relatedAdvancedPayments', label: 'Related Advanced Payments', width: 'min-w-48' },
    { key: 'relatedPaymentPortalLogs', label: 'Related Payment Portal Logs', width: 'min-w-48' },
    { key: 'relatedInventoryLogs', label: 'Related Inventory Logs', width: 'min-w-44' },
    { key: 'computedAccountNo', label: '_ComputedAccountNo', width: 'min-w-44' },
    { key: 'relatedOnlineStatus', label: 'Related Online Status', width: 'min-w-44' },
    { key: 'group', label: 'Group', width: 'min-w-28' },
    { key: 'mikrotikId', label: 'Mikrotik ID', width: 'min-w-32' },
    { key: 'sessionIP', label: 'Session IP', width: 'min-w-32' },
    { key: 'relatedBorrowedLogs', label: 'Related Borrowed Logs', width: 'min-w-44' },
    { key: 'relatedPlanChangeLogs', label: 'Related Plan Change Logs', width: 'min-w-48' },
    { key: 'relatedServiceChargeLogs', label: 'Related Service Charge Logs', width: 'min-w-48' },
    { key: 'relatedAdjustedAccountLogs', label: 'Related Adjusted Account Logs', width: 'min-w-52' },
    { key: 'referralContactNo', label: 'Referral Contact No.', width: 'min-w-40' },
    { key: 'logs', label: 'Logs', width: 'min-w-24' },
    { key: 'relatedSecurityDeposits', label: 'Related Security Deposits', width: 'min-w-48' },
    { key: 'relatedApprovedTransactions', label: 'Related Approved Transaction', width: 'min-w-52' },
    { key: 'relatedAttachments', label: 'Related Attachments', width: 'min-w-40' }
  ];

  // Fetch location data
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const [citiesData, regionsData] = await Promise.all([
          getCities(),
          getRegions()
        ]);
        setCities(citiesData || []);
        setRegions(regionsData || []);
      } catch (err) {
        console.error('Failed to fetch location data:', err);
        setCities([]);
        setRegions([]);
      }
    };
    
    fetchLocationData();
  }, []);

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoading(true);
        const data = await getBillingRecords();
        setBillingRecords(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch billing records:', err);
        setError('Failed to load billing records. Please try again.');
        setBillingRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBillingData();
  }, []);

  // Memoize city name lookup for performance
  const getCityName = useMemo(() => {
    const cityMap = new Map(cities.map(c => [c.id, c.name]));
    return (cityId: number | null | undefined): string => {
      if (!cityId) return 'Unknown City';
      return cityMap.get(cityId) || `City ${cityId}`;
    };
  }, [cities]);

  // Memoize location items for performance
  const locationItems: LocationItem[] = useMemo(() => {
    const items: LocationItem[] = [
      {
        id: 'all',
        name: 'All',
        count: billingRecords.length
      }
    ];
    
    // Add cities with counts
    cities.forEach((city) => {
      const cityCount = billingRecords.filter(record => record.cityId === city.id).length;
      items.push({
        id: String(city.id),
        name: city.name,
        count: cityCount
      });
    });

    return items;
  }, [cities, billingRecords]);

  // Memoize filtered records for performance
  const filteredBillingRecords = useMemo(() => {
    return billingRecords.filter(record => {
      const matchesLocation = selectedLocation === 'all' || 
                             record.cityId === Number(selectedLocation);
      
      const matchesSearch = searchQuery === '' || 
                           record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           record.applicationId.includes(searchQuery);
      
      return matchesLocation && matchesSearch;
    });
  }, [billingRecords, selectedLocation, searchQuery]);

  const handleRecordClick = (record: BillingRecord) => {
    setSelectedBilling(record);
  };

  const handleCloseDetails = () => {
    setSelectedBilling(null);
  };
  
  const renderCellValue = (record: BillingRecord, columnKey: string) => {
    switch (columnKey) {
      // Basic fields
      case 'status':
        return (
          <div className="flex items-center space-x-2">
            <Circle 
              className={`h-3 w-3 ${
                record.onlineStatus === 'Online' 
                  ? 'text-green-400 fill-green-400' 
                  : 'text-gray-400 fill-gray-400'
              }`} 
            />
            <span className={`text-xs ${
              record.onlineStatus === 'Online' 
                ? 'text-green-400' 
                : 'text-gray-400'
            }`}>
              {record.onlineStatus}
            </span>
          </div>
        );
      case 'billingStatus':
        return record.billingStatus || 'Active';
      case 'accountNo':
        return <span className="text-red-400">{record.applicationId}</span>;
      case 'dateInstalled':
        return record.dateInstalled || '-';
      case 'customerName':
        return record.customerName;
      case 'address':
        return <span title={record.address}>{record.address}</span>;
      case 'contactNumber':
        return record.contactNumber || '-';
      case 'emailAddress':
        return record.emailAddress || '-';
      case 'plan':
        return record.plan || '-';
      case 'balance':
        return `₱ ${record.balance.toFixed(2)}`;
      case 'username':
        return record.username || '-';
      case 'connectionType':
        return record.connectionType || '-';
      case 'routerModel':
        return record.routerModel || '-';
      case 'routerModemSN':
        return record.routerModemSN || '-';
      case 'lcpnap':
        return record.lcpnap || '-';
      case 'port':
        return record.port || '-';
      case 'vlan':
        return record.vlan || '-';
      case 'billingDay':
        return record.billingDay || '-';
      case 'totalPaid':
        return `₱ ${record.totalPaid?.toFixed(2) || '0.00'}`;
      case 'provider':
        return record.provider || '-';
      case 'lcp':
        return record.lcp || '-';
      case 'nap':
        return record.nap || '-';
      case 'modifiedBy':
        return record.modifiedBy || '-';
      case 'modifiedDate':
        return record.modifiedDate || '-';
      case 'barangay':
        return record.barangay || '-';
      case 'city':
        return record.city || '-';
      case 'region':
        return record.region || '-';
      
      // Fields from BillingDetailRecord
      case 'lcpnapport':
        return (record as any).lcpnapport || '-';
      case 'usageType':
        return (record as any).usageType || '-';
      case 'referredBy':
        return (record as any).referredBy || '-';
      case 'secondContactNumber':
        return (record as any).secondContactNumber || '-';
      case 'referrersAccountNumber':
        return (record as any).referrersAccountNumber || '-';
      case 'group':
        return (record as any).group || '-';
      case 'mikrotikId':
        return (record as any).mikrotikId || '-';
      case 'sessionIP':
        return (record as any).sessionIP || '-';
      case 'referralContactNo':
        return (record as any).referralContactNo || '-';
      
      // Related records - placeholders
      case 'relatedInvoices':
      case 'relatedStatementOfAccount':
      case 'relatedDiscounts':
      case 'relatedStaggeredInstallation':
      case 'relatedStaggeredPayments':
      case 'relatedOverdues':
      case 'relatedDCNotices':
      case 'relatedServiceOrders':
      case 'relatedDisconnectedLogs':
      case 'relatedReconnectionLogs':
      case 'relatedChangeDueLogs':
      case 'relatedTransactions':
      case 'relatedDetailsUpdateLogs':
      case 'relatedAdvancedPayments':
      case 'relatedPaymentPortalLogs':
      case 'relatedInventoryLogs':
      case 'relatedOnlineStatus':
      case 'relatedBorrowedLogs':
      case 'relatedPlanChangeLogs':
      case 'relatedServiceChargeLogs':
      case 'relatedAdjustedAccountLogs':
      case 'relatedSecurityDeposits':
      case 'relatedApprovedTransactions':
      case 'relatedAttachments':
      case 'logs':
        return '-';
      
      // Computed fields
      case 'computedAddress':
        return (record as any).computedAddress || 
               (record.address ? (record.address.length > 25 ? `${record.address.substring(0, 25)}...` : record.address) : '-');
      case 'computedStatus':
        return (record as any).computedStatus || 
               `${record.status || 'Inactive'} | P ${record.balance.toFixed(0)}`;
      case 'computedAccountNo':
        return (record as any).computedAccountNo || 
               `${record.applicationId} | ${record.customerName}${record.address ? (' | ' + record.address.substring(0, 10) + '...') : ''}`;
        
      default:
        return '-';
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await getBillingRecords();
      setBillingRecords(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh billing records:', err);
      setError('Failed to refresh billing records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Billing Details</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {locationItems.map((location) => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-800 ${
                selectedLocation === location.id
                  ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                  : 'text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="capitalize">{location.name}</span>
              </div>
              {location.count > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedLocation === location.id
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {location.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-gray-900 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search billing records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex space-x-2">
                <div className="relative z-50" ref={dropdownRef}>
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>{displayMode === 'card' ? 'Card View' : 'Table View'}</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="fixed right-auto mt-1 w-36 bg-gray-800 border border-gray-700 rounded shadow-lg">
                      <button
                        onClick={() => {
                          setDisplayMode('card');
                          setDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-700 ${displayMode === 'card' ? 'text-orange-500' : 'text-white'}`}
                      >
                        Card View
                      </button>
                      <button
                        onClick={() => {
                          setDisplayMode('table');
                          setDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-700 ${displayMode === 'table' ? 'text-orange-500' : 'text-white'}`}
                      >
                        Table View
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
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
                  <p className="mt-4">Loading billing records...</p>
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
              ) : displayMode === 'card' ? (
                filteredBillingRecords.length > 0 ? (
                  <div className="space-y-0">
                    {filteredBillingRecords.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => handleRecordClick(record)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800 ${selectedBilling?.id === record.id ? 'bg-gray-800' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-red-400 font-medium text-sm mb-1">
                              {record.applicationId} | {record.customerName} | {record.address}
                            </div>
                            <div className="text-white text-sm">
                              {record.status} | ₱ {record.balance.toFixed(0)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                            <Circle 
                              className={`h-3 w-3 ${record.onlineStatus === 'Online' ? 'text-green-400 fill-green-400' : 'text-gray-400 fill-gray-400'}`} 
                            />
                            <span className={`text-sm ${record.onlineStatus === 'Online' ? 'text-green-400' : 'text-gray-400'}`}>
                              {record.onlineStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No billing records found matching your filters
                  </div>
                )
              ) : (
                <div className="overflow-x-auto overflow-y-hidden">
                  <table className="w-max min-w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
                        {allColumns.map((column, index) => (
                          <th
                            key={column.key}
                            className={`text-left py-3 px-3 text-gray-400 font-normal bg-gray-800 ${column.width} whitespace-nowrap ${index < allColumns.length - 1 ? 'border-r border-gray-700' : ''}`}
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBillingRecords.length > 0 ? (
                        filteredBillingRecords.map((record) => (
                          <tr 
                            key={record.id} 
                            className={`border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors ${selectedBilling?.id === record.id ? 'bg-gray-800' : ''}`}
                            onClick={() => handleRecordClick(record)}
                          >
                            {allColumns.map((column, index) => (
                              <td 
                                key={column.key}
                                className={`py-4 px-3 text-white whitespace-nowrap ${index < allColumns.length - 1 ? 'border-r border-gray-800' : ''}`}
                              >
                                {renderCellValue(record, column.key)}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={allColumns.length} className="px-4 py-12 text-center text-gray-400 border-b border-gray-800">
                            No billing records found matching your filters
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

      {selectedBilling && (
        <div className="w-full max-w-3xl bg-gray-900 border-l border-gray-700 flex-shrink-0 relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded p-1"
            >
              <X size={20} />
            </button>
          </div>
          {displayMode === 'card' ? (
            <BillingDetails
              billingRecord={selectedBilling}
              onlineStatusRecords={[]}
            />
          ) : (
            <BillingListViewDetails
              billingRecord={selectedBilling}
              onlineStatusRecords={[]}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Billing;