import apiClient from '../config/api';
import { JobOrderData } from '../types/jobOrder';

export type { JobOrderData } from '../types/jobOrder';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  table?: string;
  debug?: any;
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

export const getJobOrders = async (assignedEmail?: string) => {
  try {
    const params = assignedEmail ? { assigned_email: assignedEmail } : {};
    const response = await apiClient.get<ApiResponse<JobOrderData[]>>('/job-orders', { params });
    
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      const processedData = response.data.data.map(item => {
        return {
          ...item,
          id: item.id || item.JobOrder_ID
        };
      });
      
      return {
        ...response.data,
        data: processedData
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching job orders:', error);
    // Return a formatted error response instead of throwing
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Unknown error fetching job orders'
    };
  }
};

export const getJobOrder = async (id: string | number) => {
  try {
    // Ensure ID is a string for the API URL
    const idStr = id.toString();
    const response = await apiClient.get<ApiResponse<JobOrderData>>(`/job-orders/${idStr}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job order:', error);
    throw error;
  }
};

export const updateJobOrder = async (id: string | number, jobOrderData: Partial<JobOrderData>) => {
  try {
    // Ensure ID is a string for the API URL
    const idStr = id.toString();
    const response = await apiClient.put<ApiResponse<JobOrderData>>(`/job-orders/${idStr}`, jobOrderData);
    return response.data;
  } catch (error) {
    console.error('Error updating job order:', error);
    throw error;
  }
};

export const approveJobOrder = async (id: string | number) => {
  try {
    const idStr = id.toString();
    const response = await apiClient.post<ApiResponse<any>>(`/job-orders/${idStr}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving job order:', error);
    throw error;
  }
};