import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Filter, Search, X } from 'lucide-react';
import SMSBlastDetails from '../components/SMSBlastDetails';

interface SMSBlastRecord {
  id: string;
  barangay: string;
  city: string;
  message: string;
  modifiedDate: string;
  modifiedEmail: string;
  userEmail: string;
}

const SMSBlast: React.FC = () => {
  const [smsBlastRecords, setSmsBlastRecords] = useState<SMSBlastRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SMSBlastRecord[]>([]);
  const [selectedBarangay, setSelectedBarangay] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSMSBlast, setSelectedSMSBlast] = useState<SMSBlastRecord | null>(null);

  const barangayFilters = ['All', 'Pila Pila', 'Lunsad', 'Libid'];
  const cityFilters = ['All', 'Binangonan'];

  // Fetch SMS blast data
  useEffect(() => {
    const fetchSMSBlastData = async () => {
      try {
        setIsLoading(true);
        
        // This would be an API call in a real implementation
        // For now, we'll use mock data
        setTimeout(() => {
          const mockData: SMSBlastRecord[] = [
            {
              id: '1',
              barangay: 'All',
              city: 'All',
              message: 'NOTICE TO THE PUBLIC This is to inform everyone that Mr. ELMER F. SOLIMAN, former Sales Agent is no longer employed to our company...',
              modifiedDate: '6/29/2024 9:38:30 AM',
              modifiedEmail: 'heatherlynn.hernandez@switchfib...',
              userEmail: 'heatherlynn.hernandez@switchfib...'
            },
            {
              id: '2',
              barangay: 'Pila Pila',
              city: 'Binangonan',
              message: 'CUSTOMER ADVISORY Our customers in the affected areas of Barangay Libid, Lunsad and Pila pila will experience degraded or no...',
              modifiedDate: '5/22/2024 7:22:57 PM',
              modifiedEmail: 'heatherlynn.hernandez@switchfib...',
              userEmail: 'heatherlynn.hernandez@switchfib...'
            },
            {
              id: '3',
              barangay: 'Lunsad',
              city: 'Binangonan',
              message: 'CUSTOMER ADVISORY Our customers in the affected areas of Barangay Libid, Lunsad and Pila pila will experience degraded or no...',
              modifiedDate: '5/22/2024 7:22:38 PM',
              modifiedEmail: 'heatherlynn.hernandez@switchfib...',
              userEmail: 'heatherlynn.hernandez@switchfib...'
            },
            {
              id: '4',
              barangay: 'Libid',
              city: 'Binangonan',
              message: 'CUSTOMER ADVISORY Our customers in the affected areas of Barangay Libid, Lunsad and Pila pila will experience degraded or no...',
              modifiedDate: '5/22/2024 7:21:16 PM',
              modifiedEmail: 'heatherlynn.hernandez@switchfib...',
              userEmail: 'heatherlynn.hernandez@switchfib...'
            },
            {
              id: '5',
              barangay: 'All',
              city: 'All',
              message: '⚠️ CUSTOMER ADVISORY ⚠️ To our valued subscribers: We\'d like to inform you that Switch Fiber will be performing security maint...',
              modifiedDate: '12/28/2023 1:29:37 PM',
              modifiedEmail: 'heatherlynn.hernandez@switchfib...',
              userEmail: 'heatherlynn.hernandez@switchfib...'
            },
            {
              id: '6',
              barangay: 'All',
              city: 'All',
              message: 'NETWORK ADVISORY To our valued subscribers: This is to inform you that the emergency maintenance is successfully complete...',
              modifiedDate: '12/13/2023 11:21:00 AM',
              modifiedEmail: 'hhernandez.support@switchfiber.ph',
              userEmail: 'hhernandez.support@switchfiber.ph'
            },
            {
              id: '7',
              barangay: 'All',
              city: 'All',
              message: 'MAINTENANCE ADVISORY To our valued subscribers: As part of our emergency maintenance, we will be migrating affected subsc...',
              modifiedDate: '12/12/2023 9:09:18 PM',
              modifiedEmail: 'gibson.lizardo@switchfiber.ph',
              userEmail: 'gibson.lizardo@switchfiber.ph'
            },
            {
              id: '8',
              barangay: 'All',
              city: 'All',
              message: 'MAINTENANCE ADVISORY December 12, 2023 To our valued subscribers: We\'d like to inform you that Switch Fiber will be perform...',
              modifiedDate: '12/12/2023 5:12:56 PM',
              modifiedEmail: 'hhernandez.support@switchfiber.ph',
              userEmail: 'hhernandez.support@switchfiber.ph'
            },
            {
              id: '9',
              barangay: 'All',
              city: 'All',
              message: 'This is Switch Fiber Service Advisory: Sorry for the inconvenience. We are presently having technical issues that may be affecting...',
              modifiedDate: '12/11/2023 6:21:30 PM',
              modifiedEmail: 'hhernandez.support@switchfiber.ph',
              userEmail: 'hhernandez.support@switchfiber.ph'
            },
            {
              id: '10',
              barangay: 'All',
              city: 'All',
              message: 'This is Switch Fiber Service Advisory: Sorry for the inconvenience. We are presently having technical issues that may be affecting...',
              modifiedDate: '12/11/2023 11:28:15 AM',
              modifiedEmail: 'hhernandez.support@switchfiber.ph',
              userEmail: 'hhernandez.support@switchfiber.ph'
            }
          ];
          
          setSmsBlastRecords(mockData);
          setFilteredRecords(mockData);
          setError(null);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to fetch SMS Blast records:', err);
        setError('Failed to load SMS Blast records. Please try again.');
        setSmsBlastRecords([]);
        setFilteredRecords([]);
        setIsLoading(false);
      }
    };
    
    fetchSMSBlastData();
  }, []);

  // Filter records when filter criteria or search query changes
  useEffect(() => {
    if (smsBlastRecords.length === 0) return;
    
    let filtered = [...smsBlastRecords];
    
    // Filter by barangay
    if (selectedBarangay !== 'All') {
      filtered = filtered.filter(record => record.barangay === selectedBarangay);
    }
    
    // Filter by city
    if (selectedCity !== 'All') {
      filtered = filtered.filter(record => record.city === selectedCity);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.message.toLowerCase().includes(query) || 
        record.modifiedEmail.toLowerCase().includes(query) || 
        record.userEmail.toLowerCase().includes(query)
      );
    }
    
    setFilteredRecords(filtered);
  }, [smsBlastRecords, selectedBarangay, selectedCity, searchQuery]);

  const handleBarangayFilter = (barangay: string) => {
    setSelectedBarangay(barangay);
  };

  const handleCityFilter = (city: string) => {
    setSelectedCity(city);
  };

  const handleAddNew = () => {
    alert('Add new SMS Blast clicked');
  };

  const handleRecordClick = (record: SMSBlastRecord) => {
    setSelectedSMSBlast(record);
  };

  const handleCloseDetails = () => {
    setSelectedSMSBlast(null);
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">SMS Blast</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleAddNew}
              className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
            <button className="p-2 bg-gray-800 rounded hover:bg-gray-700">
              <Filter size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Main content with table */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-400">Loading SMS Blast records...</div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      barangay
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      city
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      message
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      modified date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      modified email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      user email
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-800 cursor-pointer" onClick={() => handleRecordClick(record)}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {record.barangay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {record.city}
                      </td>
                      <td className="px-6 py-4 text-sm text-white max-w-md truncate">
                        {record.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {record.modifiedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {record.modifiedEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {record.userEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRecords.length === 0 && (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-400">No SMS Blast records found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Details panel that slides in from the right */}
      {selectedSMSBlast && (
        <div className="w-full max-w-3xl bg-gray-900 border-l border-gray-700 flex-shrink-0 relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCloseDetails}
              className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded p-1"
            >
              <X size={20} />
            </button>
          </div>
          <SMSBlastDetails
            smsBlastRecord={selectedSMSBlast}
          />
        </div>
      )}
    </div>
  );
};

export default SMSBlast;