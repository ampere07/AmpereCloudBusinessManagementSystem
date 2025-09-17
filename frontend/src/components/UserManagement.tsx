import React, { useState } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface AddNewUserFormProps {
  onCancel: () => void;
}

const AddNewUserForm: React.FC<AddNewUserFormProps> = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = () => {
    // No functionality yet as requested
    console.log('Create user clicked - no functionality yet');
  };

  return (
    <div className="bg-gray-950 text-white">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Add New User
          </h2>
          <p className="text-gray-400 text-sm">
            Create a new user account
          </p>
        </div>

        <div className="max-w-md">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-400"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-600 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Create User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewUser = () => {
    setShowAddUserForm(true);
  };

  const handleCancelAddUser = () => {
    setShowAddUserForm(false);
  };

  if (showAddUserForm) {
    return <AddNewUserForm onCancel={handleCancelAddUser} />;
  }

  return (
    <div className="bg-gray-950 text-white">
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
            className="px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-80"
          />
          <button 
            onClick={handleAddNewUser}
            className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Add New User
          </button>
        </div>

        <div className="bg-gray-900 rounded border border-gray-700 overflow-hidden">
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
