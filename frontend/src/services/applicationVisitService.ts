import apiClient from '../config/api';

// Response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  table?: string;
  debug?: any;
  columns?: string[];
}

export interface ApplicationVisitData {
  Application_ID: string;
  Visit_By: string;
  Visit_With?: string | null;
  Visit_With_Other?: string | null;
  Visit_Type: string;
  Visit_Notes?: string | null;
  Visit_Status: string;
  First_Name: string;
  Middle_Initial?: string | null;
  Last_Name: string;
  Contact_Number: string;
  Second_Contact_Number?: string | null;
  Email_Address: string;
  Address: string;
  Barangay?: string | null;
  City?: string | null;
  Region?: string | null;
  Choose_Plan?: string;
  Installation_Landmark?: string | null;
  Assigned_Email?: string;
  Created_By: string;
  Modified_By: string;
  id?: string; // Optional ID field for response
  ID?: string; // Optional ID field for response (Laravel convention)
}

export const createApplicationVisit = async (visitData: ApplicationVisitData) => {
  try {
    console.log('Making API request to create application visit:', visitData);
    
    // Check that Application_ID exists
    if (!visitData.Application_ID) {
      throw new Error('Application_ID is required');
    }
    
    // Using the correct table name 'application_visits'
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

export const getAllApplicationVisits = async () => {
  try {
    console.log('Fetching all application visits...');
    // Using the correct table name 'application_visits'
    const response = await apiClient.get<ApiResponse<any[]>>('/application-visits');
    
    // Log the complete response for debugging
    console.log('API response received for all application visits:', {
      success: response.data.success,
      count: response.data.count || (response.data.data?.length || 0),
      table: response.data.table || 'unknown',
      sample: response.data.data?.length ? response.data.data[0] : 'No data',
      columns: response.data.columns || []
    });
    
    // Verify data structure and return the response
    if (response.data && response.data.data) {
      return response.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      // Return a standardized response structure
      return {
        success: false,
        data: [],
        message: 'Invalid response format from API'
      };
    }
  } catch (error: any) {
    console.error('Error fetching all application visits:', error);
    // Provide more detailed error info
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data || 'No response data',
      status: error.response?.status || 'No status code'
    });
    
    // Return an error response instead of throwing
    return {
      success: false,
      data: [],
      message: `API Error: ${error.message}` + 
              (error.response?.data?.error ? ` - ${error.response.data.error}` : '')
    };
  }
};

export const getApplicationVisits = async (applicationId: string) => {
  try {
    console.log(`Fetching application visits for applicationId: ${applicationId}`);
    // Using the correct table name 'application_visits'
    const response = await apiClient.get<ApiResponse<any[]>>(`/application-visits/application/${applicationId}`);
    
    // Log the complete response for debugging
    console.log('API response received for application visits:', {
      success: response.data.success,
      count: response.data.count || (response.data.data?.length || 0),
      table: response.data.table || 'unknown',
      sample: response.data.data?.length ? response.data.data[0] : 'No data',
      columns: response.data.columns || []
    });
    
    // Verify data structure and return the response
    if (response.data && response.data.data) {
      return response.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      // Return a standardized response structure
      return {
        success: false,
        data: [],
        message: 'Invalid response format from API'
      };
    }
  } catch (error: any) {
    console.error('Error fetching application visits:', error);
    // Provide more detailed error info
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data || 'No response data',
      status: error.response?.status || 'No status code'
    });
    
    // Return an error response instead of throwing
    return {
      success: false,
      data: [],
      message: `API Error: ${error.message}` + 
              (error.response?.data?.error ? ` - ${error.response.data.error}` : '')
    };
  }
};

export const getApplicationVisit = async (id: string) => {
  try {
    // Using the correct table name 'application_visits'
    const response = await apiClient.get<ApiResponse<ApplicationVisitData>>(`/application-visits/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application visit:', error);
    throw error;
  }
};

export const updateApplicationVisit = async (id: string, visitData: Partial<ApplicationVisitData>) => {
  try {
    // Using the correct table name 'application_visits'
    const response = await apiClient.put<ApiResponse<ApplicationVisitData>>(`/application-visits/${id}`, visitData);
    return response.data;
  } catch (error) {
    console.error('Error updating application visit:', error);
    throw error;
  }
};

export const deleteApplicationVisit = async (id: string) => {
  try {
    // Using the correct table name 'application_visits'
    const response = await apiClient.delete<ApiResponse<null>>(`/application-visits/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting application visit:', error);
    throw error;
  }
};
