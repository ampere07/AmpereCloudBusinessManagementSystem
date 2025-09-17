import React, { useState } from 'react';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
  user?: string;
}

const Logs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('application');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [maxEntries, setMaxEntries] = useState('100');
  const [minEntries, setMinEntries] = useState('0');

  const [logs] = useState<LogEntry[]>([
    { id: 1, timestamp: '2024-03-15 10:30:15', level: 'info', message: 'User login successful', source: 'Authentication', user: 'admin' },
    { id: 2, timestamp: '2024-03-15 10:28:42', level: 'info', message: 'Database connection established', source: 'Database' },
    { id: 3, timestamp: '2024-03-15 10:25:33', level: 'success', message: 'System initialization completed', source: 'System' },
    { id: 4, timestamp: '2024-03-15 10:22:18', level: 'warning', message: 'High memory usage detected', source: 'System Monitor' },
    { id: 5, timestamp: '2024-03-15 10:20:07', level: 'error', message: 'Failed to connect to external API', source: 'API Gateway' },
    { id: 6, timestamp: '2024-03-15 10:15:44', level: 'info', message: 'User session started', source: 'Session Manager', user: 'user1' },
    { id: 7, timestamp: '2024-03-15 10:12:29', level: 'info', message: 'Data backup completed successfully', source: 'Backup Service' },
    { id: 8, timestamp: '2024-03-15 10:10:15', level: 'warning', message: 'SSL certificate expires in 30 days', source: 'Security Monitor' }
  ]);

  const tabs = [
    { id: 'application', label: 'Application Logs' },
    { id: 'radius', label: 'Radius Logs' },
    { id: 'system', label: 'System Logs' }
  ];

  return (
    <div className="bg-gray-900 min-h-full text-white">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white mb-2">LOGS</h1>
          <p className="text-gray-400 text-sm">View logs</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={maxEntries}
              onChange={(e) => setMaxEntries(e.target.value)}
              className="w-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minEntries}
              onChange={(e) => setMinEntries(e.target.value)}
              className="w-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2 rounded"
              />
              AutoRefresh
            </label>
          </div>
          
          <button className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium">
            Search
          </button>
        </div>

        {/* Log Table */}
        <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 border-b border-gray-600">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">TIMESTAMP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">LEVEL</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">MESSAGE</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">SOURCE</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">USER</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-750 text-sm">
                  <td className="px-4 py-3 text-gray-300">{log.timestamp}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.level === 'error' ? 'bg-red-900 text-red-300' :
                      log.level === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                      log.level === 'success' ? 'bg-green-900 text-green-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{log.message}</td>
                  <td className="px-4 py-3 text-gray-300">{log.source}</td>
                  <td className="px-4 py-3 text-gray-300">{log.user || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
