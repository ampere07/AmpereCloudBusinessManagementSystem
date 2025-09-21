import apiClient from '../config/api';

// Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface JobOrderData {
  Application_ID: string;
  Timestamp?: string;
  Email_Address?: string;
  Referred_By?: string;
  First_Name?: string;
  Middle_Initial?: string;
  Last_Name?: string;
  Contact_Number?: string;
  Applicant_Email_Address?: string;
  Address?: string;
  Location?: string;
  Barangay?: string;
  City?: string;
  Region?: string;
  Choose_Plan?: string;
  Remarks?: string;
  Installation_Fee?: number;
  Contract_Template?: string;
  Billing_Day?: string;
  Preferred_Day?: string;
  JO_Remarks?: string;
  Status?: string;
  Verified_By?: string;
  Modem_Router_SN?: string;
  LCP?: string;
  NAP?: string;
  PORT?: string;
  VLAN?: string;
  Username?: string;
  Visit_By?: string;
  Visit_With?: string;
  Visit_With_Other?: string;
  Onsite_Status?: string;
  Onsite_Remarks?: string;
  Modified_By?: string;
  Modified_Date?: string;
  Contract_Link?: string;
  Connection_Type?: string;
  Assigned_Email?: string;
  Setup_Image?: string;
  Speedtest_Image?: string;
  StartTimeStamp?: string;
  EndTimeStamp?: string;
  Duration?: string;
  LCPNAP?: string;
  Billing_Status?: string;
  Router_Model?: string;
  Date_Installed?: string;
  Client_Signature?: string;
  IP?: string;
  Signed_Contract_Image?: string;
  Box_Reading_Image?: string;
  Router_Reading_Image?: string;
  Username_Status?: string;
  LCPNAPPORT?: string;
  Usage_Type?: string;
  Renter?: string;
  Installation_Landmark?: string;
  Status_Remarks?: string;
  Port_Label_Image?: string;
  Second_Contact_Number?: string;
  Account_No?: string;
  Address_Coordinates?: string;
  Referrers_Account_Number?: string;
  House_Front_Picture?: string;
}

export const createJobOrder = async (jobOrderData: JobOrderData) => {
  try {
    const response = await apiClient.post<ApiResponse<JobOrderData>>('/job-orders', jobOrderData);
    return response.data;
  } catch (error) {
    console.error('Error creating job order:', error);
    throw error;
  }
};

export const getJobOrders = async () => {
  try {
    const response = await apiClient.get<ApiResponse<JobOrderData[]>>('/job-orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching job orders:', error);
    throw error;
  }
};

export const getJobOrder = async (id: string) => {
  try {
    const response = await apiClient.get<ApiResponse<JobOrderData>>(`/job-orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job order:', error);
    throw error;
  }
};

export const updateJobOrder = async (id: string, jobOrderData: Partial<JobOrderData>) => {
  try {
    const response = await apiClient.put<ApiResponse<JobOrderData>>(`/job-orders/${id}`, jobOrderData);
    return response.data;
  } catch (error) {
    console.error('Error updating job order:', error);
    throw error;
  }
};