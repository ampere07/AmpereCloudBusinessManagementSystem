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
  const [locationDataLoaded, setLocationDataLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cities and regions data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const [citiesData, regionsData] = await Promise.all([
          getCities(),
          getRegions()
        ]);
        setCities(citiesData || []);
        setRegions(regionsData || []);
        setLocationDataLoaded(true);
      } catch (err) {
        console.error('Failed to fetch location data:', err);
        setCities([]);
        setRegions([]);
        setLocationDataLoaded(true);
      }
    };
    
    fetchLocationData();
  }, []);

  // Helper functions to get names from IDs
  const getCityName = (cityId: number | null | undefined): string => {
    if (!cityId) return 'Unknown City';
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : `City ${cityId}`;
  };

  const getRegionName = (regionId: number | null | undefined): string => {
    if (!regionId) return 'Unknown Region';
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : `Region ${regionId}`;
  };

  // Sample billing data - Replace with API call in production
  useEffect(() => {
    if (!locationDataLoaded) return;
    
    // Simulate API call
    const fetchBillingRecords = async () => {
      try {
        setIsLoading(true);
        
        // Sample data matching the screenshot format
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
          },
          {
            id: '3',
            applicationId: '202308027',
            customerName: 'Shane Clarisse E Rodriguez',
            address: '489 Camias St Sitio Bicol Dalig, Batingan, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '4',
            applicationId: '202308026',
            customerName: 'Michelle L Vergara',
            address: 'Block 26 Lot 11 Mabuhay Homes Phase 1B, Pantok, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '5',
            applicationId: '202308025',
            customerName: 'Mark Leo M Mutuc',
            address: '9 Grana St, Macamot, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '6',
            applicationId: '202308024',
            customerName: 'Junmar E Carmen',
            address: '0672 Katipunan St, Calumpang, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '7',
            applicationId: '202308023',
            customerName: 'Mary Rose A Dulay',
            address: '476 Zamora St, Libid, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '8',
            applicationId: '202308022',
            customerName: 'Orlando II M Rivera',
            address: '232 P Gomez St, Libis, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '9',
            applicationId: '202308021',
            customerName: 'Mary Lhovely A Rabuelas',
            address: '91 Osmeria St, Layunan, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '10',
            applicationId: '202308020',
            customerName: 'Restor P Baisa',
            address: '0 C. Aquino St, Lunsad, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-02'
          },
          {
            id: '11',
            applicationId: '202308019',
            customerName: 'Rosalie C Abanes',
            address: '1354 Upper Grana St, Macamot, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-01'
          },
          {
            id: '12',
            applicationId: '202308018',
            customerName: 'Esperanza S Rueda',
            address: '1246 Katipunan St, Calumpang, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-01'
          },
          {
            id: '13',
            applicationId: '202308017',
            customerName: 'Dionel C Era',
            address: '292 J. P. Rizal St, Lunsad, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-01'
          },
          {
            id: '14',
            applicationId: '202308016',
            customerName: 'Jenelyn A Bernal',
            address: '0461 Camias St Dalig, Batingan, Binangonan, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 1,
            regionId: 1,
            timestamp: '2023-08-01'
          },
          {
            id: '15',
            applicationId: '202308015',
            customerName: 'Sample Customer Angono',
            address: 'Sample Address, Angono, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Online',
            cityId: 2,
            regionId: 1,
            timestamp: '2023-08-01'
          },
          {
            id: '16',
            applicationId: '202308014',
            customerName: 'Sample Customer Cardona',
            address: 'Sample Address, Cardona, Rizal',
            status: 'Active',
            balance: 0,
            onlineStatus: 'Offline',
            cityId: 3,
            regionId: 1,
            timestamp: '2023-08-01'
          }
        ];
        
        setBillingRecords(sampleData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch billing records:', err);
        setError('Failed to load billing records. Please try again.');
        setBillingRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingRecords();
  }, [locationDataLoaded]);

  // Generate location items with counts from cities data
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: billingRecords.length
    }
  ];
  
  // Add specific cities based on actual data in billingRecords
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

  // Filter billing records based on location and search query
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
      {/* Location Sidebar Container */}
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
              onClick={() => {
                setSelectedLocation(location.id);
              }}
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

      {/* Billing Records List */}
      <div className="flex-1 bg-gray-900 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Search Bar */}
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
          
          {/* Billing Records List Container */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pb-4">
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
                <div className="divide-y divide-gray-800">
                  {filteredBillingRecords.length > 0 ? (
                    filteredBillingRecords.map((record) => (
                      <div 
                        key={record.id} 
                        className={`hover:bg-gray-800 cursor-pointer ${
                          selectedBilling?.id === record.id ? 'bg-gray-800 border-r-2 border-orange-500' : ''
                        }`}
                        onClick={() => handleRowClick(record)}
                      >
                        <div className="p-4 flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div className="text-red-400 font-medium">
                                {record.applicationId} | {record.customerName} | {record.address}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Circle 
                                  className={`h-3 w-3 ${
                                    record.onlineStatus === 'Online' 
                                      ? 'text-green-400 fill-green-400' 
                                      : 'text-yellow-400 fill-yellow-400'
                                  }`} 
                                />
                                <span className={`text-xs ${
                                  record.onlineStatus === 'Online' 
                                    ? 'text-green-400' 
                                    : 'text-yellow-400'
                                }`}>
                                  {record.onlineStatus}
                                </span>
                              </div>
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                              {record.status} | P {record.balance}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-12 text-center text-gray-400">
                      No billing records found matching your filters
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Details Panel */}
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
