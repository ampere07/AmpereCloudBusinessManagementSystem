import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Mail, Plus, Filter, FileDown } from 'lucide-react';
import { SalesAgent } from '../types/api';
import SalesAgentListDetails from '../components/SalesAgentListDetails';
import SalesAgentListFormModal from '../modals/SalesAgentListFormModal';

const SalesAgentList: React.FC = () => {
  const [salesAgents, setSalesAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingAgent, setDeletingAgent] = useState<SalesAgent | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<SalesAgent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sampleAgents: SalesAgent[] = [
    { 
      id: 1, 
      name: 'Keanu C. Nido', 
      email: 'keanu.nido@example.com', 
      mobile_number: '9107650861',
      territory: '302 Antiporda St. Filapila Binangnan, Rizal',
      created_at: '2024-01-01', 
      updated_at: '2024-01-01' 
    },
    { 
      id: 2, 
      name: 'Norwina A. Armas', 
      email: 'norwina.armas@example.com', 
      mobile_number: '9124567890',
      territory: 'Dalig, Batingan, Rizal',
      created_at: '2024-01-02', 
      updated_at: '2024-01-02' 
    },
    { 
      id: 3, 
      name: 'Jeffrey A. Basa', 
      email: 'jeffrey.basa@example.com', 
      mobile_number: '9123456789',
      territory: 'Bilog St., Batingan, Binangon',
      created_at: '2024-01-03', 
      updated_at: '2024-01-03' 
    }
  ];

  useEffect(() => {
    setSalesAgents(sampleAgents);
  }, []);

  const filteredAgents = salesAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAgent = () => {
    setIsModalOpen(true);
  };
  
  const handleSaveAgent = (formData: any) => {
    const newAgent: SalesAgent = {
      id: salesAgents.length + 1,
      name: formData.name,
      email: formData.email,
      mobile_number: formData.contactNo,
      territory: formData.location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setSalesAgents([...salesAgents, newAgent]);
    setIsModalOpen(false);
  };

  const handleSelectAgent = (agent: SalesAgent) => {
    setSelectedAgent(agent);
  };

  const handleCloseDetails = () => {
    setSelectedAgent(null);
  };

  const handleEditAgent = (agent: SalesAgent) => {
    console.log('Edit agent:', agent);
    setSelectedAgent(null);
  };

  const handleDeleteFromDetails = (agent: SalesAgent) => {
    setDeletingAgent(agent);
    setSelectedAgent(null);
  };

  const handleDeleteClick = (agent: SalesAgent) => {
    setDeletingAgent(agent);
  };

  const handleCancelDelete = () => {
    setDeletingAgent(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingAgent) return;
    
    setSalesAgents(prev => 
      prev.filter(agent => agent.id !== deletingAgent.id)
    );
    setDeletingAgent(null);
  };

  const handleEmailAgent = (agent: SalesAgent) => {
    console.log('Email agent:', agent);
    if (agent.email) {
      window.open(`mailto:${agent.email}`, '_blank');
    }
  };

  const handleFilter = () => {
    console.log('Open filter options');
  };

  const handleExport = () => {
    console.log('Export sales agent list');
  };

  const mainContentClasses = [
    selectedAgent ? 'flex-1' : 'w-full',
    'bg-gray-950',
    'text-white',
    'h-full',
    'flex',
    'flex-col'
  ].join(' ');

  return (
    <div className="h-full flex bg-gray-950" style={{ transition: 'none' }}>
      <div className={mainContentClasses}>
        <div className="py-2.5 px-6 border-b border-gray-700 flex-shrink-0 bg-gray-900">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium text-white">
              Sales Agent List
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddAgent}
                className={
                  "px-3 py-1.5 bg-orange-600 text-white rounded " +
                  "hover:bg-orange-700 transition-colors text-sm " +
                  "font-medium flex items-center gap-2"
                }
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
              <button
                onClick={handleFilter}
                className={
                  "px-3 py-1.5 bg-gray-700 text-white rounded " +
                  "hover:bg-gray-600 transition-colors text-sm " +
                  "font-medium flex items-center gap-2"
                }
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-900">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading sales agents...</p>
            </div>
          ) : (
            <div>
              {filteredAgents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No sales agents found
                </div>
              ) : (
                filteredAgents.map((agent, index) => {
                  const isLastItem = index < filteredAgents.length - 1;
                  const isSelected = selectedAgent?.id === agent.id;
                  
                  const itemClasses = [
                    'flex',
                    'items-center',
                    'justify-between',
                    'py-4',
                    'px-6',
                    'hover:bg-gray-700',
                    'transition-colors',
                    'cursor-pointer',
                    isLastItem ? 'border-b border-gray-700' : '',
                    isSelected ? 'bg-gray-800' : ''
                  ].filter(Boolean).join(' ');

                  return (
                    <div
                      key={agent.id}
                      className={itemClasses}
                      onClick={() => handleSelectAgent(agent)}
                    >
                      <div className="text-white font-medium">
                        {agent.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(agent);
                          }}
                          className={
                            "p-2 text-gray-400 hover:text-orange-400 " +
                            "hover:bg-orange-900 rounded transition-colors"
                          }
                          title="Delete sales agent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAgent(agent);
                          }}
                          className={
                            "p-2 text-gray-400 hover:text-blue-400 " +
                            "hover:bg-blue-900 rounded transition-colors"
                          }
                          title="Edit sales agent"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmailAgent(agent);
                          }}
                          className={
                            "p-2 text-gray-400 hover:text-green-400 " +
                            "hover:bg-green-900 rounded transition-colors"
                          }
                          title="Email sales agent"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {selectedAgent && (
        <div className="w-1/2 h-full" style={{ transition: 'none' }}>
          <SalesAgentListDetails 
            salesAgent={selectedAgent}
            onClose={handleCloseDetails}
            onEdit={handleEditAgent}
            onDelete={handleDeleteFromDetails}
          />
        </div>
      )}
      
      {deletingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded border border-gray-700 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Confirm Delete Sales Agent
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete sales agent "{deletingAgent.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelDelete}
                className={
                  "px-4 py-2 border border-gray-600 text-white " +
                  "rounded hover:bg-gray-800 transition-colors " +
                  "text-sm font-medium"
                }
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className={
                  "px-4 py-2 bg-red-600 text-white rounded " +
                  "hover:bg-red-700 transition-colors " +
                  "text-sm font-medium"
                }
              >
                Delete Sales Agent
              </button>
            </div>
          </div>
        </div>
      )}
      
      <SalesAgentListFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveAgent} 
      />
    </div>
  );
};

export default SalesAgentList;