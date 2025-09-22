import apiClient from '../config/api';

// Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Region {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export const getRegions = async (): Promise<Region[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Region[]>>('/app-regions');
    
    if (response.data.success && Array.isArray(response.data.data)) {
      const regions = response.data.data;
      return regions;
    } else {
      console.warn('Invalid response format for regions:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching regions:', error);
    return [];
  }
};
