import apiClient from '../config/api';

export interface RouterModel {
  SN: string;
  Model?: string;
  brand?: string;
  description?: string;
  is_active?: boolean;
  modified_date?: string;
  modified_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getAllRouterModels = async (): Promise<RouterModel[]> => {
  try {
    const response = await apiClient.get<ApiResponse<RouterModel[]>>('/router-models');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching router models:', error);
    return [];
  }
};

export const getRouterModelById = async (sn: string): Promise<RouterModel | null> => {
  try {
    const response = await apiClient.get<ApiResponse<RouterModel>>(`/router-models/${sn}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching router model:', error);
    return null;
  }
};

export const createRouterModel = async (data: {
  brand: string;
  model: string;
  description?: string;
}): Promise<RouterModel> => {
  try {
    const response = await apiClient.post<ApiResponse<RouterModel>>('/router-models', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create router model');
  } catch (error: any) {
    console.error('Error creating router model:', error);
    throw error;
  }
};

export const updateRouterModel = async (sn: string, data: {
  brand: string;
  model: string;
  description?: string;
}): Promise<RouterModel> => {
  try {
    const response = await apiClient.put<ApiResponse<RouterModel>>(`/router-models/${sn}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update router model');
  } catch (error: any) {
    console.error('Error updating router model:', error);
    throw error;
  }
};

export const deleteRouterModel = async (sn: string): Promise<void> => {
  try {
    await apiClient.delete(`/router-models/${sn}`);
  } catch (error: any) {
    console.error('Error deleting router model:', error);
    throw error;
  }
};

export const routerModelService = {
  getAllRouterModels,
  getRouterModelById,
  createRouterModel,
  updateRouterModel,
  deleteRouterModel
};
