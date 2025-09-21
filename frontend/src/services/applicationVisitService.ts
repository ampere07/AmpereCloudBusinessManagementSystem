import apiClient from '../config/api';

// Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApplicationVisitData {
  Application_ID: string;
  Scheduled_Date: string;
  Visit_By: string;
  Visit_With?: string;
  Visit_With_Other?: string;
  Visit_Type: string;
  Visit_Notes?: string;
  Status: string;
  First_Name: string;
  Middle_Initial?: string;
  Last_Name: string;
  Contact_Number: string;
  Second_Contact_Number?: string;
  Email_Address: string;
  Address: string;
  Location: string;
  Barangay?: string;
  City?: string;
  Region?: string;
  Choose_Plan?: string;
  Installation_Landmark?: string;
  Assigned_Email?: string;
  Created_By: string;
  Modified_By: string;
}

export const createApplicationVisit = async (visitData: ApplicationVisitData) => {
  try {
    console.log('Making API request to create application visit:', visitData);
    
    // Check that Application_ID exists
    if (!visitData.Application_ID) {
      throw new Error('Application_ID is required');
    }
    
    const response = await apiClient.post<ApiResponse<ApplicationVisitData>>('/application-visits', visitData);
    console.log('API response received:', response);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Unknown API error');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating application visit:', error);
    throw error;
  }
};

export const getApplicationVisits = async (applicationId: string) => {
  try {
    console.log(`Fetching application visits for applicationId: ${applicationId}`);
    const response = await apiClient.get<ApiResponse<ApplicationVisitData[]>>(`/application-visits/application/${applicationId}`);
    console.log('API response received for application visits:', {
      success: response.data.success,
      dataLength: response.data.data?.length || 0,
      sample: response.data.data?.length ? response.data.data[0] : 'No data'
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching application visits:', error);
    throw error;
  }
};

export const getApplicationVisit = async (id: string) => {
  try {
    const response = await apiClient.get<ApiResponse<ApplicationVisitData>>(`/application-visits/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application visit:', error);
    throw error;
  }
};

export const updateApplicationVisit = async (id: string, visitData: Partial<ApplicationVisitData>) => {
  try {
    const response = await apiClient.put<ApiResponse<ApplicationVisitData>>(`/application-visits/${id}`, visitData);
    return response.data;
  } catch (error) {
    console.error('Error updating application visit:', error);
    throw error;
  }
};

export const deleteApplicationVisit = async (id: string) => {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(`/application-visits/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting application visit:', error);
    throw error;
  }
};
