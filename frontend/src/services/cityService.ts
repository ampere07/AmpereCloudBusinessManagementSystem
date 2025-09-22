import apiClient from '../config/api';
import { Location } from '../types/location';

export interface City {
  id: number;
  region_id: number;
  name: string;
}

export const getCities = async (): Promise<City[]> => {
  try {
    // Try to get cities from the new location management system first
    const locations = await getLocationsByType('city');
    if (locations.length > 0) {
      // Convert Location objects to City objects for backward compatibility
      return locations.map(location => ({
        id: location.id,
        region_id: location.parentId || 0,
        name: location.name
      }));
    }
    
    // Fallback to the legacy cities endpoint if no locations found
    const response = await apiClient.get<City[]>('/cities');
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
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

// Helper function to get regions
export const getRegions = async (): Promise<Location[]> => {
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