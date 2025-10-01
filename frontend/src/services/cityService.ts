import apiClient from '../config/api';
import { Location } from '../types/location';

// Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Region {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Borough {
  id: number;
  city_id: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Village {
  id: number;
  borough_id: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface City {
  id: number;
  region_id: number;
  name: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Static cities data for fallback
const staticCities: City[] = [
  { id: 1, region_id: 1, name: 'Binangonan' },
  { id: 2, region_id: 1, name: 'Tagpos' },
  { id: 3, region_id: 1, name: 'Tatala' },
  { id: 4, region_id: 1, name: 'Pantok' },
  { id: 5, region_id: 1, name: 'Manila' },
  { id: 6, region_id: 1, name: 'Quezon City' },
  { id: 7, region_id: 1, name: 'Makati' },
  { id: 8, region_id: 1, name: 'Pasig' },
  { id: 9, region_id: 1, name: 'Taguig' },
  { id: 10, region_id: 1, name: 'Pasay' }
];

export const getCities = async (): Promise<City[]> => {
  try {
    // Try to get cities from the new location management system first
    try {
      const locations = await getLocationsByType('city');
      if (locations.length > 0) {
        // Convert Location objects to City objects for backward compatibility
        return locations.map(location => ({
          id: location.id,
          region_id: location.parentId || 0,
          name: location.name,
          description: location.description,
          is_active: location.isActive
        }));
      }
    } catch (error) {
      console.log('Location API error, continuing to fallbacks...');
    }
    
    // Fallback to the legacy cities endpoint if no locations found
    try {
      console.log('Falling back to legacy app-cities endpoint');
      const response = await apiClient.get<ApiResponse<City[]>>('/app-cities');
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const cities = response.data.data;
        console.log(`Successfully retrieved ${cities.length} cities from legacy endpoint`);
        return cities;
      }
    } catch (error) {
      console.log('Legacy cities API error, continuing to final fallback...');
    }
    
    // Final fallback to simple cities endpoint
    try {
      console.log('Falling back to simple cities endpoint');
      const simpleResponse = await apiClient.get<City[]>('/cities');
      if (Array.isArray(simpleResponse.data) && simpleResponse.data.length > 0) {
        return simpleResponse.data;
      }
    } catch (error) {
      console.log('Simple cities API error, using static data...');
    }
    
    // Ultimate fallback - use static data
    console.log('Using static cities data as ultimate fallback');
    return staticCities;
    
  } catch (error: any) {
    console.error('Error fetching cities:', error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    // Return empty array instead of throwing error for graceful degradation
    return [];
  }
};

// Get locations by type from the location management system
export const getLocationsByType = async (type: 'region' | 'city' | 'borough' | 'village'): Promise<Location[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: Location[];
    }>(`/locations/type/${type}`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error(`Error fetching ${type}s:`, error);
    return [];
  }
};

// Get child locations by parent ID
export const getLocationChildren = async (parentId: number): Promise<Location[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: Location[];
    }>(`/locations/parent/${parentId}`);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching child locations:', error);
    return [];
  }
};

// Get all locations
export const getAllLocations = async (): Promise<Location[]> => {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: Location[];
    }>('/locations');
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching all locations:', error);
    return [];
  }
};

// Helper function to get regions from location system
export const getRegionsFromLocations = async (): Promise<Location[]> => {
  return getLocationsByType('region');
};

// Helper function to get cities by region
export const getCitiesByRegion = async (regionId: number): Promise<Location[]> => {
  return getLocationChildren(regionId);
};

// Helper function to get barangays by city
export const getBarangaysByCity = async (cityId: number): Promise<Location[]> => {
  return getLocationChildren(cityId);
};

// Create a new region
export const createRegion = async (data: { name: string; code?: string; description?: string }): Promise<Region> => {
  try {
    const response = await apiClient.post<ApiResponse<Region>>('/regions', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create region');
  } catch (error: any) {
    console.error('Error creating region:', error);
    throw error;
  }
};

// Create a new city with region foreign key
export const createCity = async (data: { name: string; region_id: number; code?: string; description?: string }): Promise<City> => {
  try {
    const response = await apiClient.post<ApiResponse<City>>('/cities', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create city');
  } catch (error: any) {
    console.error('Error creating city:', error);
    throw error;
  }
};

// Create a new barangay with city foreign key
export const createBarangay = async (data: { name: string; city_id: number; code?: string; description?: string }): Promise<Borough> => {
  try {
    const response = await apiClient.post<ApiResponse<Borough>>('/barangays', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create barangay');
  } catch (error: any) {
    console.error('Error creating barangay:', error);
    throw error;
  }
};

// Create a new village with barangay foreign key
export const createVillage = async (data: { name: string; borough_id: number; code?: string; description?: string }): Promise<Village> => {
  try {
    const response = await apiClient.post<ApiResponse<Village>>('/villages', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create village');
  } catch (error: any) {
    console.error('Error creating village:', error);
    throw error;
  }
};

// Get regions
export const getRegions = async (): Promise<Region[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Region[]>>('/regions');
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

// Get boroughs (barangays)
export const getBoroughs = async (): Promise<Borough[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Borough[]>>('/barangays');
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching barangays:', error);
    return [];
  }
};

// Get villages
export const getVillages = async (): Promise<Village[]> => {
  try {
    const response = await apiClient.get<ApiResponse<Village[]>>('/villages');
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching villages:', error);
    return [];
  }
};