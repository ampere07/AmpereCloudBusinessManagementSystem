import apiClient from '../config/api';

export interface LcpItem {
  id: number;
  lcp_name: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getAllLcps = async (): Promise<LcpItem[]> => {
  try {
    const response = await apiClient.get<ApiResponse<LcpItem[]>>('/lcp');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching LCPs:', error);
    return [];
  }
};

export const getLcpById = async (id: number): Promise<LcpItem | null> => {
  try {
    const response = await apiClient.get<ApiResponse<LcpItem>>(`/lcp/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching LCP:', error);
    return null;
  }
};

export const createLcp = async (data: { name: string }): Promise<LcpItem> => {
  try {
    const response = await apiClient.post<ApiResponse<LcpItem>>('/lcp', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create LCP');
  } catch (error: any) {
    console.error('Error creating LCP:', error);
    throw error;
  }
};

export const updateLcp = async (id: number, data: { name: string }): Promise<LcpItem> => {
  try {
    const response = await apiClient.put<ApiResponse<LcpItem>>(`/lcp/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update LCP');
  } catch (error: any) {
    console.error('Error updating LCP:', error);
    throw error;
  }
};

export const deleteLcp = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/lcp/${id}`);
  } catch (error: any) {
    console.error('Error deleting LCP:', error);
    throw error;
  }
};

export const lcpService = {
  getAllLcps,
  getLcpById,
  createLcp,
  updateLcp,
  deleteLcp
};
