import apiClient from '../config/api';

export interface City {
  id: number;
  region_id: number;
  name: string;
}

export const getCities = async (): Promise<City[]> => {
  try {
    // Use the correct API endpoint that matches your Laravel routes
    const response = await apiClient.get<City[]>('/api/cities');
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Return empty array instead of throwing error for graceful degradation
    return [];
  }
};