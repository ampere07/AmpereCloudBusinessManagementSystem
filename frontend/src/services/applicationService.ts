import apiClient from '../config/api';
import { Application } from '../types/application';

interface ApplicationResponse {
  status?: string;
  message?: string;
  applications?: Application[];
  application?: Application;
}

export const getApplications = async (): Promise<Application[]> => {
  try {
    const response = await apiClient.get<ApplicationResponse>('/applications');
    console.log('API Response:', response.data); // Log the full response
    
    if (response.data && response.data.applications && Array.isArray(response.data.applications) && response.data.applications.length > 0) {
      console.log('Found applications in response:', response.data.applications.length);
      return response.data.applications.map(app => ({
        id: app.id || '',
        customer_name: app.customer_name || '',
        timestamp: app.timestamp || '',
        address: app.address || '',
        status: app.status || '',
        location: app.location || '',
        email: app.email || '',
        mobile_number: app.mobile_number || '',
        secondary_number: app.secondary_number || ''
      }));
    } else {
      console.warn('No applications found in API response, checking data structure:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

export const getApplication = async (id: string): Promise<Application> => {
  try {
    console.log(`Fetching application details for ID: ${id}`);
    const response = await apiClient.get<ApplicationResponse>(`/applications/${id}`);
    
    console.log('Application details response:', response.data);
    
    if (!response.data.application) {
      throw new Error('Application not found in API response');
    }
    
    // Extract application data and ensure all fields have values
    const app = response.data.application;
    
    return {
      id: app.id || '',
      customer_name: app.customer_name || '',
      timestamp: app.timestamp || '',
      address: app.address || app.address_line || '',
      status: app.status || '',
      location: app.location || '',
      email: app.email || '',
      mobile_number: app.mobile_number || app.mobile || '',
      secondary_number: app.secondary_number || app.mobile_alt || '',
      plan_id: app.plan_id || '',
      promo_id: app.promo_id || '',
      create_date: app.create_date || '',
      create_time: app.create_time || '',
      update_date: app.update_date || '',
      update_time: app.update_time || '',
      first_name: app.first_name || '',
      middle_initial: app.middle_initial || '',
      last_name: app.last_name || '',
      landmark: app.landmark || '',
      nearest_landmark1: app.nearest_landmark1 || '',
      nearest_landmark2: app.nearest_landmark2 || '',
      gov_id_primary: app.gov_id_primary || '',
      gov_id_secondary: app.gov_id_secondary || '',
      house_front_pic: app.house_front_pic || '',
      room_pic: app.room_pic || ''
    };
  } catch (error: any) {
    console.error('Error fetching application details:', error);
    throw new Error(`Failed to fetch application details: ${error.message}`);
  }
};

export const createApplication = async (application: Partial<Application>): Promise<Application> => {
  const response = await apiClient.post<ApplicationResponse>('/applications', application);
  if (!response.data.application) {
    throw new Error('Failed to create application');
  }
  return response.data.application;
};

export const updateApplication = async (id: string, application: Partial<Application>): Promise<Application> => {
  const response = await apiClient.put<ApplicationResponse>(`/applications/${id}`, application);
  if (!response.data.application) {
    throw new Error('Failed to update application');
  }
  return response.data.application;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await apiClient.delete<ApplicationResponse>(`/applications/${id}`);
};
