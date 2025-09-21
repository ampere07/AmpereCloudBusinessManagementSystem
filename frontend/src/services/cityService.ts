import apiClient from '../config/api';

// Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface City {
  id: number;
  region_id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export const getCities = async (): Promise<City[]> => {
  try {
    // Use the correct API endpoint that matches your Laravel routes
    console.log('Making request to /app-cities endpoint');
    const response = await apiClient.get<ApiResponse<City[]>>('/app-cities');
    
    console.log('Cities API response:', response.data);
    
    if (response.data.success && Array.isArray(response.data.data)) {
      // Log the number of cities and some sample data for debugging
      const cities = response.data.data;
      console.log(`Successfully retrieved ${cities.length} cities`);
      if (cities.length > 0) {
        console.log('Sample city data:', cities[0]);
      }
      return cities;
    } else {
      console.warn('Invalid response format for cities:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching cities:', error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    // Return empty array instead of throwing error for graceful degradation
    return [];
  }
};