import React, { useState, useEffect } from 'react';
import { Group } from '../types/api';
import { groupService } from '../services/userService';
import Breadcrumb from './Breadcrumb';
import AddNewGroupForm from '../components/AddNewGroupForm';
import EditGroupForm from '../components/EditGroupForm';

const GroupManagement: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await groupService.getAllGroups();
      
      if (response.success && response.data) {
        setGroups(response.data);
      }
    } catch (error: any) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.company_name && group.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (group.email && group.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalItems = filteredGroups.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = filteredGroups.slice(startIndex, endIndex);
  const showingStart = totalItems === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(endIndex, totalItems);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleGroupCreated = (newGroup: Group) => {
    if (!newGroup) {
      console.error('Received invalid group from creation');
      alert('Warning: Failed to receive group data. Please refresh the page.');
      return;
    }
    
    console.log('Group created successfully:', newGroup);
    setGroups(prev => [...prev, newGroup]);
    setShowAddForm(false);
  };

  const handleEdit = (group: Group) => {
    if (!group) {
      console.error('Cannot edit group: No group data');
      alert('Cannot edit group: No group data');
      return;
    }
    
    setEditingGroup(group);
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
  };

  const handleGroupUpdated = (updatedGroup: Group) => {
    setGroups(prev => prev.map(group => 
      group.group_id === updatedGroup.group_id ? updatedGroup : group
    ));
    setEditingGroup(null);
  };

  const handleDeleteClick = (group: Group) => {
    setDeletingGroup(group);
  };

  const handleCancelDelete = () => {
    setDeletingGroup(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingGroup) return;

    try {
      const response = await groupService.deleteGroup(deletingGroup.group_id);
      
      if (response.success) {
        setGroups(prev => prev.filter(group => group.group_id !== deletingGroup.group_id));
        setDeletingGroup(null);
      } else {
        const errorMessage = response.message || 'Failed to delete group';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Failed to delete group:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete group';
      alert(errorMessage);
    }
  };

  if (showAddForm) {
    return <AddNewGroupForm onCancel={handleCancelAdd} onGroupCreated={handleGroupCreated} />;
  }

  if (editingGroup) {
    return <EditGroupForm group={editingGroup} onCancel={handleCancelEdit} onGroupUpdated={handleGroupUpdated} />;
  }

  return (
    <div className="p-6">
      <Breadcrumb items={[
        { label: 'Groups' }
      ]} />
      <div className="bg-gray-800 rounded-lg border border-gray-600 overflow-hidden text-white">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Group Management
            </h2>
            <p className="text-gray-400 text-sm">
              Manage user groups and their settings
            </p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <input
              type="text"
              placeholder="Search groups by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gray-100 w-80"
            />
            <button 
              onClick={handleAddNew}
              className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Add New Group
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading groups...</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded border border-gray-600 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="">
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Group Name</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Company Name</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Email</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Hotline</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Modified Date</th>
                      <th className="px-4 py-4 text-left text-sm font-medium text-gray-300 border-b border-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGroups.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No groups found
                        </td>
                      </tr>
                    ) : (
                      currentGroups.map((group: Group) => (
                        <tr key={group.group_id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="px-4 py-4 text-sm text-white font-medium">
                            {group.group_name}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">
                            {group.company_name || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">
                            {group.email || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">
                            {group.hotline || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">
                            {group.modified_date ? new Date(group.modified_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEdit(group)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900 rounded transition-colors"
                                title="Edit group"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(group)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded transition-colors"
                                title="Delete group"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          )}

          {/* Pagination Controls */}
          {totalItems > 0 && (
            <div className="mt-4">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-300">
                    Showing {showingStart} to {showingEnd} of {totalItems} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-gray-400"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-300">entries</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    className="px-3 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const distance = Math.abs(page - currentPage);
                      return distance <= 2 || page === 1 || page === totalPages;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 text-sm border rounded ${
                              currentPage === page
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Delete Confirmation Modal */}
        {deletingGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded border border-gray-700 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Confirm Delete Group
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete group "{deletingGroup.group_name}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-gray-600 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagement;
