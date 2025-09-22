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
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const Billing: React.FC = () => {
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
            timestamp: '2023-08-02'
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
            timestamp: '2023-08-02'
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

  const handleRecordClick = (record: BillingRecord) => {
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
                <div className="space-y-0">
                  {filteredBillingRecords.length > 0 ? (
                    filteredBillingRecords.map((record) => (
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
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No billing records found matching your filters
                    </div>
                  )}
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

export default Billing;