import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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
  referralContactNo?: string;
  relatedSecurityDeposits?: string;
  relatedApprovedTransactions?: string;
  relatedAttachments?: string;
  logs?: string;
}

// API Response types
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
    const response = await axiosInstance.get<BillingApiResponse>('/billing');
    const responseData = response.data;
    return responseData?.data || (responseData as any) || [];
  } catch (error) {
    console.error('Error fetching billing records:', error);
    
    // Return sample data for development
    return [
      {
        id: '1',
        applicationId: '202308029',
        customerName: 'Joan S Vergara',
        address: 'Block 78 Lot 16 Mabuhay Homes Phase 2A, Darangan, Binangonan, Rizal',
        status: 'Active',
        balance: 0,
        onlineStatus: 'Online',
        cityId: 1,
        regionId: 1,
        timestamp: '2023-08-02',
        billingStatus: 'Active',
        dateInstalled: '9/18/2025',
        contactNumber: '9673808916',
        emailAddress: 'franckiepernyra18@gmail.com',
        plan: 'SwitchLite - P699',
        username: 'vergarajp317251011',
        connectionType: 'Fiber',
        routerModel: 'UT-XPo48c-S',
        routerModemSN: 'Sisco7992fffd',
        lcpnap: 'LCP 195 NAP 00',
        port: 'PORT 004',
        vlan: '1000',
        billingDay: 23,
        totalPaid: 0,
        provider: 'SWITCH',
        lcp: 'LCP 195',
        nap: 'NAP 001',
        modifiedBy: 'AppSheet',
        modifiedDate: '9/18/2025 4:10:44 PM',
        barangay: 'Darangan',
        city: 'Binangonan',
        region: 'Rizal'
      },
      {
        id: '2',
        applicationId: '202308028',
        customerName: 'Wesley U Aragones',
        address: '75 C. Bolado Ave, Tatala, Binangonan, Rizal',
        status: 'Active',
        balance: 0,
        onlineStatus: 'Offline',
        cityId: 1,
        regionId: 1,
        timestamp: '2023-08-02',
        billingStatus: 'Active',
        dateInstalled: '9/18/2025',
        contactNumber: '9359727692',
        emailAddress: 'wesleyaragones07@gmail.com',
        plan: 'SwitchLite - P699',
        username: 'aragonesw918251332',
        connectionType: 'Fiber',
        routerModel: 'UT-XPo48c-S',
        routerModemSN: 'Sisco7992ffb5',
        lcpnap: 'LCP 113 NAP 00',
        port: 'PORT 007',
        vlan: '1000',
        billingDay: 23,
        totalPaid: 0,
        provider: 'SWITCH',
        lcp: 'LCP 113',
        nap: 'NAP 00',
        modifiedBy: 'AppSheet',
        modifiedDate: '9/18/2025 4:10:44 PM',
        barangay: 'Tatala',
        city: 'Binangonan',
        region: 'Rizal'
      }
    ];
  }
};

export const getBillingRecordDetails = async (id: string): Promise<BillingDetailRecord | null> => {
  try {
    const response = await axiosInstance.get<BillingDetailApiResponse>(`/billing/${id}`);
    const responseData = response.data;
    return responseData?.data || (responseData as any) || null;
  } catch (error) {
    console.error('Error fetching billing record details:', error);
    
    // Return sample detailed data for development
    const records = await getBillingRecords();
    const record = records.find(r => r.id === id);
    if (record) {
      return {
        ...record,
        lcpnapport: 'LCP 195 NAP 001 PORT 004',
        usageType: 'Regular Browsing',
        referredBy: 'Vilma S. Divinagracia',
        secondContactNumber: '9336424625',
        referrersAccountNumber: '',
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
        computedAddress: 'Block 78 Lot 16 Mabuhay Home...',
        computedStatus: 'Active | P 0',
        relatedAdvancedPayments: 'Related Advanced Payments (0)',
        relatedPaymentPortalLogs: 'Related Payment Portal Logs (0)',
        relatedInventoryLogs: 'Related Inventory Logs (0)',
        computedAccountNo: '202308029 | Joan S Vergara | Bl...',
        relatedOnlineStatus: 'Related Online Status (1)',
        group: 'SwitchLite',
        mikrotikId: '*2063',
        sessionIP: '10.99.161.63',
        relatedBorrowedLogs: 'Related Borrowed Logs (0)',
        relatedPlanChangeLogs: 'Related Plan Change Logs (0)',
        relatedServiceChargeLogs: 'Related Service Charge Logs (0)',
        relatedAdjustedAccountLogs: 'Related Adjusted Account Log...',
        referralContactNo: '9332273769',
        relatedSecurityDeposits: 'Related Security Deposits (0)',
        relatedApprovedTransactions: 'Related Approved Transaction...',
        relatedAttachments: '',
        logs: 'Logs (0)'
      };
    }
    return null;
  }
};

export const updateBillingRecord = async (id: string, data: Partial<BillingDetailRecord>): Promise<BillingDetailRecord | null> => {
  try {
    const response = await axiosInstance.put<BillingDetailApiResponse>(`/billing/${id}`, data);
    const responseData = response.data;
    return responseData?.data || (responseData as any) || null;
  } catch (error) {
    console.error('Error updating billing record:', error);
    throw error;
  }
};

export const createBillingRecord = async (data: Partial<BillingDetailRecord>): Promise<BillingDetailRecord | null> => {
  try {
    const response = await axiosInstance.post<BillingDetailApiResponse>('/billing', data);
    const responseData = response.data;
    return responseData?.data || (responseData as any) || null;
  } catch (error) {
    console.error('Error creating billing record:', error);
    throw error;
  }
};

export const deleteBillingRecord = async (id: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/billing/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting billing record:', error);
    throw error;
  }
};