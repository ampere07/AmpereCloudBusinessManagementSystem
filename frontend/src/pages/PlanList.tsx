import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, Loader2, Minus } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  is_active?: boolean;
  modified_date?: string;
  modified_by?: string;
  created_at?: string;
  updated_at?: string;
}

const PlanList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Add/Edit form states - simplified
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0
  });
  
  // Loading states for individual operations
  const [deletingItems, setDeletingItems] = useState<Set<number>>(new Set());
  const [savingForm, setSavingForm] = useState(false);
  const [panelAnimating, setPanelAnimating] = useState(false);

  // Base API URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    loadPlans();
  }, []);
  
  useEffect(() => {
    if (showAddPanel) {
      setTimeout(() => setPanelAnimating(true), 10);
    }
  }, [showAddPanel]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/plans`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data || []);
      } else {
        console.error('API returned error:', data.message);
        setPlans([]);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingItems(prev => {
      const newSet = new Set(prev);
      newSet.add(plan.id);
      return newSet;
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/plans/${plan.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        await loadPlans();
        alert(data.message || 'Plan deleted successfully');
      } else {
        alert(data.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(plan.id);
        return newSet;
      });
    }
  };

  const closePanel = () => {
    setPanelAnimating(false);
    setTimeout(() => {
      setShowAddPanel(false);
      setEditingPlan(null);
    }, 300);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price || 0
    });
    setShowAddPanel(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Plan name is required');
      return;
    }
    
    if (formData.price < 0) {
      alert('Price cannot be negative');
      return;
    }
    
    setSavingForm(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price
      };

      const url = editingPlan 
        ? `${API_BASE_URL}/plans/${editingPlan.id}`
        : `${API_BASE_URL}/plans`;
      
      const method = editingPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        await loadPlans();
        closePanel();
        resetForm();
        alert(data.message || `Plan ${editingPlan ? 'updated' : 'added'} successfully`);
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          alert('Validation errors:\n' + errorMessages);
        } else {
          alert(data.message || `Failed to ${editingPlan ? 'update' : 'add'} plan`);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to ${editingPlan ? 'update' : 'add'} plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSavingForm(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0
    });
  };

  const incrementPrice = () => {
    setFormData({ ...formData, price: formData.price + 1 });
  };

  const decrementPrice = () => {
    if (formData.price > 0) {
      setFormData({ ...formData, price: formData.price - 1 });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
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

  const getFilteredPlans = () => {
    if (!searchQuery) return plans;
    
    return plans.filter(plan => 
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const renderListItem = (plan: Plan) => {
    const isActive = plan.is_active !== undefined ? plan.is_active : true;
    
    return (
      <div key={plan.id} className="bg-gray-900 border-b border-gray-800 hover:bg-gray-850 transition-colors">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-medium text-lg">{plan.name}</h3>
              <span className="text-green-400 font-semibold">
                {formatPrice(plan.price)}
              </span>
              {isActive && (
                <span className="text-xs px-2 py-1 rounded bg-green-800 text-green-400">
                  Active
                </span>
              )}
            </div>
            {plan.description && (
              <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Modified: {formatDate(plan.modified_date)}</span>
              <span>By: {plan.modified_by || 'System'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(plan)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(plan)}
              disabled={deletingItems.has(plan.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={deletingItems.has(plan.id) ? 'Deleting...' : 'Delete'}
            >
              {deletingItems.has(plan.id) ? (
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

  const filteredPlans = getFilteredPlans();

  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-white">Plan List</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingPlan(null);
                  resetForm();
                  setShowAddPanel(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all">
                <Filter className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-all">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search Plan List"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : filteredPlans.length > 0 ? (
          <div>
            {filteredPlans.map(renderListItem)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No plans found
          </div>
        )}
      </div>

      {/* Add/Edit Slide Panel */}
      {showAddPanel && (
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
              panelAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={closePanel}
          />
          
          {/* Slide Panel */}
          <div className={`fixed right-0 top-0 h-full w-[500px] bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-all duration-300 ease-out ${
            panelAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                Plan List Form
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={closePanel}
                  className="px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-150 border border-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={savingForm}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 hover:shadow-lg hover:shadow-red-600/25"
                >
                  {savingForm && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {/* Plan Name Field */}
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plan Name<span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                    placeholder="Enter plan name"
                  />
                </div>

                {/* Description Field */}
                <div className="animate-fade-in [animation-delay:100ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 resize-none"
                    placeholder="Enter plan description"
                  />
                </div>

                {/* Price Field */}
                <div className="animate-fade-in [animation-delay:200ms]">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex items-stretch">
                    <div className="flex items-center px-4 bg-gray-800 border border-gray-700 rounded-l-lg border-r-0">
                      <span className="text-gray-400 font-medium">₱</span>
                    </div>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                      className="flex-1 px-4 py-3 bg-gray-800 text-white border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-center transition-all duration-200 border-l-0 border-r-0"
                      step="0.01"
                      min="0"
                    />
                    <div className="flex flex-col border-t border-b border-r border-gray-700 rounded-r-lg overflow-hidden bg-gray-800">
                      <button
                        type="button"
                        onClick={incrementPrice}
                        className="flex-1 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-150 flex items-center justify-center border-b border-gray-700 group"
                      >
                        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        type="button"
                        onClick={decrementPrice}
                        className="flex-1 px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-150 flex items-center justify-center group"
                      >
                        <Minus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Information Note */}
                <div className="animate-fade-in [animation-delay:300ms]">
                  <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      <strong>Note:</strong> Modified date and user information will be set automatically when the plan is created or updated.
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

export default PlanList;