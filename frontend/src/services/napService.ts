import apiClient from '../config/api';

export interface NapItem {
  id: number;
  nap_name: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getAllNaps = async (): Promise<NapItem[]> => {
  try {
    const response = await apiClient.get<ApiResponse<NapItem[]>>('/nap');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching NAPs:', error);
    return [];
  }
};

export const getNapById = async (id: number): Promise<NapItem | null> => {
  try {
    const response = await apiClient.get<ApiResponse<NapItem>>(`/nap/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching NAP:', error);
    return null;
  }
};

export const createNap = async (data: { name: string }): Promise<NapItem> => {
  try {
    const response = await apiClient.post<ApiResponse<NapItem>>('/nap', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create NAP');
  } catch (error: any) {
    console.error('Error creating NAP:', error);
    throw error;
  }
};

export const updateNap = async (id: number, data: { name: string }): Promise<NapItem> => {
  try {
    const response = await apiClient.put<ApiResponse<NapItem>>(`/nap/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update NAP');
  } catch (error: any) {
    console.error('Error updating NAP:', error);
    throw error;
  }
};

export const deleteNap = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/nap/${id}`);
  } catch (error: any) {
    console.error('Error deleting NAP:', error);
    throw error;
  }
};

export const napService = {
  getAllNaps,
  getNapById,
  createNap,
  updateNap,
  deleteNap
};
