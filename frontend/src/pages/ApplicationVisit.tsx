import React, { useState } from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';
import ApplicationVisitDetails from '../components/ApplicationVisitDetails';

interface ApplicationVisit {
  id: string;
  timestamp: string;
  fullName: string;
  assignedEmail: string;
  visitStatus: string;
  applicationStatus: string;
  statusRemarks: string;
  referredBy: string;
  fullAddress: string;
  visitBy: string;
  visitWith: string;
  visitWithOther: string;
  visitRemarks: string;
  modifiedDate: string;
  modifiedBy: string;
  location: string;
  contactNumber: string;
  secondContactNumber: string;
  applicantEmail: string;
  choosePlan: string;
  remarks: string;
  installationLandmark: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const ApplicationVisit: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVisit, setSelectedVisit] = useState<ApplicationVisit | null>(null);

  // Mock data for application visits
  const applicationVisits: ApplicationVisit[] = [
    {
      id: '1',
      timestamp: '09/19/2025 10:20:09',
      fullName: 'John H Doe',
      assignedEmail: 'tech1@amperecloud.com',
      visitStatus: 'Scheduled',
      applicationStatus: 'Pending',
      statusRemarks: 'Waiting for customer confirmation',
      referredBy: 'Maria Garcia',
      fullAddress: '123 Main St, Sample City, Metro Manila',
      visitBy: 'John Denver Dones',
      visitWith: 'Leonardo Bayos',
      visitWithOther: 'NONE',
      visitRemarks: 'Customer requested evening installation',
      modifiedDate: '09/18/2025 15:30:22',
      modifiedBy: 'gibson.lizardo@switchfiber.ph',
      location: 'binangonan',
      contactNumber: '9123456789',
      secondContactNumber: '9987654321',
      applicantEmail: 'gibson.lizardo@switchfiber.ph',
      choosePlan: 'SwitchUltra - P1499',
      remarks: 'Test',
      installationLandmark: '14TPmdECiNtyEVDfDEiqMdKZ1vExHi9nK'
    },
    {
      id: '2',
      timestamp: '09/19/2025 11:30:15',
      fullName: 'Jane M Smith',
      assignedEmail: 'Office',
      visitStatus: 'Completed',
      applicationStatus: 'Done',
      statusRemarks: 'Installation completed successfully',
      referredBy: 'None',
      fullAddress: '456 Oak St, Sample Town, Metro Manila',
      visitBy: 'Maria Santos',
      visitWith: 'Paulo Reyes',
      visitWithOther: 'NONE',
      visitRemarks: 'No issues during installation',
      modifiedDate: '06/27/2025 8:11:52 AM',
      modifiedBy: 'gibson.lizardo@switchfiber.ph',
      location: 'binangonan',
      contactNumber: '9123456789',
      secondContactNumber: '9123456789',
      applicantEmail: 'gibson.lizardo@switchfiber.ph',
      choosePlan: 'SwitchUltra - P1499',
      remarks: 'Test',
      installationLandmark: '14TPmdECiNtyEVDfDEiqMdKZ1vExHi9nK'
    },
    {
      id: '3',
      timestamp: '6/26/2025 5:57:55 PM',
      fullName: 'Test Account',
      assignedEmail: 'Office',
      visitStatus: 'Pending',
      applicationStatus: 'Done',
      statusRemarks: 'Checking service availability',
      referredBy: 'None',
      fullAddress: '123 Test, Batinigan, Binangonan, Rizal',
      visitBy: 'Unassigned',
      visitWith: 'Unassigned',
      visitWithOther: 'NONE',
      visitRemarks: '',
      modifiedDate: '06/27/2025 8:11:52 AM',
      modifiedBy: 'gibson.lizardo@switchfiber.ph',
      location: 'binangonan',
      contactNumber: '9123456789',
      secondContactNumber: '9123456789',
      applicantEmail: 'gibson.lizardo@switchfiber.ph',
      choosePlan: 'SwitchUltra - P1499',
      remarks: 'Test',
      installationLandmark: '14TPmdECiNtyEVDfDEiqMdKZ1vExHi9nK'
    }
  ];

  // Generate location items with counts
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: applicationVisits.length
    },
    {
      id: 'binangonan',
      name: 'Binangonan',
      count: applicationVisits.filter(visit => visit.location === 'binangonan').length
    },
    {
      id: 'cardona',
      name: 'Cardona',
      count: applicationVisits.filter(visit => visit.location === 'cardona').length
    },
    {
      id: 'taytay',
      name: 'Taytay',
      count: applicationVisits.filter(visit => visit.location === 'taytay').length
    },
    {
      id: 'las-pinas',
      name: 'Las Piñas',
      count: applicationVisits.filter(visit => visit.location === 'las-pinas').length
    }
  ];

  // Filter application visits based on location and search query
  const filteredVisits = applicationVisits.filter(visit => {
    const matchesLocation = selectedLocation === 'all' || 
                           visit.location === selectedLocation;
    
    const matchesSearch = searchQuery === '' || 
                         visit.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         visit.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         visit.assignedEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

  const handleRowClick = (visit: ApplicationVisit) => {
    setSelectedVisit(visit);
  };

  // Status text color component
  const StatusText = ({ status, type }: { status: string, type: 'visit' | 'application' }) => {
    let textColor = '';
    
    if (type === 'visit') {
      switch (status.toLowerCase()) {
        case 'completed':
          textColor = 'text-green-500';
          break;
        case 'scheduled':
          textColor = 'text-yellow-500';
          break;
        case 'pending':
          textColor = 'text-blue-500';
          break;
        case 'cancelled':
          textColor = 'text-red-500';
          break;
        default:
          textColor = 'text-gray-400';
      }
    } else {
      switch (status.toLowerCase()) {
        case 'approved':
          textColor = 'text-green-500';
          break;
        case 'pending':
          textColor = 'text-yellow-500';
          break;
        case 'under review':
          textColor = 'text-blue-500';
          break;
        case 'rejected':
          textColor = 'text-red-500';
          break;
        default:
          textColor = 'text-gray-400';
      }
    }
    
    return (
      <span className={`${textColor} capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Location Sidebar Container */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-white">Application Visits</h2>
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
                <FileText className="h-4 w-4 mr-2" />
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

      {/* Application Visits List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden ${selectedVisit ? 'flex-1' : 'flex-1'}`}>
        {/* Search Bar */}
        <div className="bg-gray-900 p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search application visits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <button className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 flex items-center">
              <span className="mr-2">Filter</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Table Container */}
        <div className="overflow-auto" style={{ height: "calc(100vh - 130px)" }}>
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Timestamp
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Full Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Assigned Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Visit Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Application Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status Remarks
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Referred By
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Full Address
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Visit By
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Visit With
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr 
                    key={visit.id} 
                    className={`hover:bg-gray-800 cursor-pointer ${selectedVisit?.id === visit.id ? 'bg-gray-800' : ''}`}
                    onClick={() => handleRowClick(visit)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {visit.timestamp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {visit.fullName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {visit.assignedEmail}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusText status={visit.visitStatus} type="visit" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusText status={visit.applicationStatus} type="application" />
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                      {visit.statusRemarks}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {visit.referredBy}
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                      {visit.fullAddress}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {visit.visitBy}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {visit.visitWith}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                    No application visits found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Visit Detail View - Only visible when a visit is selected */}
      {selectedVisit && (
        <div className="flex-1 overflow-hidden">
          <ApplicationVisitDetails 
            applicationVisit={{
              id: selectedVisit.id,
              fullName: selectedVisit.fullName,
              timestamp: selectedVisit.timestamp,
              referredBy: selectedVisit.referredBy,
              contactNumber: selectedVisit.contactNumber,
              secondContactNumber: selectedVisit.secondContactNumber,
              applicantEmail: selectedVisit.applicantEmail,
              fullAddress: selectedVisit.fullAddress,
              choosePlan: selectedVisit.choosePlan,
              remarks: selectedVisit.remarks,
              installationLandmark: selectedVisit.installationLandmark,
              assignedEmail: selectedVisit.assignedEmail,
              applicationStatus: selectedVisit.applicationStatus,
              modifiedBy: selectedVisit.modifiedBy,
              modifiedDate: selectedVisit.modifiedDate
            }} 
            onClose={() => setSelectedVisit(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ApplicationVisit;