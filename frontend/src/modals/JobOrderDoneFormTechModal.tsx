import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, Camera, MapPin } from 'lucide-react';
import { UserData } from '../types/api';
import { updateJobOrder } from '../services/jobOrderService';
import { userService } from '../services/userService';
import { planService, Plan } from '../services/planService';
import { routerModelService, RouterModel } from '../services/routerModelService';
import apiClient from '../config/api';

interface JobOrderDoneFormTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  jobOrderData?: any;
}

interface LCPData {
  id: number;
  lcp_name: string;
}

interface LCPResponse {
  success: boolean;
  data: LCPData[];
}

interface NAPData {
  id: number;
  nap_name: string;
}

interface NAPResponse {
  success: boolean;
  data: NAPData[];
}

interface PortData {
  id: number;
  PORT_ID: string;
  Label: string;
}

interface PortResponse {
  success: boolean;
  data: PortData[];
}

interface VLANData {
  id: number;
  VLAN_ID: string;
  Value: string;
}

interface VLANResponse {
  success: boolean;
  data: VLANData[];
}

interface JobOrderDoneFormData {
  dateInstalled: string;
  usageType: string;
  choosePlan: string;
  connectionType: string;
  routerModel: string;
  modemSN: string;
  provider: string;
  lcp: string;
  nap: string;
  port: string;
  vlan: string;
  onsiteStatus: string;
  onsiteRemarks: string;
  signedContractImage: File | null;
  setupImage: File | null;
  boxReadingImage: File | null;
  routerReadingImage: File | null;
  portLabelImage: File | null;
  clientSignature: string | null;
  modifiedBy: string;
  modifiedDate: string;
  itemName1: string;
  visitBy: string;
  visitWith: string;
  visitWithOther: string;
  statusRemarks: string;
  ip: string;
  addressCoordinates: string;
}

const JobOrderDoneFormTechModal: React.FC<JobOrderDoneFormTechModalProps> = ({
  isOpen,
  onClose,
  onSave,
  jobOrderData
}) => {
  const getCurrentUser = (): UserData | null => {
    try {
      const authData = localStorage.getItem('authData');
      if (authData) {
        return JSON.parse(authData);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const currentUserEmail = currentUser?.email || 'unknown@ampere.com';

  const [formData, setFormData] = useState<JobOrderDoneFormData>({
    dateInstalled: '',
    usageType: '',
    choosePlan: '',
    connectionType: '',
    routerModel: '',
    modemSN: '',
    provider: '',
    lcp: '',
    nap: '',
    port: '',
    vlan: '',
    onsiteStatus: 'In Progress',
    onsiteRemarks: '',
    signedContractImage: null,
    setupImage: null,
    boxReadingImage: null,
    routerReadingImage: null,
    portLabelImage: null,
    clientSignature: null,
    modifiedBy: currentUserEmail,
    modifiedDate: new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }),
    itemName1: '',
    visitBy: '',
    visitWith: '',
    visitWithOther: '',
    statusRemarks: '',
    ip: '',
    addressCoordinates: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Array<{ email: string; name: string }>>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [routerModels, setRouterModels] = useState<RouterModel[]>([]);
  const [lcps, setLcps] = useState<LCPData[]>([]);
  const [naps, setNaps] = useState<NAPData[]>([]);
  const [ports, setPorts] = useState<PortData[]>([]);
  const [vlans, setVlans] = useState<VLANData[]>([]);

  useEffect(() => {
    const fetchLcps = async () => {
      if (isOpen) {
        try {
          const response = await apiClient.get<LCPResponse>('/lcp');
          if (response.data?.success && Array.isArray(response.data.data)) {
            setLcps(response.data.data);
          } else if (Array.isArray(response.data)) {
            setLcps(response.data as LCPData[]);
          } else {
            setLcps([]);
          }
        } catch (error) {
          console.error('Error fetching LCPs:', error);
          setLcps([]);
        }
      }
    };
    fetchLcps();
  }, [isOpen]);

  useEffect(() => {
    const fetchNaps = async () => {
      if (isOpen) {
        try {
          const response = await apiClient.get<NAPResponse>('/nap');
          if (response.data?.success && Array.isArray(response.data.data)) {
            setNaps(response.data.data);
          } else if (Array.isArray(response.data)) {
            setNaps(response.data as NAPData[]);
          } else {
            setNaps([]);
          }
        } catch (error) {
          console.error('Error fetching NAPs:', error);
          setNaps([]);
        }
      }
    };
    fetchNaps();
  }, [isOpen]);

  useEffect(() => {
    const fetchPorts = async () => {
      if (isOpen) {
        try {
          const response = await apiClient.get<PortResponse>('/port');
          if (response.data?.success && Array.isArray(response.data.data)) {
            setPorts(response.data.data);
          } else if (Array.isArray(response.data)) {
            setPorts(response.data as PortData[]);
          } else {
            setPorts([]);
          }
        } catch (error) {
          console.error('Error fetching Ports:', error);
          setPorts([]);
        }
      }
    };
    fetchPorts();
  }, [isOpen]);

  useEffect(() => {
    const fetchVlans = async () => {
      if (isOpen) {
        try {
          const response = await apiClient.get<VLANResponse>('/vlan');
          if (response.data?.success && Array.isArray(response.data.data)) {
            setVlans(response.data.data);
          } else if (Array.isArray(response.data)) {
            setVlans(response.data as VLANData[]);
          } else {
            setVlans([]);
          }
        } catch (error) {
          console.error('Error fetching VLANs:', error);
          setVlans([]);
        }
      }
    };
    fetchVlans();
  }, [isOpen]);

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (isOpen) {
        try {
          const response = await userService.getUsersByRole('technician');
          if (response.success && response.data) {
            const technicianList = response.data
              .filter((user: any) => user.first_name || user.last_name)
              .map((user: any) => {
                const firstName = (user.first_name || '').trim();
                const lastName = (user.last_name || '').trim();
                const fullName = `${firstName} ${lastName}`.trim();
                return {
                  email: user.email_address || user.email || '',
                  name: fullName || user.username || user.email_address || user.email || ''
                };
              })
              .filter((tech: any) => tech.name);
            setTechnicians(technicianList);
          }
        } catch (error) {
          console.error('Error fetching technicians:', error);
        }
      }
    };
    
    fetchTechnicians();
  }, [isOpen]);

  useEffect(() => {
    const fetchPlans = async () => {
      if (isOpen) {
        try {
          const fetchedPlans = await planService.getAllPlans();
          setPlans(fetchedPlans);
        } catch (error) {
          console.error('Error fetching plans:', error);
        }
      }
    };
    
    fetchPlans();
  }, [isOpen]);

  useEffect(() => {
    const fetchRouterModels = async () => {
      if (isOpen) {
        try {
          const fetchedRouterModels = await routerModelService.getAllRouterModels();
          setRouterModels(fetchedRouterModels);
        } catch (error) {
          console.error('Error fetching router models:', error);
        }
      }
    };
    
    fetchRouterModels();
  }, [isOpen]);

  useEffect(() => {
    if (jobOrderData && isOpen) {
      console.log('JobOrderDoneFormTechModal - Received jobOrderData:', jobOrderData);
      
      const loadedOnsiteStatus = jobOrderData.Onsite_Status || jobOrderData.onsite_status || 'In Progress';
      
      setFormData(prev => ({
        ...prev,
        dateInstalled: jobOrderData.Date_Installed || jobOrderData.date_installed || '',
        usageType: jobOrderData.Usage_Type || jobOrderData.usage_type || '',
        choosePlan: jobOrderData.Desired_Plan || jobOrderData.desired_plan || jobOrderData.Choose_Plan || jobOrderData.choose_plan || jobOrderData.plan || '',
        connectionType: jobOrderData.Connection_Type || jobOrderData.connection_type || '',
        routerModel: jobOrderData.Router_Model || jobOrderData.router_model || '',
        modemSN: jobOrderData.Modem_SN || jobOrderData.modem_sn || '',
        provider: jobOrderData.Provider || jobOrderData.provider || '',
        lcp: jobOrderData.LCP || jobOrderData.lcp || '',
        nap: jobOrderData.NAP || jobOrderData.nap || '',
        port: jobOrderData.PORT || jobOrderData.port || '',
        vlan: jobOrderData.VLAN || jobOrderData.vlan || '',
        onsiteStatus: loadedOnsiteStatus,
        onsiteRemarks: jobOrderData.Onsite_Remarks || jobOrderData.onsite_remarks || '',
        itemName1: jobOrderData.Item_Name_1 || jobOrderData.item_name_1 || '',
        visitBy: jobOrderData.Visit_By || jobOrderData.visit_by || '',
        visitWith: jobOrderData.Visit_With || jobOrderData.visit_with || '',
        visitWithOther: jobOrderData.Visit_With_Other || jobOrderData.visit_with_other || '',
        statusRemarks: jobOrderData.Status_Remarks || jobOrderData.status_remarks || '',
        ip: jobOrderData.IP || jobOrderData.ip || '',
        addressCoordinates: jobOrderData.Address_Coordinates || jobOrderData.address_coordinates || ''
      }));
    }
  }, [jobOrderData, isOpen]);

  const handleInputChange = (field: keyof JobOrderDoneFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (field: 'signedContractImage' | 'setupImage' | 'boxReadingImage' | 'routerReadingImage' | 'portLabelImage', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.choosePlan.trim()) newErrors.choosePlan = 'Choose Plan is required';
    if (!formData.onsiteStatus.trim()) newErrors.onsiteStatus = 'Onsite Status is required';
    if (!formData.provider.trim()) newErrors.provider = 'Provider is required';
    
    if (formData.onsiteStatus === 'Done') {
      if (!formData.dateInstalled.trim()) newErrors.dateInstalled = 'Date Installed is required';
      if (!formData.usageType.trim()) newErrors.usageType = 'Usage Type is required';
      if (!formData.connectionType.trim()) newErrors.connectionType = 'Connection Type is required';
      if (!formData.routerModel.trim()) newErrors.routerModel = 'Router Model is required';
      if (!formData.modemSN.trim()) newErrors.modemSN = 'Modem SN is required';
      
      if (formData.connectionType === 'Antenna') {
        if (!formData.ip.trim()) newErrors.ip = 'IP is required';
        if (!formData.portLabelImage) newErrors.portLabelImage = 'Port Label Image is required';
      } else if (formData.connectionType === 'Fiber') {
        if (!formData.lcp.trim()) newErrors.lcp = 'LCP is required';
        if (!formData.nap.trim()) newErrors.nap = 'NAP is required';
        if (!formData.port.trim()) newErrors.port = 'PORT is required';
        if (!formData.vlan.trim()) newErrors.vlan = 'VLAN is required';
      } else if (formData.connectionType === 'Local') {
        if (!formData.portLabelImage) newErrors.portLabelImage = 'Port Label Image is required';
      }
      
      if (!formData.visitBy.trim()) newErrors.visitBy = 'Visit By is required';
      if (!formData.visitWith.trim()) newErrors.visitWith = 'Visit With is required';
      if (!formData.visitWithOther.trim()) newErrors.visitWithOther = 'Visit With(Other) is required';
      if (!formData.onsiteRemarks.trim()) newErrors.onsiteRemarks = 'Onsite Remarks is required';
      if (!formData.addressCoordinates.trim()) newErrors.addressCoordinates = 'Address Coordinates is required';
      if (!formData.itemName1.trim()) newErrors.itemName1 = 'Item Name 1 is required';
      if (!formData.signedContractImage) newErrors.signedContractImage = 'Signed Contract Image is required';
      if (!formData.setupImage) newErrors.setupImage = 'Setup Image is required';
      if (!formData.boxReadingImage) newErrors.boxReadingImage = 'Box Reading Image is required';
      if (!formData.routerReadingImage) newErrors.routerReadingImage = 'Router Reading Image is required';
      if (!formData.clientSignature) newErrors.clientSignature = 'Client Signature is required';
    }
    
    if (formData.onsiteStatus === 'Failed' || formData.onsiteStatus === 'Reschedule') {
      if (!formData.visitBy.trim()) newErrors.visitBy = 'Visit By is required';
      if (!formData.visitWith.trim()) newErrors.visitWith = 'Visit With is required';
      if (!formData.visitWithOther.trim()) newErrors.visitWithOther = 'Visit With(Other) is required';
      if (!formData.onsiteRemarks.trim()) newErrors.onsiteRemarks = 'Onsite Remarks is required';
      if (!formData.statusRemarks.trim()) newErrors.statusRemarks = 'Status Remarks is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const updatedFormData = {
      ...formData,
      modifiedBy: currentUserEmail,
      modifiedDate: new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    };
    
    setFormData(updatedFormData);
    
    if (!validateForm()) {
      alert('Please fill in all required fields before saving.');
      return;
    }

    if (!jobOrderData?.id && !jobOrderData?.JobOrder_ID) {
      alert('Cannot update job order: Missing ID');
      return;
    }

    setLoading(true);
    try {
      const jobOrderId = jobOrderData.id || jobOrderData.JobOrder_ID;
      
      const jobOrderUpdateData: any = {
        Choose_Plan: updatedFormData.choosePlan,
        Onsite_Status: updatedFormData.onsiteStatus,
        Provider: updatedFormData.provider,
        Modified_By: updatedFormData.modifiedBy,
        Modified_Date: updatedFormData.modifiedDate
      };
      
      if (updatedFormData.onsiteStatus === 'Done') {
        jobOrderUpdateData.Date_Installed = updatedFormData.dateInstalled;
        jobOrderUpdateData.Usage_Type = updatedFormData.usageType;
        jobOrderUpdateData.Connection_Type = updatedFormData.connectionType;
        jobOrderUpdateData.Router_Model = updatedFormData.routerModel;
        jobOrderUpdateData.Modem_SN = updatedFormData.modemSN;
        jobOrderUpdateData.LCP = updatedFormData.lcp;
        jobOrderUpdateData.NAP = updatedFormData.nap;
        jobOrderUpdateData.PORT = updatedFormData.port;
        jobOrderUpdateData.VLAN = updatedFormData.vlan;
        jobOrderUpdateData.IP = updatedFormData.ip;
        jobOrderUpdateData.Visit_By = updatedFormData.visitBy;
        jobOrderUpdateData.Visit_With = updatedFormData.visitWith;
        jobOrderUpdateData.Visit_With_Other = updatedFormData.visitWithOther;
        jobOrderUpdateData.Onsite_Remarks = updatedFormData.onsiteRemarks;
        jobOrderUpdateData.Address_Coordinates = updatedFormData.addressCoordinates;
        jobOrderUpdateData.Item_Name_1 = updatedFormData.itemName1;
      }
      
      if (updatedFormData.onsiteStatus === 'Failed' || updatedFormData.onsiteStatus === 'Reschedule') {
        jobOrderUpdateData.Visit_By = updatedFormData.visitBy;
        jobOrderUpdateData.Visit_With = updatedFormData.visitWith;
        jobOrderUpdateData.Visit_With_Other = updatedFormData.visitWithOther;
        jobOrderUpdateData.Onsite_Remarks = updatedFormData.onsiteRemarks;
        jobOrderUpdateData.Status_Remarks = updatedFormData.statusRemarks;
      }

      console.log('Updating job order with ID:', jobOrderId);
      console.log('Job order update data:', jobOrderUpdateData);

      const jobOrderResponse = await updateJobOrder(jobOrderId, jobOrderUpdateData);
      
      if (!jobOrderResponse.success) {
        throw new Error(jobOrderResponse.message || 'Job order update failed');
      }

      console.log('Job order updated successfully:', jobOrderResponse);

      alert('Job Order updated successfully!');
      setErrors({});
      onSave(updatedFormData);
      onClose();
    } catch (error: any) {
      console.error('Error updating records:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to update records: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fullName = `${jobOrderData?.First_Name || jobOrderData?.first_name || ''} ${jobOrderData?.Middle_Initial || jobOrderData?.middle_initial || ''} ${jobOrderData?.Last_Name || jobOrderData?.last_name || ''}`.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="h-full w-full max-w-2xl bg-gray-900 shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-xl font-semibold text-white">{fullName}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="px-4 py-2 border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white rounded text-sm">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded text-sm">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Choose Plan<span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={formData.choosePlan} onChange={(e) => handleInputChange('choosePlan', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.choosePlan ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                <option value="">Select Plan</option>
                {formData.choosePlan && !plans.some(plan => plan.name === formData.choosePlan) && (
                  <option value={formData.choosePlan}>{formData.choosePlan}</option>
                )}
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.name}>
                    {plan.name}{plan.price ? ` - P${plan.price}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.choosePlan && <p className="text-red-500 text-xs mt-1">{errors.choosePlan}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Onsite Status<span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={formData.onsiteStatus} onChange={(e) => handleInputChange('onsiteStatus', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.onsiteStatus ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Failed">Failed</option>
                <option value="Reschedule">Reschedule</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.onsiteStatus && <p className="text-red-500 text-xs mt-1">{errors.onsiteStatus}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Provider<span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={formData.provider} onChange={(e) => handleInputChange('provider', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.provider ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                <option value="">Select Provider</option>
                <option value="SWITCH">SWITCH</option>
                <option value="Provider 2">Provider 2</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
          </div>

          {formData.onsiteStatus === 'Done' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Installed<span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="date" value={formData.dateInstalled} onChange={(e) => handleInputChange('dateInstalled', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.dateInstalled ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`} />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.dateInstalled && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Usage Type<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.usageType} onChange={(e) => handleInputChange('usageType', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.usageType ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.usageType && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Connection Type<span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => handleInputChange('connectionType', 'Antenna')} className={`py-2 px-4 rounded border ${formData.connectionType === 'Antenna' ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'} text-white`}>Antenna</button>
                  <button type="button" onClick={() => handleInputChange('connectionType', 'Fiber')} className={`py-2 px-4 rounded border ${formData.connectionType === 'Fiber' ? 'bg-red-600 border-red-700' : 'bg-gray-800 border-gray-700'} text-white`}>Fiber</button>
                  <button type="button" onClick={() => handleInputChange('connectionType', 'Local')} className={`py-2 px-4 rounded border ${formData.connectionType === 'Local' ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'} text-white`}>Local</button>
                </div>
                {errors.connectionType && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Router Model<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.routerModel} onChange={(e) => handleInputChange('routerModel', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.routerModel ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.routerModel && !routerModels.some(rm => rm.Model === formData.routerModel) && (
                      <option value={formData.routerModel}>{formData.routerModel}</option>
                    )}
                    {routerModels.map((routerModel, index) => (
                      <option key={index} value={routerModel.Model}>{routerModel.Model}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.routerModel && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Modem SN<span className="text-red-500">*</span></label>
                <input type="text" value={formData.modemSN} onChange={(e) => handleInputChange('modemSN', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.modemSN ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`} />
                {errors.modemSN && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              {formData.connectionType === 'Antenna' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IP<span className="text-red-500">*</span></label>
                  <input type="text" value={formData.ip} onChange={(e) => handleInputChange('ip', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.ip ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500`} />
                  {errors.ip && (
                    <div className="flex items-center mt-1">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                      <p className="text-orange-500 text-xs">This entry is required</p>
                    </div>
                  )}
                </div>
              )}

              {formData.connectionType === 'Fiber' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">LCP<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select value={formData.lcp} onChange={(e) => handleInputChange('lcp', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.lcp ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                        <option value="">Select LCP</option>
                        {formData.lcp && !lcps.some(l => l.lcp_name === formData.lcp) && (
                          <option value={formData.lcp}>{formData.lcp}</option>
                        )}
                        {lcps.map((lcp) => (
                          <option key={lcp.id} value={lcp.lcp_name}>
                            {lcp.lcp_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                    </div>
                    {errors.lcp && (
                      <div className="flex items-center mt-1">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                        <p className="text-orange-500 text-xs">This entry is required</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">NAP<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select value={formData.nap} onChange={(e) => handleInputChange('nap', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.nap ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                        <option value="">Select NAP</option>
                        {formData.nap && !naps.some(n => n.nap_name === formData.nap) && (
                          <option value={formData.nap}>{formData.nap}</option>
                        )}
                        {naps.map((nap) => (
                          <option key={nap.id} value={nap.nap_name}>
                            {nap.nap_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                    </div>
                    {errors.nap && (
                      <div className="flex items-center mt-1">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                        <p className="text-orange-500 text-xs">This entry is required</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">PORT<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select value={formData.port} onChange={(e) => handleInputChange('port', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.port ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                        <option value="">Select PORT</option>
                        {formData.port && !ports.some(p => p.Label === formData.port) && (
                          <option value={formData.port}>{formData.port}</option>
                        )}
                        {ports.map((port) => (
                          <option key={port.id} value={port.Label}>
                            {port.Label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                    </div>
                    {errors.port && (
                      <div className="flex items-center mt-1">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                        <p className="text-orange-500 text-xs">This entry is required</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">VLAN<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select value={formData.vlan} onChange={(e) => handleInputChange('vlan', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.vlan ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                        <option value="">Select VLAN</option>
                        {formData.vlan && !vlans.some(v => v.Value === formData.vlan) && (
                          <option value={formData.vlan}>{formData.vlan}</option>
                        )}
                        {vlans.map((vlan) => (
                          <option key={vlan.id} value={vlan.Value}>
                            {vlan.Value}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                    </div>
                    {errors.vlan && (
                      <div className="flex items-center mt-1">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                        <p className="text-orange-500 text-xs">This entry is required</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit By<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visitBy} onChange={(e) => handleInputChange('visitBy', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitBy ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visitBy && !technicians.some(t => t.name === formData.visitBy) && (
                      <option value={formData.visitBy}>{formData.visitBy}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visitBy && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visitWith} onChange={(e) => handleInputChange('visitWith', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitWith ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visitWith && !technicians.some(t => t.name === formData.visitWith) && (
                      <option value={formData.visitWith}>{formData.visitWith}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visitWith && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With(Other)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visitWithOther} onChange={(e) => handleInputChange('visitWithOther', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitWithOther ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visitWithOther && !technicians.some(t => t.name === formData.visitWithOther) && (
                      <option value={formData.visitWithOther}>{formData.visitWithOther}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visitWithOther && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Onsite Remarks<span className="text-red-500">*</span></label>
                <textarea value={formData.onsiteRemarks} onChange={(e) => handleInputChange('onsiteRemarks', e.target.value)} rows={3} className={`w-full px-3 py-2 bg-gray-800 border ${errors.onsiteRemarks ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 resize-none`} />
                {errors.onsiteRemarks && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Box Reading Image<span className="text-red-500">*</span></label>
                <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload('boxReadingImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {formData.boxReadingImage ? (
                    <div className="text-green-500 flex items-center"><Camera className="mr-2" size={20} />Image uploaded</div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center"><Camera size={32} /><span className="text-sm mt-2">Click to upload</span></div>
                  )}
                </div>
                {errors.boxReadingImage && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Router Reading Image<span className="text-red-500">*</span></label>
                <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload('routerReadingImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {formData.routerReadingImage ? (
                    <div className="text-green-500 flex items-center"><Camera className="mr-2" size={20} />Image uploaded</div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center"><Camera size={32} /><span className="text-sm mt-2">Click to upload</span></div>
                  )}
                </div>
                {errors.routerReadingImage && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              {(formData.connectionType === 'Antenna' || formData.connectionType === 'Local') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Port Label Image<span className="text-red-500">*</span></label>
                  <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750">
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload('portLabelImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {formData.portLabelImage ? (
                      <div className="text-green-500 flex items-center"><Camera className="mr-2" size={20} />Image uploaded</div>
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center"><Camera size={32} /><span className="text-sm mt-2">Click to upload</span></div>
                    )}
                  </div>
                  {errors.portLabelImage && (
                    <div className="flex items-center mt-1">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                      <p className="text-orange-500 text-xs">This entry is required</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Setup Image<span className="text-red-500">*</span></label>
                <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload('setupImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {formData.setupImage ? (
                    <div className="text-green-500 flex items-center"><Camera className="mr-2" size={20} />Image uploaded</div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center"><Camera size={32} /><span className="text-sm mt-2">Click to upload</span></div>
                  )}
                </div>
                {errors.setupImage && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Signed Contract Image<span className="text-red-500">*</span></label>
                <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload('signedContractImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {formData.signedContractImage ? (
                    <div className="text-green-500 flex items-center"><Camera className="mr-2" size={20} />Image uploaded</div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center"><Camera size={32} /><span className="text-sm mt-2">Click to upload</span></div>
                  )}
                </div>
                {errors.signedContractImage && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Client Signature<span className="text-red-500">*</span></label>
                <div className="w-full h-40 bg-gray-800 border border-gray-700 rounded flex items-center justify-center">
                  <span className="text-gray-400">Signature canvas placeholder</span>
                </div>
                {errors.clientSignature && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Item Name 1<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.itemName1} onChange={(e) => handleInputChange('itemName1', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.itemName1 ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    <option value="Router">Router</option>
                    <option value="Modem">Modem</option>
                    <option value="Cable">Cable</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.itemName1 && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address Coordinates<span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={formData.addressCoordinates} onChange={(e) => handleInputChange('addressCoordinates', e.target.value)} placeholder="14.466580, 121.201807" className={`w-full px-3 py-2 bg-gray-800 border ${errors.addressCoordinates ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 pr-10`} />
                  <MapPin className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.addressCoordinates && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>
            </>
          )}

          {(formData.onsiteStatus === 'Failed' || formData.onsiteStatus === 'Reschedule') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit By<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visitBy} onChange={(e) => handleInputChange('visitBy', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitBy ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visitBy && !technicians.some(t => t.name === formData.visitBy) && (
                      <option value={formData.visitBy}>{formData.visitBy}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visitBy && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visitWith} onChange={(e) => handleInputChange('visitWith', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitWith ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visitWith && !technicians.some(t => t.name === formData.visitWith) && (
                      <option value={formData.visitWith}>{formData.visitWith}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visitWith && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With(Other)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visitWithOther} onChange={(e) => handleInputChange('visitWithOther', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visitWithOther ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visitWithOther && !technicians.some(t => t.name === formData.visitWithOther) && (
                      <option value={formData.visitWithOther}>{formData.visitWithOther}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visitWithOther && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Onsite Remarks<span className="text-red-500">*</span></label>
                <textarea value={formData.onsiteRemarks} onChange={(e) => handleInputChange('onsiteRemarks', e.target.value)} rows={3} className={`w-full px-3 py-2 bg-gray-800 border ${errors.onsiteRemarks ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 resize-none`} />
                {errors.onsiteRemarks && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status Remarks<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.statusRemarks} onChange={(e) => handleInputChange('statusRemarks', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.statusRemarks ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    <option value="Customer Request">Customer Request</option>
                    <option value="Bad Weather">Bad Weather</option>
                    <option value="Technician Unavailable">Technician Unavailable</option>
                    <option value="Equipment Issue">Equipment Issue</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.statusRemarks && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobOrderDoneFormTechModal;
