import apiClient from '../config/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ApplicationVisitData {
  id?: number;
  application_id: number;
  timestamp?: string;
  assigned_email: string;
  visit_by?: string | null;
  visit_with?: string | null;
  visit_status?: string | null;
  visit_remarks?: string | null;
  application_status?: string | null;
  status_remarks?: string | null;
  image1_url?: string | null;
  image2_url?: string | null;
  image3_url?: string | null;
  house_front_picture_url?: string | null;
  region?: string | null;
  city?: string | null;
  barangay?: string | null;
  location?: string | null;
  choose_plan?: string | null;
  promo?: string | null;
  created_at?: string;
  created_by_user_email?: string;
  updated_at?: string;
  updated_by_user_email?: string;
}

export const createApplicationVisit = async (visitData: ApplicationVisitData) => {
  try {
    console.log('Creating application visit with data:', visitData);
    console.log('Data types:', {
      application_id: typeof visitData.application_id,
      assigned_email: typeof visitData.assigned_email,
      visit_status: typeof visitData.visit_status
    });
    
    if (!visitData.application_id) {
      throw new Error('application_id is required');
    }
    
    const response = await apiClient.post<ApiResponse<ApplicationVisitData>>('/application-visits', visitData);
    console.log('Visit created successfully:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Unknown API error');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error creating application visit:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    
    if (error.response?.data) {
      const errorData = error.response.data;
      console.error('Detailed error data:', errorData);
      
      if (errorData.errors) {
        console.error('Validation errors:', errorData.errors);
      }
      
      if (errorData.error) {
        console.error('Error message:', errorData.error);
      }
    }
    
    throw error;
  }
};

export const getAllApplicationVisits = async (assignedEmail?: string) => {
  try {
    const params = assignedEmail ? { assigned_email: assignedEmail } : {};
    const response = await apiClient.get<ApiResponse<ApplicationVisitData[]>>('/application-visits', { params });
    
    if (response.data && response.data.data) {
      return response.data;
    }
    
    return {
      success: false,
      data: [],
      message: 'Invalid response format from API'
    };
  } catch (error: any) {
    console.error('Error fetching application visits:', error);
    return {
      success: false,
      data: [],
      message: error.message
    };
  }
};

export const getApplicationVisits = async (applicationId: string) => {
  try {
    const response = await apiClient.get<ApiResponse<ApplicationVisitData[]>>(`/application-visits/application/${applicationId}`);
    
    if (response.data && response.data.data) {
      return response.data;
    }
    
    return {
      success: false,
      data: [],
      message: 'Invalid response format from API'
    };
  } catch (error: any) {
    console.error('Error fetching application visits:', error);
    return {
      success: false,
      data: [],
      message: error.message
    };
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
