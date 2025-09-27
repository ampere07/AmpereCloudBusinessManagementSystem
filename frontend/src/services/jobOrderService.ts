import apiClient from '../config/api';
import { JobOrderData } from '../types/jobOrder';

// Export JobOrderData for backwards compatibility
export type { JobOrderData } from '../types/jobOrder';

// Response interface
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

export const getJobOrders = async () => {
  try {
    console.log('Fetching job orders from database...');
    const response = await apiClient.get<ApiResponse<JobOrderData[]>>('/job-orders');
    console.log('Raw API response:', response);
    
    // Process the data to ensure it matches our expected format
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // Map any database field names that might be different from our interface
      const processedData = response.data.data.map(item => {
        return {
          ...item,
          // Add any field mappings here if the database column names differ from our interface
          // For example, if the database returns job_order_id but our interface expects JobOrder_ID:
          // JobOrder_ID: item.job_order_id,
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