import axios from 'axios';

const getApiBaseUrl = (): string => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  
  return 'https://atssfiber.ph/sync/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface BillingRecord {
  id: string;
  applicationId: string;
  customerName: string;
  address: string;
  status: 'Active' | 'Inactive';
  balance: number;
  onlineStatus: 'Online' | 'Offline';
  cityId?: number | null;
  regionId?: number | null;
  timestamp?: string;
  billingStatus?: string;
  dateInstalled?: string;
  contactNumber?: string;
  secondContactNumber?: string;
  emailAddress?: string;
  plan?: string;
  username?: string;
  connectionType?: string;
  routerModel?: string;
  routerModemSN?: string;
  lcpnap?: string;
  port?: string;
  vlan?: string;
  billingDay?: number;
  totalPaid?: number;
  provider?: string;
  lcp?: string;
  nap?: string;
  modifiedBy?: string;
  modifiedDate?: string;
  barangay?: string;
  city?: string;
  region?: string;
}

export interface BillingDetailRecord extends BillingRecord {
  lcpnapport?: string;
  usageType?: string;
  referredBy?: string;
  secondContactNumber?: string;
  referrersAccountNumber?: string;
  accountBalance?: number;
  houseFrontPicture?: string;
  referralContactNo?: string;
  groupName?: string;
  sessionIp?: string;
  relatedInvoices?: string;
  relatedStatementOfAccount?: string;
  relatedDiscounts?: string;
  relatedStaggeredInstallation?: string;
  relatedStaggeredPayments?: string;
  relatedOverdues?: string;
  relatedDCNotices?: string;
  relatedServiceOrders?: string;
  relatedDisconnectedLogs?: string;
  relatedReconnectionLogs?: string;
  relatedChangeDueLogs?: string;
  relatedTransactions?: string;
  relatedDetailsUpdateLogs?: string;
  computedAddress?: string;
  computedStatus?: string;
  relatedAdvancedPayments?: string;
  relatedPaymentPortalLogs?: string;
  relatedInventoryLogs?: string;
  computedAccountNo?: string;
  relatedOnlineStatus?: string;
  group?: string;
  mikrotikId?: string;
  sessionIP?: string;
  relatedBorrowedLogs?: string;
  relatedPlanChangeLogs?: string;
  relatedServiceChargeLogs?: string;
  relatedAdjustedAccountLogs?: string;
  relatedSecurityDeposits?: string;
  relatedApprovedTransactions?: string;
  relatedAttachments?: string;
  logs?: string;
}

interface BillingApiResponse {
  data?: BillingRecord[];
  message?: string;
  status?: string;
}

interface BillingDetailApiResponse {
  data?: BillingDetailRecord;
  message?: string;
  status?: string;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getBillingRecords = async (): Promise<BillingRecord[]> => {
  try {
    const response = await axiosInstance.get<any>('/billing');
    const responseData = response.data;
    
    if (responseData?.data && Array.isArray(responseData.data)) {
      return responseData.data.map((item: any): BillingRecord => ({
        id: item.Account_No || item.id,
        applicationId: item.Account_No || '',
        customerName: item.Full_Name || '',
        address: item.Address || '',
        status: item.Status || 'Inactive',
        balance: parseFloat(item.Account_Balance) || 0,
        onlineStatus: item.Status === 'Active' ? 'Online' : 'Offline',
        cityId: null,
        regionId: null,
        timestamp: item.Modified_Date || '',
        billingStatus: item.Billing_Status_ID ? `Status ${item.Billing_Status_ID}` : '',
        dateInstalled: item.Date_Installed || '',
        contactNumber: item.Contact_Number || '',
        secondContactNumber: item.Second_Contact_Number || '',
        emailAddress: item.email_address || item.Email_Address || '',
        plan: item.Plan || item.Desired_Plan || '',
        username: item.Username || '',
        connectionType: item.Connection_Type || '',
        routerModel: item.Router_Model || '',
        routerModemSN: item.Router_Modem_SN || '',
        lcpnap: item.LCPNAP || '',
        port: item.PORT || '',
        vlan: item.VLAN || '',
        billingDay: item.Billing_Day === 'Every end of month' ? 0 : (item.Billing_Day || 0),
        totalPaid: 0,
        provider: item.Provider || '',
        lcp: item.LCP || '',
        nap: item.NAP || '',
        modifiedBy: item.Modified_By || '',
        modifiedDate: item.Modified_Date || '',
        barangay: item.Barangay || '',
        city: item.City || '',
        region: item.Region || ''
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching billing records:', error);
    return [];
  }
};

export const getBillingRecordDetails = async (id: string): Promise<BillingDetailRecord | null> => {
  try {
    const response = await axiosInstance.get<any>(`/billing/${id}`);
    const responseData = response.data;
    
    if (responseData?.data) {
      const item = responseData.data;
      const basicRecord: BillingRecord = {
        id: item.Account_No || item.id,
        applicationId: item.Account_No || '',
        customerName: item.Full_Name || '',
        address: item.Address || '',
        status: item.Status || 'Inactive',
        balance: parseFloat(item.Account_Balance) || 0,
        onlineStatus: item.Status === 'Active' ? 'Online' : 'Offline',
        cityId: null,
        regionId: null,
        timestamp: item.Modified_Date || '',
        billingStatus: item.Billing_Status_ID ? `Status ${item.Billing_Status_ID}` : '',
        dateInstalled: item.Date_Installed || '',
        contactNumber: item.Contact_Number || '',
        secondContactNumber: item.Second_Contact_Number || '',
        emailAddress: item.Email_Address || '',
        plan: item.Plan || item.Desired_Plan || '',
        username: item.Username || '',
        connectionType: item.Connection_Type || '',
        routerModel: item.Router_Model || '',
        routerModemSN: item.Router_Modem_SN || '',
        lcpnap: item.LCPNAP || '',
        port: item.PORT || '',
        vlan: item.VLAN || '',
        billingDay: item.Billing_Day === 'Every end of month' ? 0 : (item.Billing_Day || 0),
        totalPaid: 0,
        provider: item.Provider || '',
        lcp: item.LCP || '',
        nap: item.NAP || '',
        modifiedBy: item.Modified_By || '',
        modifiedDate: item.Modified_Date || '',
        barangay: item.Barangay || '',
        city: item.City || '',
        region: item.Region || ''
      };
      
      const detailRecord: BillingDetailRecord = {
        ...basicRecord,
        lcpnapport: item.LCPNAPPORT || '',
        usageType: item.Usage_Type_ID ? `Type ${item.Usage_Type_ID}` : '',
        referredBy: item.Referred_By || '',
        referrersAccountNumber: '',
        group: item.Group_ID ? `Group ${item.Group_ID}` : '',
        groupName: item.Group_Name || item.group_name || '',
        mikrotikId: '',
        sessionIP: item.IP_Address || '',
        sessionIp: item.IP_Address || item.ip_address || '',
        emailAddress: item.email_address || item.Email_Address || '',
        accountBalance: parseFloat(item.Account_Balance) || parseFloat(item.account_balance) || 0,
        houseFrontPicture: item.House_Front_Picture || item.house_front_picture || '',
        referralContactNo: item.Referral_Contact_No || item.referral_contact_no || '',
        relatedInvoices: 'Related Invoices (0)',
        relatedStatementOfAccount: 'Related Statement of Account...',
        relatedDiscounts: 'Related Discounts (0)',
        relatedStaggeredInstallation: 'Related Staggered Installation...',
        relatedStaggeredPayments: 'Related Staggered Payments (0)',
        relatedOverdues: 'Related Overdues (0)',
        relatedDCNotices: 'Related DC Notices (0)',
        relatedServiceOrders: 'Related Service Orders (0)',
        relatedDisconnectedLogs: 'Related Disconnected Logs (0)',
        relatedReconnectionLogs: 'Related Reconnection Logs (0)',
        relatedChangeDueLogs: 'Related Change Due Logs (0)',
        relatedTransactions: 'Related Transactions',
        relatedDetailsUpdateLogs: 'Related Details Update Logs (0)',
        computedAddress: item.Address ? (item.Address.length > 25 ? `${item.Address.substring(0, 25)}...` : item.Address) : '',
        computedStatus: `${item.Status || 'Inactive'} | P ${parseFloat(item.Account_Balance) || 0}`,
        relatedAdvancedPayments: 'Related Advanced Payments (0)',
        relatedPaymentPortalLogs: 'Related Payment Portal Logs (0)',
        relatedInventoryLogs: 'Related Inventory Logs (0)',
        computedAccountNo: `${item.Account_No} | ${item.Full_Name || ''}${item.Address ? (' | ' + item.Address.substring(0, 10) + '...') : ''}`,
        relatedOnlineStatus: 'Related Online Status (1)',
        relatedBorrowedLogs: 'Related Borrowed Logs (0)',
        relatedPlanChangeLogs: 'Related Plan Change Logs (0)',
        relatedServiceChargeLogs: 'Related Service Charge Logs (0)',
        relatedAdjustedAccountLogs: 'Related Adjusted Account Log...',
        relatedSecurityDeposits: 'Related Security Deposits (0)',
        relatedApprovedTransactions: 'Related Approved Transaction...',
        relatedAttachments: '',
        logs: 'Logs (0)'
      };
      
      return detailRecord;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching billing record details:', error);
    return null;
  }
};

export const updateBillingRecord = async (id: string, data: Partial<BillingDetailRecord>): Promise<BillingDetailRecord | null> => {
  try {
    const backendData = {
      Full_Name: data.customerName,
      Contact_Number: data.contactNumber,
      Email_Address: data.emailAddress,
      Address: data.address,
      Plan: data.plan,
      Provider: data.provider,
      Account_Balance: data.balance,
      Username: data.username,
      Connection_Type: data.connectionType,
      Router_Model: data.routerModel,
      Router_Modem_SN: data.routerModemSN,
      LCP: data.lcp,
      NAP: data.nap,
      PORT: data.port,
      VLAN: data.vlan,
      LCPNAP: data.lcpnap,
      Status: data.status,
      Billing_Status: data.billingStatus,
      Billing_Day: data.billingDay,
      Group: data.group,
      MIKROTIK_ID: data.mikrotikId,
      Usage_Type: data.usageType,
      Referred_By: data.referredBy,
      Second_Contact_Number: data.secondContactNumber,
      Referrers_Account_Number: data.referrersAccountNumber
    };
    
    const response = await axiosInstance.put<any>(`/billing-details/${id}`, backendData);
    
    return getBillingRecordDetails(id);
  } catch (error) {
    console.error('Error updating billing record:', error);
    throw error;
  }
};

export const createBillingRecord = async (data: Partial<BillingDetailRecord>): Promise<BillingDetailRecord | null> => {
  try {
    const backendData = {
      Account_No: data.applicationId,
      Full_Name: data.customerName,
      Contact_Number: data.contactNumber,
      Email_Address: data.emailAddress,
      Address: data.address,
      Plan: data.plan,
      Provider: data.provider,
      Account_Balance: data.balance,
      Username: data.username,
      Connection_Type: data.connectionType,
      Router_Model: data.routerModel,
      Router_Modem_SN: data.routerModemSN,
      LCP: data.lcp,
      NAP: data.nap,
      PORT: data.port,
      VLAN: data.vlan,
      LCPNAP: data.lcpnap,
      Status: data.status,
      Billing_Status: data.billingStatus,
      Billing_Day: data.billingDay,
      Group: data.group,
      MIKROTIK_ID: data.mikrotikId,
      Usage_Type: data.usageType,
      Referred_By: data.referredBy,
      Second_Contact_Number: data.secondContactNumber,
      Referrers_Account_Number: data.referrersAccountNumber,
      Date_Installed: new Date().toISOString(),
      Modified_Date: new Date().toISOString(),
      Modified_By: 'System'
    };
    
    const response = await axiosInstance.post<any>('/billing-details', backendData);
    
    if (response.data.status === 'success' && response.data.data) {
      return getBillingRecordDetails(response.data.data.Account_No);
    }
    
    return null;
  } catch (error) {
    console.error('Error creating billing record:', error);
    throw error;
  }
};

export const deleteBillingRecord = async (id: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/billing-details/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting billing record:', error);
    throw error;
  }
};
