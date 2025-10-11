import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Loader2, Calendar, User } from 'lucide-react';
import {
  getAllRouterModels,
  createRouterModel,
  updateRouterModel,
  deleteRouterModel,
  RouterModel
} from '../services/routerModelService';

const RouterModelList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [routers, setRouters] = useState<RouterModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingRouter, setEditingRouter] = useState<RouterModel | null>(null);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    description: '',
    modifiedDate: new Date().toISOString().slice(0, 16),
    modifiedBy: 'ravenampere0123@gmail.com'
  });
  
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [savingForm, setSavingForm] = useState(false);
  const [panelAnimating, setPanelAnimating] = useState(false);

  useEffect(() => {
    loadRouters();
  }, []);
  
  useEffect(() => {
    if (showAddPanel) {
      setTimeout(() => setPanelAnimating(true), 10);
    }
  }, [showAddPanel]);

  const loadRouters = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRouterModels();
      setRouters(data);
    } catch (error) {
      console.error('Error loading router models:', error);
      setRouters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (router: RouterModel) => {
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to permanently delete router model "${router.brand} ${router.Model}"?\n\nThis will PERMANENTLY REMOVE the router model from the database and CANNOT BE UNDONE!\n\nClick OK to permanently delete, or Cancel to keep the router model.`)) {
      return;
    }

    setDeletingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(router.SN);
      return newSet;
    });
    
    try {
      await deleteRouterModel(router.SN);
      await loadRouters();
      alert('✅ Router model permanently deleted from database');
    } catch (error: any) {
      console.error('Error deleting router model:', error);
      alert('❌ Failed to delete router model: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(router.SN);
        return newSet;
      });
    }
  };

  const closePanel = () => {
    setPanelAnimating(false);
    setTimeout(() => {
      setShowAddPanel(false);
      setEditingRouter(null);
    }, 300);
  };

  const handleEdit = (router: RouterModel) => {
    setEditingRouter(router);
    setFormData({
      brand: router.brand || '',
      model: router.Model || '',
      description: router.description || '',
      modifiedDate: new Date().toISOString().slice(0, 16),
      modifiedBy: 'ravenampere0123@gmail.com'
    });
    setShowAddPanel(true);
  };

  const handleSubmit = async () => {
    if (!formData.brand.trim()) {
      alert('Brand is required');
      return;
    }
    
    if (!formData.model.trim()) {
      alert('Model is required');
      return;
    }
    
    setSavingForm(true);
    
    try {
      const payload = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        description: formData.description.trim()
      };

      if (editingRouter) {
        await updateRouterModel(editingRouter.SN, payload);
        alert('Router model updated successfully');
      } else {
        await createRouterModel(payload);
        alert('Router model added successfully');
      }
      
      await loadRouters();
      closePanel();
      resetForm();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to ${editingRouter ? 'update' : 'add'} router model: ${errorMessage}`);
    } finally {
      setSavingForm(false);
    }
  };

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      description: '',
      modifiedDate: new Date().toISOString().slice(0, 16),
      modifiedBy: 'ravenampere0123@gmail.com'
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFilteredRouters = () => {
    if (!searchQuery) return routers;
    
    return routers.filter(router => 
      (router.brand && router.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (router.Model && router.Model.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (router.SN && router.SN.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (router.description && router.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const renderListItem = (router: RouterModel) => {
    const isActive = router.is_active !== undefined ? router.is_active : true;
    
    return (
      <div key={router.SN} className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-medium text-lg">
                {router.brand || 'Unknown Brand'} {router.Model || 'Unknown Model'}
              </h3>
              <span className="text-xs px-2 py-1 rounded bg-blue-800 text-blue-400">
                SN: {router.SN}
              </span>
              {isActive && (
                <span className="text-xs px-2 py-1 rounded bg-green-800 text-green-400">
                  Active
                </span>
              )}
            </div>
            {router.description && (
              <p className="text-gray-400 text-sm mt-1">{router.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Modified: {formatDate(router.modified_date)}</span>
              <span>By: {router.modified_by || 'System'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(router)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(router)}
              disabled={deletingItems.has(router.SN)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title={deletingItems.has(router.SN) ? 'Permanently Deleting...' : 'Permanently Delete'}
            >
              {deletingItems.has(router.SN) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredRouters = getFilteredRouters();

  return (
    <div className="min-h-screen bg-gray-950 relative">
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-white">Router Models</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingRouter(null);
                  resetForm();
                  setShowAddPanel(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Router Models"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : filteredRouters.length > 0 ? (
          <div>
            {filteredRouters.map(renderListItem)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No router models found
          </div>
        )}
      </div>

      {showAddPanel && (
        <>
          <div 
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
              panelAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={closePanel}
          />
          
          <div className={`fixed right-0 top-0 h-full w-[500px] bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-out ${
            panelAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                Router Models Form
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={closePanel}
                  className="px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg border border-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={savingForm}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingForm && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Brand<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    placeholder="Enter router brand"
                  />
                </div>

                <div className="animate-fade-in [animation-delay:100ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                    placeholder="Enter router model"
                  />
                </div>

                <div className="animate-fade-in [animation-delay:200ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none resize-none"
                    placeholder="Enter router description or specifications"
                  />
                </div>

                <div className="animate-fade-in [animation-delay:300ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modified By
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.modifiedBy}
                      onChange={(e) => setFormData({ ...formData, modifiedBy: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      placeholder="Enter email address"
                      readOnly
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="animate-fade-in [animation-delay:400ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Modified Date
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.modifiedDate}
                      onChange={(e) => setFormData({ ...formData, modifiedDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none"
                      readOnly
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="animate-fade-in [animation-delay:500ms]">
                  <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      <strong>Note:</strong> Serial Number (SN) will be automatically generated based on brand and model. Modified date and user information will be set automatically when the router model is created or updated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RouterModelList;
