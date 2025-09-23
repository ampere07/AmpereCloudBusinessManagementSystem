import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Search, Circle, X } from 'lucide-react';
import BillingDetails from '../components/BillingDetails';
import { getBillingRecords, BillingRecord } from '../services/billingService';
import { getCities, City } from '../services/cityService';
import { getRegions, Region } from '../services/regionService';

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

  // Fetch location data
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
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
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