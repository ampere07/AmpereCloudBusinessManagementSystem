import apiClient from '../config/api';

export interface LcpNapItem {
  id: number;
  lcp_id: number;
  nap_id: number;
  region: string;
  city: string;
  barangay: string;
  village?: string;
  lcp_name?: string;
  nap_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export const getAllLcpNaps = async (page: number = 1, limit: number = 10): Promise<{
  items: LcpNapItem[];
  pagination: any;
}> => {
  try {
    const response = await apiClient.get<ApiResponse<LcpNapItem[]>>(`/lcp-nap-list?page=${page}&limit=${limit}`);
    return {
      items: response.data.data || [],
      pagination: response.data.pagination || {}
    };
  } catch (error) {
    console.error('Error fetching LCP NAPs:', error);
    return {
      items: [],
      pagination: {}
    };
  }
};

export const getLcpNapById = async (id: number): Promise<LcpNapItem | null> => {
  try {
    const response = await apiClient.get<ApiResponse<LcpNapItem>>(`/lcp-nap-list/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching LCP NAP:', error);
    return null;
  }
};

export const createLcpNap = async (data: {
  lcp_id: number;
  nap_id: number;
  region: string;
  city: string;
  barangay: string;
  village?: string;
}): Promise<LcpNapItem> => {
  try {
    const response = await apiClient.post<ApiResponse<LcpNapItem>>('/lcp-nap-list', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create LCP NAP');
  } catch (error: any) {
    console.error('Error creating LCP NAP:', error);
    throw error;
  }
};

export const updateLcpNap = async (id: number, data: {
  lcp_id: number;
  nap_id: number;
  region: string;
  city: string;
  barangay: string;
  village?: string;
}): Promise<LcpNapItem> => {
  try {
    const response = await apiClient.put<ApiResponse<LcpNapItem>>(`/lcp-nap-list/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update LCP NAP');
  } catch (error: any) {
    console.error('Error updating LCP NAP:', error);
    throw error;
  }
};

export const deleteLcpNap = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/lcp-nap-list/${id}`);
  } catch (error: any) {
    console.error('Error deleting LCP NAP:', error);
    throw error;
  }
};

export const lcpNapService = {
  getAllLcpNaps,
  getLcpNapById,
  createLcpNap,
  updateLcpNap,
  deleteLcpNap
};
