import React from 'react';

const ApplicationVisit: React.FC = () => {
  return (
    <div className="bg-gray-950 h-full flex overflow-hidden">
      {/* Location Sidebar Container */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center mb-1">
            <h2 className="text-lg font-semibold text-white">Application Visits</h2>
          </div>
          <p className="text-xs text-gray-400">Filter by location</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Placeholder for filters */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Application Visit Management</h1>
          <p className="text-gray-400 mb-8">This feature is currently under development.</p>
          <div className="p-6 bg-gray-900 rounded-lg border border-gray-800 max-w-lg mx-auto">
            <p className="text-sm text-gray-300">
              The Application Visit module will provide a comprehensive system for scheduling, 
              tracking, and managing on-site visits for new applications. Technicians will be able 
              to update visit statuses, document site surveys, and attach photos directly through 
              the platform. This feature will be integrated with the job order system for seamless workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationVisit;