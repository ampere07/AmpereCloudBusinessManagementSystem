import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, Tag, X } from 'lucide-react';
import AdvancePaymentDetails from '../components/AdvancePaymentDetails';

interface AdvancePaymentRecord {
  id: string;
  fullName: string;
  dateTime: string;
  amount: number;
  contactNumber?: string;
  emailAddress?: string;
  plan?: string;
  provider?: string;
  paymentNo?: string;
  paymentDate?: string;
  paymentForMonthOf?: string;
  receivedPayment?: number;
  receivedBy?: string;
  status?: string;
  paymentMethod?: string;
  referenceNo?: string;
  orNo?: string;
}

  // Mock service functions for the demo
const getAdvancePaymentRecords = async (): Promise<AdvancePaymentRecord[]> => {
  // In a real implementation, this would be an API call
  return [
    {
      id: '1',
      fullName: 'Divina B Calavo',
      dateTime: '7/6/2024 1:33:54 PM',
      amount: 500.00,
      contactNumber: '9564410416',
      emailAddress: 'divinedosdos@gmail.com',
      plan: 'SwitchLite - P699',
      provider: 'SWITCH',
      paymentNo: '202407000000000',
      paymentDate: '7/6/2024 1:33:54 PM',
      paymentForMonthOf: 'July',
      receivedPayment: 500.00,
      receivedBy: 'Cheryll Mae Briones',
      status: 'Used',
      paymentMethod: 'Cash',
      referenceNo: 'switchjune0174',
      orNo: 'switchjune0174'
    },
    {
      id: '2',
      fullName: 'Lourdes A Espiritu',
      dateTime: '2/25/2025 1:25:52 PM',
      amount: 400.00,
      contactNumber: '9152187456',
      emailAddress: 'lourdes.espiritu@example.com',
      plan: 'SwitchLite - P699',
      provider: 'SWITCH',
      paymentNo: '202502000000001',
      paymentDate: '2/25/2025 1:25:52 PM',
      paymentForMonthOf: 'February',
      receivedPayment: 400.00,
      receivedBy: 'Cheryll Mae Briones',
      status: 'Used',
      paymentMethod: 'Cash',
      referenceNo: 'switchfeb0225',
      orNo: 'switchfeb0225'
    }
  ];
};

const AdvancePayment: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAdvancePayment, setSelectedAdvancePayment] = useState<AdvancePaymentRecord | null>(null);
  const [advancePaymentRecords, setAdvancePaymentRecords] = useState<AdvancePaymentRecord[]>([]);
  // Not used anymore
  // const [cities, setCities] = useState<any[]>([]);
  // const [regions, setRegions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data without location data since it's not needed in this component
  useEffect(() => {
    const fetchLocationData = async () => {
      // Not fetching location data anymore
    };
    
    // No need to call fetchLocationData since we don't use city/region data
  }, []);

  // Fetch advance payment data
  useEffect(() => {
    const fetchAdvancePaymentData = async () => {
      try {
        setIsLoading(true);
        const data = await getAdvancePaymentRecords();
        setAdvancePaymentRecords(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch advance payment records:', err);
        setError('Failed to load advance payment records. Please try again.');
        setAdvancePaymentRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdvancePaymentData();
  }, []);

  // Not needed anymore since we don't use city data
  // const getCityName = useMemo(() => {
  //   const cityMap = new Map(cities.map(c => [c.id, c.name]));
  //   return (cityId: number | null | undefined): string => {
  //     if (!cityId) return 'Unknown City';
  //     return cityMap.get(cityId) || `City ${cityId}`;
  //   };
  // }, [cities]);

  // No longer needed, removed locationItems logic
  // const locationItems: LocationItem[] = useMemo(() => {
  //   const items: LocationItem[] = [
  //     {
  //       id: 'all',
  //       name: 'All',
  //       count: advancePaymentRecords.length
  //     }
  //   ];
    
  //   // Since we don't have cityId in our data anymore, we'll just return the 'All' option
  //   return items;
  // }, [advancePaymentRecords]);

  // Memoize filtered records for performance
  const filteredAdvancePaymentRecords = useMemo(() => {
    return advancePaymentRecords.filter(record => {
      // Always pass location filter since we don't have location data
      const matchesLocation = true;
      
      const matchesSearch = searchQuery === '' || 
                         record.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesLocation && matchesSearch;
    });
  }, [advancePaymentRecords, searchQuery]);

  const handleRecordClick = (record: AdvancePaymentRecord) => {
    setSelectedAdvancePayment(record);
  };

  const handleCloseDetails = () => {
    setSelectedAdvancePayment(null);
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await getAdvancePaymentRecords();
      setAdvancePaymentRecords(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh advance payment records:', err);
      setError('Failed to refresh advance payment records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Advance Payments</h2>
            <div>
              <button 
                className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                onClick={() => alert('Add new advance payment')}
              >
                <span className="font-bold">+</span>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <button
            key="all"
            onClick={() => setSelectedLocation('all')}
            className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-800 bg-orange-500 bg-opacity-20 text-orange-400"
          >
            <span>All</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-950 overflow-hidden">
        {/* Main content without the search bar */}
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-12 text-center text-gray-400">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-1/3 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
                  </div>
                  <p className="mt-4">Loading advance payment records...</p>
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
                  {filteredAdvancePaymentRecords.length > 0 ? (
                    filteredAdvancePaymentRecords.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => handleRecordClick(record)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800 ${selectedAdvancePayment?.id === record.id ? 'bg-gray-800' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium">
                              {record.fullName}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {record.dateTime}
                            </div>
                          </div>
                          <div className="flex items-center ml-4 flex-shrink-0">
                            <span className="text-white">
                              ₱{record.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No advance payment records found matching your filters
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedAdvancePayment && (
        <div className="w-full max-w-3xl bg-gray-900 border-l border-gray-700 flex-shrink-0 relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded p-1"
            >
              <X size={20} />
            </button>
          </div>
          <AdvancePaymentDetails
            advancePaymentRecord={selectedAdvancePayment}
          />
        </div>
      )}
    </div>
  );
};

export default AdvancePayment;