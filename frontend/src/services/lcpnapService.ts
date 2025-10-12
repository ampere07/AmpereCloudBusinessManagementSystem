import apiClient from '../config/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    from: number;
    to: number;
  };
}

export interface LCPNAP {
  id: number;
  lcpnap_name: string;
  lcp_id?: number;
  nap_id?: number;
  created_at?: string;
  updated_at?: string;
}

export const getAllLCPNAPs = async (search?: string, page: number = 1, limit: number = 100): Promise<ApiResponse<LCPNAP[]>> => {
  try {
    const params: any = { page, limit };
    if (search) {
      params.search = search;
    }
    
    const response = await apiClient.get<ApiResponse<LCPNAP[]>>('/lcpnap', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching LCPNAP records:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch LCPNAP records'
    };
  }
};

export const getLCPNAPById = async (id: number): Promise<ApiResponse<LCPNAP>> => {
  try {
    const response = await apiClient.get<ApiResponse<LCPNAP>>(`/lcpnap/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching LCPNAP record:', error);
    throw error;
  }
};

export const createLCPNAP = async (lcpnapData: any): Promise<ApiResponse<LCPNAP>> => {
  try {
    const response = await apiClient.post<ApiResponse<LCPNAP>>('/lcpnap', lcpnapData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating LCPNAP record:', error);
    throw error;
  }
};

export const updateLCPNAP = async (id: number, lcpnapData: any): Promise<ApiResponse<LCPNAP>> => {
  try {
    const response = await apiClient.put<ApiResponse<LCPNAP>>(`/lcpnap/${id}`, lcpnapData);
    return response.data;
  } catch (error: any) {
    console.error('Error updating LCPNAP record:', error);
    throw error;
  }
};

export const deleteLCPNAP = async (id: number): Promise<ApiResponse<null>> => {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(`/lcpnap/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting LCPNAP record:', error);
    throw error;
  }
};
