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
import { createJobOrderItems, JobOrderItem, deleteJobOrderItems } from '../services/jobOrderItemService';
import { getRegions, getCities, City } from '../services/cityService';
import { barangayService, Barangay } from '../services/barangayService';
import { locationDetailService, LocationDetail } from '../services/locationDetailService';
import { updateApplication } from '../services/applicationService';
import apiClient from '../config/api';

interface Region {
  id: number;
  name: string;
}

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
  region: string;
  city: string;
  barangay: string;
  location: string;
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
  speedTestImage: File | null;
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
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const currentUserEmail = currentUser?.email || 'unknown@unknown.com';

  const [formData, setFormData] = useState<JobOrderDoneFormData>({
    dateInstalled: '',
    usageType: '',
    choosePlan: '',
    connectionType: '',
    routerModel: '',
    modemSN: '',
    groupName: '',
    region: '',
    city: '',
    barangay: '',
    location: '',
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
    speedTestImage: null,
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
  const [regions, setRegions] = useState<Region[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [allBarangays, setAllBarangays] = useState<Barangay[]>([]);
  const [allLocations, setAllLocations] = useState<LocationDetail[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ itemId: '', quantity: '' }]);

  useEffect(() => {
    if (!isOpen) {
      setOrderItems([{ itemId: '', quantity: '' }]);
    }
  }, [isOpen]);

  // Load existing job order items from database
  useEffect(() => {
    const fetchJobOrderItems = async () => {
      if (isOpen && jobOrderData) {
        const jobOrderId = jobOrderData.id || jobOrderData.JobOrder_ID;
        if (jobOrderId) {
          try {
            const response = await apiClient.get(`/job-order-items?job_order_id=${jobOrderId}`);
            const data = response.data as { success: boolean; data: any[] };
            
            if (data.success && Array.isArray(data.data)) {
              const items = data.data;
              
              if (items.length > 0) {
                const uniqueItems = new Map();
                
                items.forEach((item: any) => {
                  const key = item.item_name;
                  if (uniqueItems.has(key)) {
                    const existing = uniqueItems.get(key);
                    uniqueItems.set(key, {
                      itemId: item.item_name || '',
                      quantity: (parseInt(existing.quantity) + parseInt(item.quantity || 0)).toString()
                    });
                  } else {
                    uniqueItems.set(key, {
                      itemId: item.item_name || '',
                      quantity: item.quantity ? item.quantity.toString() : ''
                    });
                  }
                });
                
                const formattedItems = Array.from(uniqueItems.values());
                formattedItems.push({ itemId: '', quantity: '' });
                
                setOrderItems(formattedItems);
              } else {
                setOrderItems([{ itemId: '', quantity: '' }]);
              }
            }
          } catch (error) {
            setOrderItems([{ itemId: '', quantity: '' }]);
          }
        }
      }
    };
    
    fetchJobOrderItems();
  }, [isOpen, jobOrderData]);

  useEffect(() => {
    const fetchLcpnaps = async () => {
      if (isOpen) {
        try {
          const response = await getAllLCPNAPs();
          
          if (response.success && Array.isArray(response.data)) {
            setLcpnaps(response.data);
          } else {
            setLcpnaps([]);
          }
        } catch (error) {
          setLcpnaps([]);
        }
      }
    };
    
    fetchLcpnaps();
  }, [isOpen]);

  useEffect(() => {
    const fetchPorts = async () => {
      if (isOpen && formData.lcpnap) {
        try {
          const jobOrderId = jobOrderData?.id || jobOrderData?.JobOrder_ID;
          const response = await getAllPorts(formData.lcpnap, 1, 100, true, jobOrderId);
          
          if (response.success && Array.isArray(response.data)) {
            setPorts(response.data);
          } else {
            setPorts([]);
          }
        } catch (error) {
          setPorts([]);
        }
      } else if (isOpen && !formData.lcpnap) {
        setPorts([]);
      }
    };
    fetchPorts();
  }, [isOpen, jobOrderData, formData.lcpnap]);

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
          const response = await getAllUsageTypes();
          
          if (response.success && Array.isArray(response.data)) {
            setUsageTypes(response.data);
          } else {
            setUsageTypes([]);
          }
        } catch (error) {
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
          const response = await getAllInventoryItems();
          
          if (response.success && Array.isArray(response.data)) {
            setInventoryItems(response.data);
          } else {
            setInventoryItems([]);
          }
        } catch (error) {
          setInventoryItems([]);
        }
      }
    };
    
    fetchInventoryItems();
  }, [isOpen]);

  useEffect(() => {
    const fetchRegions = async () => {
      if (isOpen) {
        try {
          const fetchedRegions = await getRegions();
          
          if (Array.isArray(fetchedRegions)) {
            setRegions(fetchedRegions);
          } else {
            setRegions([]);
          }
        } catch (error) {
          setRegions([]);
        }
      }
    };
    
    fetchRegions();
  }, [isOpen]);

  useEffect(() => {
    const fetchAllCities = async () => {
      if (isOpen) {
        try {
          const fetchedCities = await getCities();
          
          if (Array.isArray(fetchedCities)) {
            setAllCities(fetchedCities);
          } else {
            setAllCities([]);
          }
        } catch (error) {
          setAllCities([]);
        }
      }
    };
    
    fetchAllCities();
  }, [isOpen]);

  useEffect(() => {
    const fetchAllBarangays = async () => {
      if (isOpen) {
        try {
          const response = await barangayService.getAll();
          
          if (response.success && Array.isArray(response.data)) {
            setAllBarangays(response.data);
          } else {
            setAllBarangays([]);
          }
        } catch (error) {
          setAllBarangays([]);
        }
      }
    };
    
    fetchAllBarangays();
  }, [isOpen]);

  useEffect(() => {
    const fetchAllLocations = async () => {
      if (isOpen) {
        try {
          const response = await locationDetailService.getAll();
          
          if (response.success && Array.isArray(response.data)) {
            setAllLocations(response.data);
          } else {
            setAllLocations([]);
          }
        } catch (error) {
          setAllLocations([]);
        }
      }
    };
    
    fetchAllLocations();
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
        }
      }
    };
    
    fetchRouterModels();
  }, [isOpen]);

  useEffect(() => {
    if (jobOrderData && isOpen) {
      
      const loadedOnsiteStatus = jobOrderData.Onsite_Status || jobOrderData.onsite_status || 'In Progress';
      
      const isEmptyValue = (value: any): boolean => {
        if (value === null || value === undefined || value === '') return true;
        if (typeof value === 'string') {
          const trimmed = value.trim().toLowerCase();
          return trimmed === 'none' || trimmed === 'null';
        }
        return false;
      };
      
      const getValue = (value: any, fieldName: string): string => {
        const result = isEmptyValue(value) ? '' : value;
        return result;
      };
      
      const fetchApplicationData = async () => {
        try {
          const applicationId = jobOrderData.application_id || jobOrderData.Application_ID;
          if (applicationId) {
            const appResponse = await apiClient.get<{ success: boolean; application: any }>(`/applications/${applicationId}`);
            if (appResponse.data.success && appResponse.data.application) {
              const appData = appResponse.data.application;
              
              const newFormData = {
                dateInstalled: getValue(jobOrderData.Date_Installed || jobOrderData.date_installed, 'dateInstalled'),
                usageType: getValue(jobOrderData.Usage_Type || jobOrderData.usage_type, 'usageType'),
                choosePlan: getValue(jobOrderData.Desired_Plan || jobOrderData.desired_plan || jobOrderData.Choose_Plan || jobOrderData.choose_plan || jobOrderData.plan, 'choosePlan'),
                connectionType: getValue(jobOrderData.Connection_Type || jobOrderData.connection_type, 'connectionType'),
                routerModel: getValue(jobOrderData.Router_Model || jobOrderData.router_model, 'routerModel'),
                modemSN: getValue(jobOrderData.Modem_SN || jobOrderData.modem_sn, 'modemSN'),
                groupName: getValue(jobOrderData.group_name || jobOrderData.Group_Name, 'groupName'),
                lcpnap: getValue(jobOrderData.LCPNAP || jobOrderData.lcpnap, 'lcpnap'),
                port: getValue(jobOrderData.PORT || jobOrderData.port, 'port'),
                vlan: getValue(jobOrderData.VLAN || jobOrderData.vlan, 'vlan'),
                region: getValue(appData.region || jobOrderData.Region || jobOrderData.region, 'region'),
                city: getValue(appData.city || jobOrderData.City || jobOrderData.city, 'city'),
                barangay: getValue(appData.barangay || jobOrderData.Barangay || jobOrderData.barangay, 'barangay'),
                location: getValue(appData.location || jobOrderData.Location || jobOrderData.location, 'location'),
                onsiteStatus: loadedOnsiteStatus,
                onsiteRemarks: getValue(jobOrderData.Onsite_Remarks || jobOrderData.onsite_remarks, 'onsiteRemarks'),
                itemName1: getValue(jobOrderData.Item_Name_1 || jobOrderData.item_name_1, 'itemName1'),
                visit_by: getValue(jobOrderData.Visit_By || jobOrderData.visit_by, 'visit_by'),
                visit_with: getValue(jobOrderData.Visit_With || jobOrderData.visit_with, 'visit_with'),
                visit_with_other: getValue(jobOrderData.Visit_With_Other || jobOrderData.visit_with_other, 'visit_with_other'),
                statusRemarks: getValue(jobOrderData.Status_Remarks || jobOrderData.status_remarks, 'statusRemarks'),
                ip: getValue(jobOrderData.IP || jobOrderData.ip, 'ip'),
                addressCoordinates: getValue(jobOrderData.Address_Coordinates || jobOrderData.address_coordinates, 'addressCoordinates')
              };
              
              setFormData(prev => ({
                ...prev,
                ...newFormData
              }));
            }
          } else {
            loadDefaultFormData();
          }
        } catch (error) {
          loadDefaultFormData();
        }
      };
      
      const loadDefaultFormData = () => {
        const newFormData = {
          dateInstalled: getValue(jobOrderData.Date_Installed || jobOrderData.date_installed, 'dateInstalled'),
          usageType: getValue(jobOrderData.Usage_Type || jobOrderData.usage_type, 'usageType'),
          choosePlan: getValue(jobOrderData.Desired_Plan || jobOrderData.desired_plan || jobOrderData.Choose_Plan || jobOrderData.choose_plan || jobOrderData.plan, 'choosePlan'),
          connectionType: getValue(jobOrderData.Connection_Type || jobOrderData.connection_type, 'connectionType'),
          routerModel: getValue(jobOrderData.Router_Model || jobOrderData.router_model, 'routerModel'),
          modemSN: getValue(jobOrderData.Modem_SN || jobOrderData.modem_sn, 'modemSN'),
          groupName: getValue(jobOrderData.group_name || jobOrderData.Group_Name, 'groupName'),
          lcpnap: getValue(jobOrderData.LCPNAP || jobOrderData.lcpnap, 'lcpnap'),
          port: getValue(jobOrderData.PORT || jobOrderData.port, 'port'),
          vlan: getValue(jobOrderData.VLAN || jobOrderData.vlan, 'vlan'),
          region: getValue(jobOrderData.Region || jobOrderData.region, 'region'),
          city: getValue(jobOrderData.City || jobOrderData.city, 'city'),
          barangay: getValue(jobOrderData.Barangay || jobOrderData.barangay, 'barangay'),
          location: getValue(jobOrderData.Location || jobOrderData.location, 'location'),
          onsiteStatus: loadedOnsiteStatus,
          onsiteRemarks: getValue(jobOrderData.Onsite_Remarks || jobOrderData.onsite_remarks, 'onsiteRemarks'),
          itemName1: getValue(jobOrderData.Item_Name_1 || jobOrderData.item_name_1, 'itemName1'),
          visit_by: getValue(jobOrderData.Visit_By || jobOrderData.visit_by, 'visit_by'),
          visit_with: getValue(jobOrderData.Visit_With || jobOrderData.visit_with, 'visit_with'),
          visit_with_other: getValue(jobOrderData.Visit_With_Other || jobOrderData.visit_with_other, 'visit_with_other'),
          statusRemarks: getValue(jobOrderData.Status_Remarks || jobOrderData.status_remarks, 'statusRemarks'),
          ip: getValue(jobOrderData.IP || jobOrderData.ip, 'ip'),
          addressCoordinates: getValue(jobOrderData.Address_Coordinates || jobOrderData.address_coordinates, 'addressCoordinates')
        };
        
        setFormData(prev => ({
          ...prev,
          ...newFormData
        }));
      };
      
      fetchApplicationData();
    }
  }, [jobOrderData, isOpen]);

  const handleInputChange = (field: keyof JobOrderDoneFormData, value: string | File | null) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'lcpnap') {
        newData.port = '';
      }
      if (field === 'region') {
        newData.city = '';
        newData.barangay = '';
        newData.location = '';
      }
      if (field === 'city') {
        newData.barangay = '';
        newData.location = '';
      }
      if (field === 'barangay') {
        newData.location = '';
      }
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (field: 'signedContractImage' | 'setupImage' | 'boxReadingImage' | 'routerReadingImage' | 'portLabelImage' | 'clientSignatureImage' | 'speedTestImage', file: File) => {
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
    if (!formData.region.trim()) newErrors.region = 'Region is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.barangay.trim()) newErrors.barangay = 'Barangay is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
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
      if (!formData.speedTestImage) newErrors.speedTestImage = 'Speed Test Image is required';
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
        updated_by_user_email: updatedFormData.modifiedBy,
        desired_plan: updatedFormData.choosePlan
      };
      
      if (updatedFormData.onsiteStatus === 'Done') {
        jobOrderUpdateData.connection_type = updatedFormData.connectionType;
        jobOrderUpdateData.modem_router_sn = updatedFormData.modemSN;
        jobOrderUpdateData.ip_address = updatedFormData.ip;
        jobOrderUpdateData.onsite_remarks = updatedFormData.onsiteRemarks;
        jobOrderUpdateData.address_coordinates = updatedFormData.addressCoordinates;
        jobOrderUpdateData.onsite_status = 'Done';
        jobOrderUpdateData.group_name = updatedFormData.groupName;
        
        const lastName = (jobOrderData.Last_Name || jobOrderData.last_name || '').toLowerCase().replace(/\s+/g, '');
        const mobileNumber = (jobOrderData.Mobile_Number || jobOrderData.mobile_number || '').replace(/[^0-9]/g, '');
        
        if (lastName && mobileNumber) {
          const generatedUsername = `${lastName}${mobileNumber}`;
          jobOrderUpdateData.username = generatedUsername;
        }
        
        const firstName = (jobOrderData?.First_Name || jobOrderData?.first_name || '').trim();
        const middleInitial = (jobOrderData?.Middle_Initial || jobOrderData?.middle_initial || '').trim();
        const fullLastName = (jobOrderData?.Last_Name || jobOrderData?.last_name || '').trim();
        const folderName = `(joborder)${firstName} ${middleInitial} ${fullLastName}`.trim();
        
        const imageFormData = new FormData();
        imageFormData.append('folder_name', folderName);
        
        if (updatedFormData.signedContractImage) {
          imageFormData.append('signed_contract_image', updatedFormData.signedContractImage);
        }
        if (updatedFormData.setupImage) {
          imageFormData.append('setup_image', updatedFormData.setupImage);
        }
        if (updatedFormData.boxReadingImage) {
          imageFormData.append('box_reading_image', updatedFormData.boxReadingImage);
        }
        if (updatedFormData.routerReadingImage) {
          imageFormData.append('router_reading_image', updatedFormData.routerReadingImage);
        }
        if (updatedFormData.portLabelImage) {
          imageFormData.append('port_label_image', updatedFormData.portLabelImage);
        }
        if (updatedFormData.clientSignatureImage) {
          imageFormData.append('client_signature_image', updatedFormData.clientSignatureImage);
        }
        if (updatedFormData.speedTestImage) {
          imageFormData.append('speed_test_image', updatedFormData.speedTestImage);
        }
        
        try {
          const uploadResponse = await apiClient.post<{
            success: boolean;
            message: string;
            data?: {
              signed_contract_image_url?: string;
              setup_image_url?: string;
              box_reading_image_url?: string;
              router_reading_image_url?: string;
              port_label_image_url?: string;
              client_signature_image_url?: string;
              speedtest_image_url?: string;
            };
            folder_id?: string;
          }>(`/job-orders/${jobOrderId}/upload-images`, imageFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (uploadResponse.data.success && uploadResponse.data.data) {
            const imageUrls = uploadResponse.data.data;
            
            if (imageUrls.signed_contract_image_url) {
              jobOrderUpdateData.signed_contract_image_url = imageUrls.signed_contract_image_url;
            }
            if (imageUrls.setup_image_url) {
              jobOrderUpdateData.setup_image_url = imageUrls.setup_image_url;
            }
            if (imageUrls.box_reading_image_url) {
              jobOrderUpdateData.box_reading_image_url = imageUrls.box_reading_image_url;
            }
            if (imageUrls.router_reading_image_url) {
              jobOrderUpdateData.router_reading_image_url = imageUrls.router_reading_image_url;
            }
            if (imageUrls.port_label_image_url) {
              jobOrderUpdateData.port_label_image_url = imageUrls.port_label_image_url;
            }
            if (imageUrls.client_signature_image_url) {
              jobOrderUpdateData.client_signature_image_url = imageUrls.client_signature_image_url;
            }
            if (imageUrls.speedtest_image_url) {
              jobOrderUpdateData.speedtest_image_url = imageUrls.speedtest_image_url;
            }
          }
        } catch (uploadError: any) {
          const errorMsg = uploadError.response?.data?.message || uploadError.message || 'Unknown error';
          alert(`Warning: Failed to upload images to Google Drive!\n\nError: ${errorMsg}\n\nJob order will be saved without image URLs.`);
        }
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

      const jobOrderResponse = await updateJobOrder(jobOrderId, jobOrderUpdateData);
      
      if (!jobOrderResponse.success) {
        throw new Error(jobOrderResponse.message || 'Job order update failed');
      }

      // RADIUS account creation temporarily disabled
      // if (updatedFormData.onsiteStatus === 'Done') {
      //   const planNameForRadius = updatedFormData.choosePlan.includes(' - P') 
      //     ? updatedFormData.choosePlan.split(' - P')[0].trim()
      //     : updatedFormData.choosePlan;
      //   
      //   try {
      //     const radiusResponse = await apiClient.post<{
      //       success: boolean;
      //       message: string;
      //       data?: {
      //         username: string;
      //         group: string;
      //         radius_response?: any;
      //       };
      //     }>(`/job-orders/${jobOrderId}/create-radius-account`);
      //     
      //     if (radiusResponse.data.success) {
      //       alert(`Success! Job order saved and RADIUS account created for username: ${radiusResponse.data.data?.username} with plan: ${planNameForRadius}`);
      //     } else {
      //       alert(`Warning: Job order saved but RADIUS account creation failed: ${radiusResponse.data.message}`);
      //     }
      //   } catch (radiusError: any) {
      //     const errorMsg = radiusError.response?.data?.message || radiusError.message || 'Unknown error';
      //     alert(`Warning: Job order saved but RADIUS account creation failed: ${errorMsg}`);
      //   }
      // }

      let applicationId = jobOrderData.application_id || jobOrderData.Application_ID || jobOrderData.account_id;
      
      if (!applicationId) {
        try {
          const jobOrderResponse = await apiClient.get<{ success: boolean; data: any }>(`/job-orders/${jobOrderId}`);
          if (jobOrderResponse.data.success && jobOrderResponse.data.data) {
            applicationId = jobOrderResponse.data.data.application_id;
          }
        } catch (fetchError: any) {
        }
      }
      
      if (applicationId) {
        try {
          
          const firstName = jobOrderData?.First_Name || jobOrderData?.first_name || '';
          const middleInitial = jobOrderData?.Middle_Initial || jobOrderData?.middle_initial || '';
          const lastName = jobOrderData?.Last_Name || jobOrderData?.last_name || '';
          const mobileNumber = jobOrderData?.Mobile_Number || jobOrderData?.mobile_number || '';
          const secondaryMobile = jobOrderData?.Secondary_Mobile_Number || jobOrderData?.secondary_mobile_number || '';
          const emailAddress = jobOrderData?.Email_Address || jobOrderData?.email_address || '';
          const installationAddress = jobOrderData?.Installation_Address || jobOrderData?.installation_address || '';
          const landmark = jobOrderData?.Landmark || jobOrderData?.landmark || '';
          const referredBy = jobOrderData?.Referred_By || jobOrderData?.referred_by || '';
          const promo = jobOrderData?.Promo || jobOrderData?.promo || '';
          
          const planNameForDisplay = updatedFormData.choosePlan.includes(' - P') 
            ? updatedFormData.choosePlan.split(' - P')[0].trim()
            : updatedFormData.choosePlan;
          
          const applicationUpdateData: any = {
            first_name: firstName,
            middle_initial: middleInitial,
            last_name: lastName,
            mobile_number: mobileNumber,
            secondary_mobile_number: secondaryMobile,
            email_address: emailAddress,
            installation_address: installationAddress,
            landmark: landmark,
            region: updatedFormData.region,
            city: updatedFormData.city,
            barangay: updatedFormData.barangay,
            location: updatedFormData.location,
            desired_plan: updatedFormData.choosePlan,
            referred_by: referredBy,
            promo: promo
          };
          
          const applicationResponse = await updateApplication(applicationId.toString(), applicationUpdateData);
          
          alert(`Success! Application updated:\n- Plan: ${updatedFormData.choosePlan}\n- Location: ${updatedFormData.region}, ${updatedFormData.city}, ${updatedFormData.barangay}, ${updatedFormData.location}`);
        } catch (appError: any) {
          const errorMsg = appError.response?.data?.message || appError.message || 'Unknown error';
          alert(`Warning: Job order was saved but application update failed!\n\nError: ${errorMsg}\n\nApplication ID: ${applicationId}\nPlease update the application manually.`);
        }
      } else {
        alert('Warning: Cannot update application - missing application ID');
      }

      if (updatedFormData.onsiteStatus === 'Done') {
        const validItems = orderItems.filter(item => {
          const quantity = parseInt(item.quantity);
          const isValid = item.itemId && item.itemId.trim() !== '' && !isNaN(quantity) && quantity > 0;
          
          return isValid;
        });

        if (validItems.length > 0) {
          try {
            const existingItemsResponse = await apiClient.get<{ success: boolean; data: any[] }>(`/job-order-items?job_order_id=${jobOrderId}`);
            
            if (existingItemsResponse.data.success && existingItemsResponse.data.data.length > 0) {
              const existingItems = existingItemsResponse.data.data;
              
              for (const item of existingItems) {
                try {
                  await apiClient.delete(`/job-order-items/${item.id}`);
                } catch (deleteErr) {
                }
              }
            }
          } catch (deleteError: any) {
          }

          const jobOrderItems: JobOrderItem[] = validItems.map(item => {
            return {
              job_order_id: parseInt(jobOrderId.toString()),
              item_name: item.itemId,
              quantity: parseInt(item.quantity)
            };
          });
          
          try {
            const itemsResponse = await createJobOrderItems(jobOrderItems);
            
            if (!itemsResponse.success) {
              throw new Error(itemsResponse.message || 'Failed to create job order items');
            }
          } catch (itemsError: any) {
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
        }
      }

      setErrors({});
      onSave(updatedFormData);
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to update records: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fullName = `${jobOrderData?.First_Name || jobOrderData?.first_name || ''} ${jobOrderData?.Middle_Initial || jobOrderData?.middle_initial || ''} ${jobOrderData?.Last_Name || jobOrderData?.last_name || ''}`.trim();

  const getFilteredCities = () => {
    if (!formData.region) return [];
    const selectedRegion = regions.find(reg => reg.name === formData.region);
    if (!selectedRegion) return [];
    return allCities.filter(city => city.region_id === selectedRegion.id);
  };

  const getFilteredBarangays = () => {
    if (!formData.city) return [];
    const selectedCity = allCities.find(city => city.name === formData.city);
    if (!selectedCity) return [];
    return allBarangays.filter(brgy => brgy.city_id === selectedCity.id);
  };

  const getFilteredLocations = () => {
    if (!formData.barangay) return [];
    const selectedBarangay = allBarangays.find(brgy => brgy.barangay === formData.barangay);
    if (!selectedBarangay) return [];
    return allLocations.filter(loc => loc.barangay_id === selectedBarangay.id);
  };

  const filteredCities = getFilteredCities();
  const filteredBarangays = getFilteredBarangays();
  const filteredLocations = getFilteredLocations();

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
                {formData.choosePlan && !plans.some(plan => {
                  const planWithPrice = plan.price ? `${plan.name} - P${plan.price}` : plan.name;
                  return planWithPrice === formData.choosePlan || plan.name === formData.choosePlan;
                }) && (
                  <option value={formData.choosePlan}>{formData.choosePlan}</option>
                )}
                {plans.map((plan) => {
                  const planWithPrice = plan.price ? `${plan.name} - P${plan.price}` : plan.name;
                  return (
                    <option key={plan.id} value={planWithPrice}>
                      {planWithPrice}
                    </option>
                  );
                })}
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Region<span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={formData.region} onChange={(e) => handleInputChange('region', e.target.value)} className={`w-full px-3 py-2 bg-gray-800 border ${errors.region ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none`}>
                <option value="">Select Region</option>
                {formData.region && !regions.some(reg => reg.name === formData.region) && (
                  <option value={formData.region}>{formData.region}</option>
                )}
                {regions.map((region) => (
                  <option key={region.id} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City<span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                value={formData.city} 
                onChange={(e) => handleInputChange('city', e.target.value)} 
                disabled={!formData.region}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">{formData.region ? 'Select City' : 'Select Region First'}</option>
                {formData.city && !filteredCities.some(city => city.name === formData.city) && (
                  <option value={formData.city}>{formData.city}</option>
                )}
                {filteredCities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Barangay<span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                value={formData.barangay} 
                onChange={(e) => handleInputChange('barangay', e.target.value)} 
                disabled={!formData.city}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.barangay ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">{formData.city ? 'Select Barangay' : 'Select City First'}</option>
                {formData.barangay && !filteredBarangays.some(brgy => brgy.barangay === formData.barangay) && (
                  <option value={formData.barangay}>{formData.barangay}</option>
                )}
                {filteredBarangays.map((barangay) => (
                  <option key={barangay.id} value={barangay.barangay}>
                    {barangay.barangay}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.barangay && <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location<span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                value={formData.location} 
                onChange={(e) => handleInputChange('location', e.target.value)} 
                disabled={!formData.barangay}
                className={`w-full px-3 py-2 bg-gray-800 border ${errors.location ? 'border-red-500' : 'border-gray-700'} rounded text-white focus:outline-none focus:border-orange-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">{formData.barangay ? 'Select Location' : 'Select Barangay First'}</option>
                {formData.location && !filteredLocations.some(loc => loc.location_name === formData.location) && (
                  <option value={formData.location}>{formData.location}</option>
                )}
                {filteredLocations.map((location) => (
                  <option key={location.id} value={location.location_name}>
                    {location.location_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
            </div>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Speed Test Image<span className="text-red-500">*</span></label>
                <div className="relative w-full h-32 bg-gray-800 border border-gray-700 rounded flex items-center justify-center cursor-pointer hover:bg-gray-750">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files && handleImageUpload('speedTestImage', e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {formData.speedTestImage ? (
                    <div className="text-green-500 flex items-center"><Camera className="mr-2" size={20} />Image uploaded</div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center"><Camera size={32} /><span className="text-sm mt-2">Click to upload</span></div>
                  )}
                </div>
                {errors.speedTestImage && (
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
