import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, Tag, X } from 'lucide-react';
import StaggeredInstallationDetails from '../components/StaggeredInstallationDetails';

interface StaggeredInstallationRecord {
  id: string;
  fullName: string;
  amount: number;
  count: number;
  accountNo?: string;
  contactNumber?: string;
  emailAddress?: string;
  address?: string;
  plan?: string;
  provider?: string;
  staggeredInstallNo?: string;
  staggeredDate?: string;
  staggeredBalance?: number;
  monthsToPay?: number;
  monthlyPayment?: number;
  modifiedBy?: string;
  modifiedDate?: string;
  userEmail?: string;
  remarks?: string;
  barangay?: string;
  city?: string;
  completeAddress?: string;
}

// Mock service functions for the demo
const getStaggeredInstallationRecords = async (): Promise<StaggeredInstallationRecord[]> => {
  // In a real implementation, this would be an API call
  return [
    {
      id: '1',
      fullName: 'Cristina A Chavez',
      amount: 199.00,
      count: 1,
      accountNo: '202307241 | Cristina A Chavez | 0610 El Cerrero St, Macamot, Binangonan, Rizal',
      contactNumber: '9381921628',
      emailAddress: 'DelosSantosEduardo455@gmail.com',
      address: '0610 El Cerrero St',
      plan: 'SwitchNet - P999',
      provider: 'SWITCH',
      staggeredInstallNo: '202509072012450000',
      staggeredDate: '9/7/2025',
      staggeredBalance: 199.00,
      monthsToPay: 1,
      monthlyPayment: 199.00,
      modifiedBy: 'Cheryll Mae Briones',
      modifiedDate: '9/7/2025 8:12:45 PM',
      userEmail: 'cheryll.briones@switchfiber.ph',
      remarks: 'balance payment',
      barangay: 'Macamot',
      city: 'Binangonan'
    },
    {
      id: '2',
      fullName: 'Charish M Cinson',
      amount: 130.00,
      count: 1
    },
    {
      id: '3',
      fullName: 'Geraldine O Dacdac',
      amount: 150.00,
      count: 1
    }
  ];
};

const StaggeredInstallation: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaggeredInstallation, setSelectedStaggeredInstallation] = useState<StaggeredInstallationRecord | null>(null);
  const [staggeredInstallationRecords, setStaggeredInstallationRecords] = useState<StaggeredInstallationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data without location data since it's not needed in this component
  useEffect(() => {
    const fetchLocationData = async () => {
      // Not fetching location data anymore
    };
    
    // No need to call fetchLocationData since we don't use city/region data
  }, []);

  // Fetch staggered installation data
  useEffect(() => {
    const fetchStaggeredInstallationData = async () => {
      try {
        setIsLoading(true);
        const data = await getStaggeredInstallationRecords();
        setStaggeredInstallationRecords(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch staggered installation records:', err);
        setError('Failed to load staggered installation records. Please try again.');
        setStaggeredInstallationRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaggeredInstallationData();
  }, []);

  // Memoize filtered records for performance
  const filteredStaggeredInstallationRecords = useMemo(() => {
    return staggeredInstallationRecords.filter(record => {
      // Always pass location filter since we don't have location data
      const matchesLocation = true;
      
      const matchesSearch = searchQuery === '' || 
                         record.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesLocation && matchesSearch;
    });
  }, [staggeredInstallationRecords, searchQuery]);

  const handleRecordClick = (record: StaggeredInstallationRecord) => {
    setSelectedStaggeredInstallation(record);
  };

  const handleCloseDetails = () => {
    setSelectedStaggeredInstallation(null);
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await getStaggeredInstallationRecords();
      setStaggeredInstallationRecords(data);
      setError(null);
    } catch (err) {
      console.error('Failed to refresh staggered installation records:', err);
      setError('Failed to refresh staggered installation records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Staggered Installations</h2>
            <div>
              <button 
                className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                onClick={() => alert('Add new staggered installation')}
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
                  <p className="mt-4">Loading staggered installation records...</p>
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
                  {filteredStaggeredInstallationRecords.length > 0 ? (
                    filteredStaggeredInstallationRecords.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => handleRecordClick(record)}
                        className={`px-4 py-3 cursor-pointer transition-colors hover:bg-gray-800 border-b border-gray-800 ${selectedStaggeredInstallation?.id === record.id ? 'bg-gray-800' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {record.fullName}
                            </div>
                            <div className="text-white">
                              ₱{record.amount.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-white text-sm mr-4">
                            {record.count}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No staggered installation records found matching your filters
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedStaggeredInstallation && (
        <div className="w-full max-w-3xl bg-gray-900 border-l border-gray-700 flex-shrink-0 relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded p-1"
            >
              <X size={20} />
            </button>
          </div>
          <StaggeredInstallationDetails
            staggeredInstallationRecord={selectedStaggeredInstallation}
          />
        </div>
      )}
    </div>
  );
};

export default StaggeredInstallation;