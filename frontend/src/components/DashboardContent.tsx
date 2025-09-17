import React from 'react';

const DashboardContent: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-full text-white">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-400 text-sm">
            Your business management system overview and key metrics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Frontend:</span>
                <span className="text-green-400 font-medium">Running</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Backend:</span>
                <span className="text-green-400 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Database:</span>
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium">
                New Project
              </button>
              <button className="w-full px-4 py-3 text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors text-sm">
                View Reports
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-700">
                <div className="text-white text-sm mb-1">System initialized successfully</div>
                <div className="text-gray-400 text-xs">2 hours ago</div>
              </div>
              <div className="pb-3 border-b border-gray-700">
                <div className="text-white text-sm mb-1">Database connection established</div>
                <div className="text-gray-400 text-xs">3 hours ago</div>
              </div>
              <div>
                <div className="text-white text-sm mb-1">User authenticated</div>
                <div className="text-gray-400 text-xs">4 hours ago</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">CPU Usage</span>
                  <span className="text-white text-sm">45%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">Memory Usage</span>
                  <span className="text-white text-sm">32%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">Disk Usage</span>
                  <span className="text-white text-sm">78%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              System Info
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-xs">Version</div>
                <div className="text-white text-sm">v1.0.0</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Uptime</div>
                <div className="text-white text-sm">2d 14h 32m</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">Last Update</div>
                <div className="text-white text-sm">2024-03-15</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
