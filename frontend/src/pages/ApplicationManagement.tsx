import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import ApplicationDetails from '../components/ApplicationDetails';

interface Application {
  id: string;
  name: string;
  date: string;
  time: string;
  address: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  email?: string;
  mobileNumber?: string;
  secondaryMobileNumber?: string;
  desiredPlan?: string;
  governmentId?: string;
  agreementStatus?: string;
  userEmail?: string;
  houseFrontPicture?: string;
  referredBy?: string;
  promo?: string;
}

interface LocationItem {
  id: string;
  name: string;
  count: number;
}

const ApplicationManagement: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Mock data similar to the screenshot
  const applications: Application[] = [
    {
      id: '1',
      name: 'JOHN H DOE',
      date: '09/19/2025',
      time: '10:20:09',
      address: '123 MAIN STREET SAMPLE SUBDIVISION BRGY EXAMPLE ANYTOWN CITY, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '2',
      name: 'JANE M SMITH',
      date: '09/19/2025',
      time: '10:00:20',
      address: '456 CENTER AVENUE METRO HOMES BRGY CENTER ANYTOWN CITY, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '3',
      name: 'ROBERT A JOHNSON',
      date: '09/19/2025',
      time: '15:22:58',
      address: '789 PARK LANE, Sample Area, Anytown City, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '4',
      name: 'EMILY R WILLIAMS',
      date: '09/19/2025',
      time: '14:05:00',
      address: '101 SUNSET DRIVE PHASE 2 GARDEN HOMES BRGY WEST ANYTOWN CITY, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '5',
      name: 'MICHAEL J BROWN',
      date: '09/19/2025',
      time: '13:12:04',
      address: '202 RIVERSIDE ROAD, East District, Anytown City, Sample Province',
      location: 'binangonan',
      status: 'completed'
    },
    {
      id: '6',
      name: 'SARAH L TAYLOR',
      date: '09/19/2025',
      time: '12:20:14',
      address: 'UNIT 303 BUILDING A SAMPLE APARTMENTS NATIONAL ROAD BRGY SOUTH ANYTOWN CITY, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '7',
      name: 'DAVID W MILLER',
      date: '09/19/2025',
      time: '12:29:10',
      address: '404 MOUNTAIN VIEW AVENUE, North District, Anytown City, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '8',
      name: 'JENNIFER K WILSON',
      date: '09/19/2025',
      time: '11:55:20',
      address: '505 LIBERTY STREET BRGY DOWNTOWN ANYTOWN CITY, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '9',
      name: 'THOMAS P MARTINEZ',
      date: '09/19/2025',
      time: '11:35:00',
      address: '606 LAKESIDE DRIVE, Waterfront District, Anytown City, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '10',
      name: 'LISA G ANDERSON',
      date: '09/19/2025',
      time: '11:24:05',
      address: '707 HIGHLAND AVENUE, Central District, Anytown City, Sample Province',
      location: 'binangonan',
      status: 'scheduled'
    },
    {
      id: '11',
      name: 'JAMES F THOMPSON',
      date: '09/19/2025',
      time: '09:15:30',
      address: '808 PINE STREET, Western District, Another City, Other Province',
      location: 'las-pinas',
      status: 'scheduled'
    },
    {
      id: '12',
      name: 'MARY C WILSON',
      date: '09/19/2025',
      time: '08:45:12',
      address: '909 MAPLE AVENUE, Northern District, Another City, Other Province',
      location: 'las-pinas',
      status: 'completed'
    },
    {
      id: '13',
      name: 'CHARLES D RODRIGUEZ',
      date: '09/19/2025',
      time: '07:30:45',
      address: '111 OAK BOULEVARD, Eastern District, Another City, Other Province',
      location: 'las-pinas',
      status: 'scheduled'
    },
    {
      id: '14',
      name: 'KAREN B MARTINEZ',
      date: '09/19/2025',
      time: '16:20:18',
      address: '222 CEDAR ROAD, Southern District, Another City, Other Province',
      location: 'las-pinas',
      status: 'scheduled'
    },
    {
      id: '15',
      name: 'STEVEN V GARCIA',
      date: '09/19/2025',
      time: '14:10:55',
      address: '333 WILLOW AVENUE, Coastal District, Another City, Other Province',
      location: 'las-pinas',
      status: 'scheduled'
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
      id: 'region1',
      name: 'Region One',
      count: applications.filter(app => app.location === 'region1').length
    },
    {
      id: 'binangonan',
      name: 'Anytown',
      count: applications.filter(app => app.location === 'binangonan').length
    },
    {
      id: 'cardona',
      name: 'Westville',
      count: applications.filter(app => app.location === 'cardona').length
    },
    {
      id: 'taytay',
      name: 'Northbridge',
      count: applications.filter(app => app.location === 'taytay').length
    },
    {
      id: 'las-pinas',
      name: 'Eastport',
      count: applications.filter(app => app.location === 'las-pinas').length
    }
  ];

  // Filter applications based on location only
  const filteredApplications = applications.filter(app => {
    const matchesLocation = selectedLocation === 'all' || app.location === selectedLocation;
    return matchesLocation;
  });

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
      <div className={`bg-gray-900 border-r border-gray-700 overflow-y-auto ${selectedApplication ? 'w-1/3' : 'flex-1'}`}>
        <div className="w-full">
          {filteredApplications.length > 0 ? (
            <div className="w-full">
              {filteredApplications.map((application) => (
                <div 
                  key={application.id} 
                  className={`p-4 hover:bg-gray-800 transition-colors border-b border-gray-700 cursor-pointer ${selectedApplication?.id === application.id ? 'bg-gray-800' : ''}`}
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h4 className="text-base font-medium text-white truncate">{application.name}</h4>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300 mb-2">
                        <span className="truncate">{application.date} {application.time}</span>
                        <span className="mx-2 flex-shrink-0">|</span>
                        <span className="text-gray-400 truncate">{application.address}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4 flex-shrink-0">
                      {application.status === 'scheduled' && (
                        <>
                          <button 
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Schedule
                          </button>
                          <button 
                            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Duplicate
                          </button>
                        </>
                      )}
                      {application.status === 'completed' && (
                        <button 
                          className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Duplicate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-gray-400">No applications found for {selectedLocation === 'all' ? 'any location' : locationItems.find(l => l.id === selectedLocation)?.name}.</p>
            </div>
          )}
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
