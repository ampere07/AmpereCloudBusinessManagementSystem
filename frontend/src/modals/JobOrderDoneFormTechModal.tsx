import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronDown, Camera, MapPin } from 'lucide-react';
import { UserData } from '../types/api';
import { updateJobOrder } from '../services/jobOrderService';
import { userService } from '../services/userService';
import { planService, Plan } from '../services/planService';
import { routerModelService, RouterModel } from '../services/routerModelService';
import { getAllPorts, Port } from '../services/portService';
import { getAllLCPNAPs, LCPNAP } from '../services/lcpnapService';
import { getAllVLANs, VLAN } from '../services/vlanService';
import { getAllGroups, Group } from '../services/groupService';
import { getAllUsageTypes, UsageType } from '../services/usageTypeService';
import { getAllInventoryItems, InventoryItem } from '../services/inventoryItemService';
import { createJobOrderItems, JobOrderItem } from '../services/jobOrderItemService';
import apiClient from '../config/api';

interface JobOrderDoneFormTechModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  jobOrderData?: any;
}



interface JobOrderDoneFormData {
  dateInstalled: string;
  usageType: string;
  choosePlan: string;
  connectionType: string;
  routerModel: string;
  modemSN: string;
  groupName: string;
  lcpnap: string;
  port: string;
  vlan: string;
  onsiteStatus: string;
  onsiteRemarks: string;
  signedContractImage: File | null;
  setupImage: File | null;
  boxReadingImage: File | null;
  routerReadingImage: File | null;
  portLabelImage: File | null;
  clientSignatureImage: File | null;
  modifiedBy: string;
  modifiedDate: string;
  itemName1: string;
  visit_by: string;
  visit_with: string;
  visit_with_other: string;
  statusRemarks: string;
  ip: string;
  addressCoordinates: string;
}

interface OrderItem {
  itemId: string;
  quantity: string;
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
    groupName: '',
    lcpnap: '',
    port: '',
    vlan: '',
    onsiteStatus: 'In Progress',
    onsiteRemarks: '',
    signedContractImage: null,
    setupImage: null,
    boxReadingImage: null,
    routerReadingImage: null,
    portLabelImage: null,
    clientSignatureImage: null,
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
    visit_by: '',
    visit_with: '',
    visit_with_other: '',
    statusRemarks: '',
    ip: '',
    addressCoordinates: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [technicians, setTechnicians] = useState<Array<{ email: string; name: string }>>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [routerModels, setRouterModels] = useState<RouterModel[]>([]);
  const [lcpnaps, setLcpnaps] = useState<LCPNAP[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [vlans, setVlans] = useState<VLAN[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [usageTypes, setUsageTypes] = useState<UsageType[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ itemId: '', quantity: '' }]);

  useEffect(() => {
    if (!isOpen) {
      setOrderItems([{ itemId: '', quantity: '' }]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchLcpnaps = async () => {
      if (isOpen) {
        try {
          console.log('Fetching LCPNAP data from database...');
          const response = await getAllLCPNAPs();
          console.log('LCPNAP API Response:', response);
          console.log('LCPNAP Data:', response.data);
          
          if (response.success && Array.isArray(response.data)) {
            setLcpnaps(response.data);
            console.log('Successfully loaded LCPNAP records:', response.data.length);
            console.log('LCPNAP Names:', response.data.map(l => l.lcpnap_name));
          } else {
            console.warn('Unexpected LCPNAP response structure:', response);
            setLcpnaps([]);
          }
        } catch (error) {
          console.error('Error fetching LCPNAP records:', error);
          console.error('Error details:', error);
          setLcpnaps([]);
        }
      }
    };
    
    fetchLcpnaps();
  }, [isOpen]);

  useEffect(() => {
    const fetchPorts = async () => {
      if (isOpen) {
        try {
          const jobOrderId = jobOrderData?.id || jobOrderData?.JobOrder_ID;
          const response = await getAllPorts('', 1, 100, true, jobOrderId);
          if (response.success && Array.isArray(response.data)) {
            setPorts(response.data);
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
  }, [isOpen, jobOrderData]);

  useEffect(() => {
    const fetchVlans = async () => {
      if (isOpen) {
        try {
          const response = await getAllVLANs();
          if (response.success && Array.isArray(response.data)) {
            setVlans(response.data);
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
    const fetchGroups = async () => {
      if (isOpen) {
        try {
          const response = await getAllGroups();
          if (response.success && Array.isArray(response.data)) {
            setGroups(response.data);
          } else {
            setGroups([]);
          }
        } catch (error) {
          console.error('Error fetching Groups:', error);
          setGroups([]);
        }
      }
    };
    fetchGroups();
  }, [isOpen]);

  useEffect(() => {
    const fetchUsageTypes = async () => {
      if (isOpen) {
        try {
          console.log('Loading usage types from database...');
          const response = await getAllUsageTypes();
          console.log('Usage Type API Response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            setUsageTypes(response.data);
            console.log('Loaded Usage Types:', response.data.length);
          } else {
            console.warn('Unexpected Usage Type response structure:', response);
            setUsageTypes([]);
          }
        } catch (error) {
          console.error('Error fetching Usage Types:', error);
          setUsageTypes([]);
        }
      }
    };
    
    fetchUsageTypes();
  }, [isOpen]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      if (isOpen) {
        try {
          console.log('Loading inventory items from database...');
          const response = await getAllInventoryItems();
          console.log('Inventory Items API Response:', response);
          
          if (response.success && Array.isArray(response.data)) {
            setInventoryItems(response.data);
            console.log('Loaded Inventory Items:', response.data.length);
          } else {
            console.warn('Unexpected Inventory Items response structure:', response);
            setInventoryItems([]);
          }
        } catch (error) {
          console.error('Error fetching Inventory Items:', error);
          setInventoryItems([]);
        }
      }
    };
    
    fetchInventoryItems();
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
        groupName: jobOrderData.group_name || jobOrderData.Group_Name || '',
        lcpnap: jobOrderData.LCPNAP || jobOrderData.lcpnap || '',
        port: jobOrderData.PORT || jobOrderData.port || '',
        vlan: jobOrderData.VLAN || jobOrderData.vlan || '',
        onsiteStatus: loadedOnsiteStatus,
        onsiteRemarks: jobOrderData.Onsite_Remarks || jobOrderData.onsite_remarks || '',
        itemName1: jobOrderData.Item_Name_1 || jobOrderData.item_name_1 || '',
        visit_by: jobOrderData.Visit_By || jobOrderData.visit_by || '',
        visit_with: jobOrderData.Visit_With || jobOrderData.visit_with || '',
        visit_with_other: jobOrderData.Visit_With_Other || jobOrderData.visit_with_other || '',
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

  const handleImageUpload = (field: 'signedContractImage' | 'setupImage' | 'boxReadingImage' | 'routerReadingImage' | 'portLabelImage' | 'clientSignatureImage', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: 'itemId' | 'quantity', value: string) => {
    const newOrderItems = [...orderItems];
    newOrderItems[index][field] = value;
    setOrderItems(newOrderItems);
    
    if (field === 'itemId' && value && index === orderItems.length - 1) {
      setOrderItems([...newOrderItems, { itemId: '', quantity: '' }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (orderItems.length > 1) {
      const newOrderItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newOrderItems);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.choosePlan.trim()) newErrors.choosePlan = 'Choose Plan is required';
    if (!formData.onsiteStatus.trim()) newErrors.onsiteStatus = 'Onsite Status is required';
    if (!formData.groupName.trim()) newErrors.groupName = 'Group is required';
    
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
        if (!formData.lcpnap.trim()) newErrors.lcpnap = 'LCP-NAP is required';
        if (!formData.port.trim()) newErrors.port = 'PORT is required';
        if (!formData.vlan.trim()) newErrors.vlan = 'VLAN is required';
      } else if (formData.connectionType === 'Local') {
        if (!formData.portLabelImage) newErrors.portLabelImage = 'Port Label Image is required';
      }
      
      if (!formData.visit_by.trim()) newErrors.visit_by = 'Visit By is required';
      if (!formData.visit_with.trim()) newErrors.visit_with = 'Visit With is required';
      if (!formData.visit_with_other.trim()) newErrors.visit_with_other = 'Visit With(Other) is required';
      if (!formData.onsiteRemarks.trim()) newErrors.onsiteRemarks = 'Onsite Remarks is required';
      if (!formData.addressCoordinates.trim()) newErrors.addressCoordinates = 'Address Coordinates is required';
      
      const validItems = orderItems.filter(item => item.itemId && item.quantity);
      if (validItems.length === 0) {
        newErrors.items = 'At least one item with quantity is required';
      } else {
        for (let i = 0; i < validItems.length; i++) {
          if (!validItems[i].itemId) {
            newErrors[`item_${i}`] = 'Item is required';
          }
          if (!validItems[i].quantity || parseInt(validItems[i].quantity) <= 0) {
            newErrors[`quantity_${i}`] = 'Valid quantity is required';
          }
        }
      }
      
      if (!formData.signedContractImage) newErrors.signedContractImage = 'Signed Contract Image is required';
      if (!formData.setupImage) newErrors.setupImage = 'Setup Image is required';
      if (!formData.boxReadingImage) newErrors.boxReadingImage = 'Box Reading Image is required';
      if (!formData.routerReadingImage) newErrors.routerReadingImage = 'Router Reading Image is required';
      if (!formData.clientSignatureImage) newErrors.clientSignatureImage = 'Client Signature Image is required';
    }
    
    if (formData.onsiteStatus === 'Failed' || formData.onsiteStatus === 'Reschedule') {
      if (!formData.visit_by.trim()) newErrors.visit_by = 'Visit By is required';
      if (!formData.visit_with.trim()) newErrors.visit_with = 'Visit With is required';
      if (!formData.visit_with_other.trim()) newErrors.visit_with_other = 'Visit With(Other) is required';
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
        date_installed: updatedFormData.dateInstalled,
        usage_type: updatedFormData.usageType,
        router_model: updatedFormData.routerModel,
        lcpnap: updatedFormData.lcpnap,
        port: updatedFormData.port,
        vlan: updatedFormData.vlan,
        visit_by: updatedFormData.visit_by,
        visit_with: updatedFormData.visit_with,
        visit_with_other: updatedFormData.visit_with_other,
        updated_by_user_email: updatedFormData.modifiedBy
      };
      
      if (updatedFormData.onsiteStatus === 'Done') {
        jobOrderUpdateData.connection_type = updatedFormData.connectionType;
        jobOrderUpdateData.modem_router_sn = updatedFormData.modemSN;
        jobOrderUpdateData.ip_address = updatedFormData.ip;
        jobOrderUpdateData.onsite_remarks = updatedFormData.onsiteRemarks;
        jobOrderUpdateData.address_coordinates = updatedFormData.addressCoordinates;
        jobOrderUpdateData.onsite_status = 'Done';
        jobOrderUpdateData.group_name = updatedFormData.groupName;
      }
      
      if (updatedFormData.onsiteStatus === 'Failed' || updatedFormData.onsiteStatus === 'Reschedule') {
        jobOrderUpdateData.onsite_remarks = updatedFormData.onsiteRemarks;
        jobOrderUpdateData.status_remarks = updatedFormData.statusRemarks;
        jobOrderUpdateData.onsite_status = updatedFormData.onsiteStatus;
      }
      
      if (updatedFormData.onsiteStatus === 'In Progress') {
        jobOrderUpdateData.onsite_status = 'In Progress';
        jobOrderUpdateData.group_name = updatedFormData.groupName;
      }

      console.log('Updating job order with ID:', jobOrderId);
      console.log('Job order update data:', JSON.stringify(jobOrderUpdateData, null, 2));

      const jobOrderResponse = await updateJobOrder(jobOrderId, jobOrderUpdateData);
      
      if (!jobOrderResponse.success) {
        throw new Error(jobOrderResponse.message || 'Job order update failed');
      }

      console.log('Job order updated successfully:', jobOrderResponse);

      if (updatedFormData.onsiteStatus === 'Done') {
        console.log('========== ITEMS BEFORE FILTERING ==========');
        console.log('Total order items count:', orderItems.length);
        orderItems.forEach((item, index) => {
          console.log(`Item ${index + 1}:`, {
            itemId: item.itemId,
            itemId_type: typeof item.itemId,
            itemId_isEmpty: item.itemId === '',
            itemId_length: item.itemId.length,
            quantity: item.quantity,
            quantity_type: typeof item.quantity,
            quantity_parsed: parseInt(item.quantity),
            quantity_isValid: !isNaN(parseInt(item.quantity)) && parseInt(item.quantity) > 0
          });
        });
        console.log('==========================================');

        const validItems = orderItems.filter(item => {
          const quantity = parseInt(item.quantity);
          const isValid = item.itemId && item.itemId.trim() !== '' && !isNaN(quantity) && quantity > 0;
          
          console.log(`Validating item - itemId: "${item.itemId}", quantity: "${item.quantity}", isValid: ${isValid}`);
          
          return isValid;
        });

        console.log('Filtered valid items:', validItems);
        console.log('Total order items:', orderItems);

        if (validItems.length > 0) {
          const jobOrderItems: JobOrderItem[] = validItems.map(item => {
            return {
              job_order_id: parseInt(jobOrderId.toString()),
              item_name: item.itemId,
              quantity: parseInt(item.quantity)
            };
          });

          console.log('Sending job order items to API:');
          console.log('- Job Order ID:', jobOrderId);
          console.log('- Items:', JSON.stringify(jobOrderItems, null, 2));
          
          try {
            const itemsResponse = await createJobOrderItems(jobOrderItems);
            
            if (!itemsResponse.success) {
              throw new Error(itemsResponse.message || 'Failed to create job order items');
            }
            
            console.log('Job order items created successfully:', itemsResponse);
            console.log('Items saved:', itemsResponse.data);
          } catch (itemsError: any) {
            console.error('========== JOB ORDER ITEMS ERROR ==========');
            console.error('Error creating job order items:', itemsError);
            console.error('Error message:', itemsError.message);
            console.error('Error response:', itemsError.response);
            console.error('Error response data:', itemsError.response?.data);
            console.error('Error response status:', itemsError.response?.status);
            console.error('Items that failed:', jobOrderItems);
            console.error('=========================================');
            
            const errorMsg = itemsError.response?.data?.message || itemsError.message || 'Unknown error';
            const validationErrors = itemsError.response?.data?.errors;
            
            let errorDetails = `Failed to save items: ${errorMsg}`;
            if (validationErrors) {
              errorDetails += '\n\nValidation Errors:\n' + JSON.stringify(validationErrors, null, 2);
            }
            
            alert(`Job order saved but items were not saved:\n\n${errorDetails}\n\nPlease check the console for more details or contact support.`);
            setLoading(false);
            return;
          }
        } else {
          console.warn('No valid items to save');
        }
      }

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
            <label className="block text-sm font-medium text-gray-300 mb-2">Group<span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={formData.groupName} onChange={(e) => handleInputChange('groupName', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.groupName ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                <option value="">Select Group</option>
                {formData.groupName && !groups.some(g => g.group_name === formData.groupName) && (
                  <option value={formData.groupName}>{formData.groupName}</option>
                )}
                {groups.map((group) => (
                  <option key={group.id} value={group.group_name}>
                    {group.group_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.groupName && <p className="text-red-500 text-xs mt-1">{errors.groupName}</p>}
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
                    {formData.usageType && !usageTypes.some(ut => ut.usage_name === formData.usageType) && (
                      <option value={formData.usageType}>{formData.usageType}</option>
                    )}
                    {usageTypes.map((usageType) => (
                      <option key={usageType.id} value={usageType.usage_name}>
                        {usageType.usage_name}
                      </option>
                    ))}
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
                  <button type="button" onClick={() => handleInputChange('connectionType', 'Antenna')} className={`py-2 px-4 rounded border ${formData.connectionType === 'Antenna' ? 'bg-orange-600 border-orange-700' : 'bg-gray-800 border-gray-700'} text-white transition-colors duration-200`}>Antenna</button>
                  <button type="button" onClick={() => handleInputChange('connectionType', 'Fiber')} className={`py-2 px-4 rounded border ${formData.connectionType === 'Fiber' ? 'bg-orange-600 border-orange-700' : 'bg-gray-800 border-gray-700'} text-white transition-colors duration-200`}>Fiber</button>
                  <button type="button" onClick={() => handleInputChange('connectionType', 'Local')} className={`py-2 px-4 rounded border ${formData.connectionType === 'Local' ? 'bg-orange-600 border-orange-700' : 'bg-gray-800 border-gray-700'} text-white transition-colors duration-200`}>Local</button>
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
                    {formData.routerModel && !routerModels.some(rm => rm.model === formData.routerModel) && (
                      <option value={formData.routerModel}>{formData.routerModel}</option>
                    )}
                    {routerModels.map((routerModel, index) => (
                      <option key={index} value={routerModel.model}>{routerModel.model}</option>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">LCP-NAP<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select 
                        value={formData.lcpnap} 
                        onChange={(e) => handleInputChange('lcpnap', e.target.value)} 
                        className={`w-full px-3 py-2 bg-gray-800 border ${errors.lcpnap ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}
                      >
                        <option value="">Select LCP-NAP</option>
                        {formData.lcpnap && !lcpnaps.some(ln => ln.lcpnap_name === formData.lcpnap) && (
                          <option value={formData.lcpnap}>{formData.lcpnap}</option>
                        )}
                        {lcpnaps.map((lcpnap) => (
                          <option key={lcpnap.id} value={lcpnap.lcpnap_name}>
                            {lcpnap.lcpnap_name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                    </div>
                    {errors.lcpnap && (
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
                        {formData.vlan && !vlans.some(v => v.value.toString() === formData.vlan) && (
                          <option value={formData.vlan}>{formData.vlan}</option>
                        )}
                        {vlans.map((vlan) => (
                          <option key={vlan.vlan_id} value={vlan.value}>
                            {vlan.value}
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
                  <select value={formData.visit_by} onChange={(e) => handleInputChange('visit_by', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_by ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visit_by && !technicians.some(t => t.name === formData.visit_by) && (
                      <option value={formData.visit_by}>{formData.visit_by}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visit_by && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visit_with} onChange={(e) => handleInputChange('visit_with', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_with ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value="">Select Visit With</option>
                    <option value="None">None</option>
                    {formData.visit_with && !technicians.some(t => t.name === formData.visit_with) && (
                      <option value={formData.visit_with}>{formData.visit_with}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visit_with && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With(Other)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visit_with_other} onChange={(e) => handleInputChange('visit_with_other', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_with_other ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value="">Visit With(Other)</option>
                    <option value="None">None</option>
                    {formData.visit_with_other && !technicians.some(t => t.name === formData.visit_with_other) && (
                      <option value={formData.visit_with_other}>{formData.visit_with_other}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visit_with_other && (
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Client Signature Image<span className="text-red-500">*</span></label>
                <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload('clientSignatureImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {formData.clientSignatureImage ? (
                    <div className="text-green-500 flex items-center"><Camera className="mr-2" size={20} />Image uploaded</div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center"><Camera size={32} /><span className="text-sm mt-2">Click to upload</span></div>
                  )}
                </div>
                {errors.clientSignatureImage && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Items<span className="text-red-500">*</span></label>
                {orderItems.map((item, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="relative">
                          <select 
                            value={item.itemId} 
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)} 
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500 appearance-none"
                          >
                            <option value="">Select Item {index + 1}</option>
                            {inventoryItems.map((invItem) => (
                              <option key={invItem.id} value={invItem.item_name}>
                                {invItem.item_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                        </div>
                        {errors[`item_${index}`] && (
                          <p className="text-orange-500 text-xs mt-1">{errors[`item_${index}`]}</p>
                        )}
                      </div>
                      
                      {item.itemId && (
                        <div className="w-32">
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                            placeholder="Qty"
                            min="1"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-orange-500"
                          />
                          {errors[`quantity_${index}`] && (
                            <p className="text-orange-500 text-xs mt-1">{errors[`quantity_${index}`]}</p>
                          )}
                        </div>
                      )}
                      
                      {orderItems.length > 1 && item.itemId && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-500 hover:text-red-400"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {errors.items && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">{errors.items}</p>
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
                  <select value={formData.visit_by} onChange={(e) => handleInputChange('visit_by', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_by ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value=""></option>
                    {formData.visit_by && !technicians.some(t => t.name === formData.visit_by) && (
                      <option value={formData.visit_by}>{formData.visit_by}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visit_by && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visit_with} onChange={(e) => handleInputChange('visit_with', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_with ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value="">Visit With</option>
                    <option value="None">None</option>
                    {formData.visit_with && !technicians.some(t => t.name === formData.visit_with) && (
                      <option value={formData.visit_with}>{formData.visit_with}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visit_with && (
                  <div className="flex items-center mt-1">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-xs mr-2">!</div>
                    <p className="text-orange-500 text-xs">This entry is required</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visit With(Other)<span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.visit_with_other} onChange={(e) => handleInputChange('visit_with_other', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.visit_with_other ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                    <option value="">Visit With(Other)</option>
                    <option value="None">None</option>
                    {formData.visit_with_other && !technicians.some(t => t.name === formData.visit_with_other) && (
                      <option value={formData.visit_with_other}>{formData.visit_with_other}</option>
                    )}
                    {technicians.map((technician, index) => (
                      <option key={index} value={technician.name}>{technician.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                </div>
                {errors.visit_with_other && (
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
