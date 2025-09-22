import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Circle, X } from 'lucide-react';
import { getCities, City } from '../services/cityService';
import { getRegions, Region } from '../services/regionService';
import BillingDetails from '../components/BillingDetails';

interface BillingRecord {
  id: string;
  applicationId: string;
  customerName: string;
  address: string;
  status: 'Active' | 'Inactive';
  balance: number;
  onlineStatus: 'Online' | 'Offline';
  cityId?: number | null;
  regionId?: number | null;
  timestamp?: string;
  billingStatus?: string;
  dateInstalled?: string;
  contactNumber?: string;
  emailAddress?: string;
  plan?: string;
  username?: string;
  connectionType?: string;
  routerModel?: string;
  routerModemSN?: string;
  lcpnap?: string;
  port?: string;
  vlan?: string;
  billingDay?: number;
  totalPaid?: number;
  provider?: string;
  lcp?: string;
  nap?: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const BillingListView: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBilling, setSelectedBilling] = useState<BillingRecord | null>(null);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        
        const [citiesData, regionsData] = await Promise.all([
          getCities().catch(() => []),
          getRegions().catch(() => [])
        ]);
        
        setCities(citiesData || []);
        setRegions(regionsData || []);
        
        const sampleData: BillingRecord[] = [
          {
            id: '1',
            applicationId: '202308029',
            customerName: 'Joan S Vergara',
            address: 'Block 78 Lot 16 Mabuhay Homes Phase 2A, Darangan, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02',
            billingStatus: 'Active',
            dateInstalled: '9/18/2025',
            contactNumber: '9673808916',
            emailAddress: 'franckiepernyra18@gmail.com',
            plan: 'SwitchLite - P699',
            username: 'vergarajp317251011',
            connectionType: 'Fiber',
            routerModel: 'UT-XPo48c-S',
            routerModemSN: 'Sisco7992fffd',
            lcpnap: 'LCP 195 NAP 00',
            port: 'PORT 004',
            vlan: '1000',
            billingDay: 23,
            totalPaid: 0,
            provider: 'SWITCH',
            lcp: 'LCP 195',
            nap: 'NAP 00'
          },
          {
            id: '2',
            applicationId: '202308028',
            customerName: 'Wesley U Aragones',
            address: '75 C. Bolado Ave, Tatala, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Offline',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02',
            billingStatus: 'Active',
            dateInstalled: '9/18/2025',
            contactNumber: '9359727692',
            emailAddress: 'wesleyaragones07@gmail.com',
            plan: 'SwitchLite - P699',
            username: 'aragonesw918251332',
            connectionType: 'Fiber',
            routerModel: 'UT-XPo48c-S',
            routerModemSN: 'Sisco7992ffb5',
            lcpnap: 'LCP 113 NAP 00',
            port: 'PORT 007',
            vlan: '1000',
            billingDay: 23,
            totalPaid: 0,
            provider: 'SWITCH',
            lcp: 'LCP 113',
            nap: 'NAP 00'
          }
        ];
        
        setBillingRecords(sampleData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load billing records. Please try again.');
        setBillingRecords([]);
        setCities([]);
        setRegions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const getCityName = (cityId: number | null | undefined): string => {
    if (!cityId) return 'Unknown City';
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: billingRecords.length
    }
  ];
  
  const cityNames = ['Angono', 'Binangonan', 'Cardona'];
  cityNames.forEach((cityName) => {
    const cityData = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    const cityCount = billingRecords.filter(record => 
      cityData ? record.cityId === cityData.id : false
    ).length;
    
    locationItems.push({
      id: cityData ? String(cityData.id) : cityName.toLowerCase(),
      name: cityName,
      count: cityCount
    });
  });

  const filteredBillingRecords = billingRecords.filter(record => {
    const matchesLocation = selectedLocation === 'all' || 
                           record.cityId === Number(selectedLocation) ||
                           (selectedLocation === 'angono' && getCityName(record.cityId).toLowerCase() === 'angono') ||
                           (selectedLocation === 'binangonan' && getCityName(record.cityId).toLowerCase() === 'binangonan') ||
                           (selectedLocation === 'cardona' && getCityName(record.cityId).toLowerCase() === 'cardona');
    
    const matchesSearch = searchQuery === '' || 
                         record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.applicationId.includes(searchQuery);
    
    return matchesLocation && matchesSearch;
  });

  const handleRowClick = (record: BillingRecord) => {
    setSelectedBilling(record);
  };

  const handleCloseDetails = () => {
    setSelectedBilling(null);
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Billing List View</h2>
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
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">
                    Retry
                  </button>
                </div>
              ) : (
                <div className="overflow-x-scroll overflow-y-hidden">
                  <table className="w-max min-w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-28 whitespace-nowrap">Status</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-28 whitespace-nowrap">Billing Status</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-32 whitespace-nowrap">Account No.</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-28 whitespace-nowrap">Date Installed</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-40 whitespace-nowrap">Full Name</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-56 whitespace-nowrap">Address</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-36 whitespace-nowrap">Contact Number</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-48 whitespace-nowrap">Email Address</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-40 whitespace-nowrap">Plan</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-32 whitespace-nowrap">Account Balance</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-32 whitespace-nowrap">Username</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-36 whitespace-nowrap">Connection Type</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-32 whitespace-nowrap">Router Model</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-36 whitespace-nowrap">Router/Modem SN</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-32 whitespace-nowrap">LCPNAP</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-28 whitespace-nowrap">PORT</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-24 whitespace-nowrap">VLAN</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-28 whitespace-nowrap">Billing Day</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-28 whitespace-nowrap">Total Paid</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal border-r border-gray-700 bg-gray-800 min-w-24 whitespace-nowrap">Provider</th>
                        <th className="text-left py-3 px-3 text-gray-400 font-normal bg-gray-800 min-w-24 whitespace-nowrap">LCP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBillingRecords.length > 0 ? (
                        filteredBillingRecords.map((record) => (
                          <tr 
                            key={record.id} 
                            className={`border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors ${
                              selectedBilling?.id === record.id ? 'bg-gray-800' : ''
                            }`}
                            onClick={() => handleRowClick(record)}
                          >
                            <td className="py-4 px-3 border-r border-gray-800 whitespace-nowrap">
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
                            </td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.billingStatus || 'Active'}</td>
                            <td className="py-4 px-3 text-red-400 border-r border-gray-800 whitespace-nowrap">{record.applicationId}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.dateInstalled || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.customerName}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap" title={record.address}>{record.address}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.contactNumber || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.emailAddress || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.plan || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">₱ {record.balance.toFixed(2)}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.username || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.connectionType || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.routerModel || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.routerModemSN || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.lcpnap || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.port || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.vlan || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.billingDay || '-'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">₱ {record.totalPaid?.toFixed(2) || '0.00'}</td>
                            <td className="py-4 px-3 text-white border-r border-gray-800 whitespace-nowrap">{record.provider || '-'}</td>
                            <td className="py-4 px-3 text-white whitespace-nowrap">{record.lcp || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={21} className="px-4 py-12 text-center text-gray-400">
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
          <BillingDetails
            billingRecord={selectedBilling}
            onlineStatusRecords={[]}
          />
        </div>
      )}
    </div>
  );
};

export default BillingListView;