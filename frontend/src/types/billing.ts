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
  usageType?: string;
  referredBy?: string;
  referralContactNo?: string;
  groupName?: string;
  mikrotikId?: string;
  sessionIp?: string;
  houseFrontPicture?: string;
  accountBalance?: number;
  email?: string;
  
  // Extended fields for detailed view
  lcpnapport?: string;
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

export interface OnlineStatusRecord {
  id: string;
  status: string;
  accountNo: string;
  username: string;
  group: string;
  splynxId: string;
}

// API response types
export interface BillingApiResponse {
  data: BillingRecord[];
  message?: string;
  status?: string;
}

export interface BillingDetailApiResponse {
  data: BillingDetailRecord;
  message?: string;
  status?: string;
}
