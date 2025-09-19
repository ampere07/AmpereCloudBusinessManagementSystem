import React, { useState } from 'react';
import { FileText, Search, ChevronDown } from 'lucide-react';
import ApplicationDetails from '../components/ApplicationDetails';

interface Application {
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
  email?: string;
  mobileNumber?: string;
  secondaryMobileNumber?: string;
  desiredPlan?: string;
  governmentId?: string;
  agreementStatus?: string;
  userEmail?: string;
  houseFrontPicture?: string;
  promo?: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const ApplicationManagement: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Mock data for applications with the columns shown in the images
  const applications: Application[] = [
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
      modifiedBy: 'Admin User',
      location: 'binangonan',
      email: 'johndoe@example.com',
      mobileNumber: '9123456789',
      secondaryMobileNumber: '9987654321',
      desiredPlan: 'SwitchConnect - P799',
      governmentId: 'https://drive.google.com/open?id=abc123...',
      agreementStatus: 'Yes, I Agree',
      userEmail: 'admin@amperecloud.com',
      houseFrontPicture: 'https://drive.google.com/open?id=xyz789...',
      promo: 'New Customer Discount'
    },
    {
      id: '2',
      timestamp: '09/19/2025 11:30:15',
      fullName: 'Jane M Smith',
      assignedEmail: 'tech2@amperecloud.com',
      visitStatus: 'Completed',
      applicationStatus: 'Approved',
      statusRemarks: 'Installation completed successfully',
      referredBy: 'Robert Johnson',
      fullAddress: '456 Oak St, Sample Town, Metro Manila',
      visitBy: 'Maria Santos',
      visitWith: 'Paulo Reyes',
      visitWithOther: 'NONE',
      visitRemarks: 'No issues during installation',
      modifiedDate: '09/18/2025 12:45:36',
      modifiedBy: 'Support Staff',
      location: 'binangonan',
      email: 'janesmith@example.com',
      mobileNumber: '9234567890',
      secondaryMobileNumber: '9876543210',
      desiredPlan: 'SwitchNet - P999',
      governmentId: 'https://drive.google.com/open?id=def456...',
      agreementStatus: 'Yes, I Agree',
      userEmail: 'support@amperecloud.com',
      houseFrontPicture: 'https://drive.google.com/open?id=pqr789...',
      promo: 'Upgrade Discount'
    },
    {
      id: '3',
      timestamp: '09/19/2025 09:15:45',
      fullName: 'Robert A Johnson',
      assignedEmail: 'tech3@amperecloud.com',
      visitStatus: 'Pending',
      applicationStatus: 'Under Review',
      statusRemarks: 'Checking service availability',
      referredBy: 'Customer Walk-in',
      fullAddress: '789 Pine St, Sample Village, Metro Manila',
      visitBy: 'Unassigned',
      visitWith: 'Unassigned',
      visitWithOther: 'NONE',
      visitRemarks: '',
      modifiedDate: '09/18/2025 10:05:18',
      modifiedBy: 'Sales Agent',
      location: 'binangonan',
      email: 'robertjohnson@example.com',
      mobileNumber: '9345678901',
      secondaryMobileNumber: '9765432109',
      desiredPlan: 'SwitchMax - P1499',
      governmentId: 'https://drive.google.com/open?id=ghi789...',
      agreementStatus: 'Yes, I Agree',
      userEmail: 'sales@amperecloud.com',
      houseFrontPicture: 'https://drive.google.com/open?id=stu012...',
      promo: 'Standard Rate'
    }
  ];

  // Generate location items with counts
  const locationItems: LocationItem[] = [
    {
      id: 'all',
      name: 'All',
      count: applications.length
    },
    {
      id: 'binangonan',
      name: 'Binangonan',
      count: applications.filter(app => app.location === 'binangonan').length
    },
    {
      id: 'cardona',
      name: 'Cardona',
      count: applications.filter(app => app.location === 'cardona').length
    },
    {
      id: 'taytay',
      name: 'Taytay',
      count: applications.filter(app => app.location === 'taytay').length
    },
    {
      id: 'las-pinas',
      name: 'Las Piñas',
      count: applications.filter(app => app.location === 'las-pinas').length
    }
  ];

  // Filter applications based on location and search query
  const filteredApplications = applications.filter(application => {
    const matchesLocation = selectedLocation === 'all' || 
                           application.location === selectedLocation;
    
    const matchesSearch = searchQuery === '' || 
                         application.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         application.fullAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         application.assignedEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

  const handleRowClick = (application: Application) => {
    setSelectedApplication(application);
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
            <h2 className="text-lg font-semibold text-white">Application</h2>
            <button 
              className="bg-orange-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
              aria-label="Application"
            >
              <span>Application</span>
            </button>
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

      {/* Applications List - Shrinks when detail view is shown */}
      <div className={`bg-gray-900 overflow-hidden ${selectedApplication ? 'w-1/3' : 'flex-1'}`}>
        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search applications..."
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
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-x-auto overflow-y-auto pb-4">
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
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Visit With (Other)
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Visit Remarks
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Modified By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((application) => (
                      <tr 
                        key={application.id} 
                        className={`hover:bg-gray-800 cursor-pointer ${selectedApplication?.id === application.id ? 'bg-gray-800' : ''}`}
                        onClick={() => handleRowClick(application)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.timestamp}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.fullName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.assignedEmail}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusText status={application.visitStatus} type="visit" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusText status={application.applicationStatus} type="application" />
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {application.statusRemarks}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.referredBy}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {application.fullAddress}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.visitBy}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.visitWith}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.visitWithOther}
                        </td>
                        <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                          {application.visitRemarks}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.modifiedDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                          {application.modifiedBy}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={14} className="px-4 py-12 text-center text-gray-400">
                        No applications found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail View - Only visible when an application is selected */}
      {selectedApplication && (
        <div className="flex-1 overflow-hidden">
          <ApplicationDetails 
            application={selectedApplication} 
            onClose={() => setSelectedApplication(null)}
          />
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;