import React, { useState } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const UserManagement: React.FC = () => {
  const [users] = useState<User[]>([
    { id: 1, username: 'admin', email: 'admin@amperecloud.com', role: 'Administrator', status: 'active', lastLogin: '2024-03-15 10:30' },
    { id: 2, username: 'user1', email: 'user1@amperecloud.com', role: 'User', status: 'active', lastLogin: '2024-03-14 16:45' },
    { id: 3, username: 'manager', email: 'manager@amperecloud.com', role: 'Manager', status: 'inactive', lastLogin: '2024-03-10 09:15' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-900 min-h-full text-white">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">
            User Management
          </h2>
          <p className="text-gray-400 text-sm">
            Manage system users and their permissions
          </p>
        </div>

        <div className="flex justify-between items-center mb-8">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-80"
          />
          <button className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium">
            Add New User
          </button>
        </div>

        <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Username</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm text-white">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-white">{user.role}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs text-white border border-gray-600 rounded hover:bg-gray-700 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs text-red-400 border border-red-600 rounded hover:bg-red-900 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
