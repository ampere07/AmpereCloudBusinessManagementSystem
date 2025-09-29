import apiClient from '../config/api';
import { Application } from '../types/application';

interface ApplicationResponse {
  status?: string;
  message?: string;
  applications?: Application[];
  application?: Application;
  debug?: any;
}

export const getApplications = async (): Promise<Application[]> => {
  try {
    const response = await apiClient.get<ApplicationResponse>('/applications');
    console.log('Application API response:', response.data);
    
    // Check for debug information
    if (response.data.debug) {
      console.log('Debug info:', response.data.debug);
    }
    
    if (response.data && response.data.applications && Array.isArray(response.data.applications) && response.data.applications.length > 0) {
      return response.data.applications.map(app => ({
        // Basic fields
        id: app.id || app.Application_ID || '',
        customer_name: app.customer_name || '',
        timestamp: app.timestamp || app.Timestamp || '',
        address: app.address || app.address_line || app.Installation_Address || '',
        address_line: app.address_line || app.Installation_Address || '',
        status: app.status || app.Status || 'pending',
        location: app.location || '',
        
        // Exact database column names (from your table structure)
        Application_ID: app.Application_ID || '',
        Timestamp: app.Timestamp || '',
        Email_Address: app.Email_Address || '',
        Region: app.Region || '',
        City: app.City || '',
        Barangay: app.Barangay || '',
        Referred_by: app.Referred_by || '',
        First_Name: app.First_Name || '',
        Middle_Initial: app.Middle_Initial || '',
        Last_Name: app.Last_Name || '',
        Mobile_Number: app.Mobile_Number || '',
        Secondary_Mobile_Number: app.Secondary_Mobile_Number || '',
        Installation_Address: app.Installation_Address || '',
        Landmark: app.Landmark || '',
        Desired_Plan: app.Desired_Plan || '',
        Proof_of_Billing: app.Proof_of_Billing || '',
        Government_Valid_ID: app.Government_Valid_ID || '',
        '2nd_Government_Valid_ID': app['2nd_Government_Valid_ID'] || '',
        House_Front_Picture: app.House_Front_Picture || '',
        I_agree_to_the_terms_and_conditions: app.I_agree_to_the_terms_and_conditions || '',
        First_Nearest_landmark: app.First_Nearest_landmark || '',
        Second_Nearest_landmark: app.Second_Nearest_landmark || '',
        Select_the_applicable_promo: app.Select_the_applicable_promo || '',
        Attach_the_picture_of_your_document: app.Attach_the_picture_of_your_document || '',
        Attach_SOA_from_other_provider: app.Attach_SOA_from_other_provider || '',
        Status: app.Status || '',
        
        // Convenience properties (friendly/lowercase names)
        city: app.city || app.City || '',
        region: app.region || app.Region || '',
        barangay: app.barangay || app.Barangay || '',
        create_date: app.create_date || '',
        create_time: app.create_time || '',
        email: app.email || app.Email_Address || '',
        mobile_number: app.mobile_number || app.mobile || app.Mobile_Number || '',
        mobile: app.mobile || app.Mobile_Number || '',
        secondary_number: app.secondary_number || app.mobile_alt || app.Secondary_Mobile_Number || '',
        mobile_alt: app.mobile_alt || app.Secondary_Mobile_Number || '',
        first_name: app.first_name || app.First_Name || '',
        middle_initial: app.middle_initial || app.Middle_Initial || '',
        last_name: app.last_name || app.Last_Name || '',
        referred_by: app.referred_by || app.Referred_by || '',
        plan: app.plan || app.desired_plan || app.Desired_Plan || '',
        desired_plan: app.desired_plan || app.Desired_Plan || '',
        landmark: app.landmark || app.Landmark || '',
        first_nearest_landmark: app.first_nearest_landmark || app.First_Nearest_landmark || '',
        second_nearest_landmark: app.second_nearest_landmark || app.Second_Nearest_landmark || '',
        promo: app.promo || app.Select_the_applicable_promo || '',
        gov_id_primary: app.gov_id_primary || app.Government_Valid_ID || '',
        gov_id_secondary: app.gov_id_secondary || app['2nd_Government_Valid_ID'] || '',
        house_front_pic: app.house_front_pic || app.House_Front_Picture || '',
        proof_of_billing: app.proof_of_billing || app.Proof_of_Billing || '',
        terms_agreement: app.terms_agreement || app.I_agree_to_the_terms_and_conditions || '',
        document_attachment: app.document_attachment || app.Attach_the_picture_of_your_document || '',
        soa_attachment: app.soa_attachment || app.Attach_SOA_from_other_provider || '',
        
        // Legacy fields for compatibility
        plan_id: app.plan_id || '',
        promo_id: app.promo_id || '',
        nearest_landmark1: app.nearest_landmark1 || '',
        nearest_landmark2: app.nearest_landmark2 || ''
      }));
    } else {
      console.log('No applications found in API response. Full response:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    if (error?.response) {
      console.error('Response error:', error.response.data);
    }
    throw error;
  }
};

export const getApplication = async (id: string): Promise<Application> => {
  try {
    const response = await apiClient.get<ApplicationResponse>(`/applications/${id}`);
    
    if (!response.data.application) {
      throw new Error('Application not found in API response');
    }
    
    // Extract application data and ensure all fields have values
    const app = response.data.application;
    
    return {
      // Basic fields
      id: app.id || app.Application_ID || '',
      customer_name: app.customer_name || '',
      timestamp: app.timestamp || app.Timestamp || '',
      address: app.address || app.address_line || app.Installation_Address || '',
      address_line: app.address_line || app.Installation_Address || '',
      status: app.status || app.Status || 'pending',
      location: app.location || '',
      
      // Exact database column names
      Application_ID: app.Application_ID || '',
      Timestamp: app.Timestamp || '',
      Email_Address: app.Email_Address || '',
      Region: app.Region || '',
      City: app.City || '',
      Barangay: app.Barangay || '',
      Referred_by: app.Referred_by || '',
      First_Name: app.First_Name || '',
      Middle_Initial: app.Middle_Initial || '',
      Last_Name: app.Last_Name || '',
      Mobile_Number: app.Mobile_Number || '',
      Secondary_Mobile_Number: app.Secondary_Mobile_Number || '',
      Installation_Address: app.Installation_Address || '',
      Landmark: app.Landmark || '',
      Desired_Plan: app.Desired_Plan || '',
      Proof_of_Billing: app.Proof_of_Billing || '',
      Government_Valid_ID: app.Government_Valid_ID || '',
      '2nd_Government_Valid_ID': app['2nd_Government_Valid_ID'] || '',
      House_Front_Picture: app.House_Front_Picture || '',
      I_agree_to_the_terms_and_conditions: app.I_agree_to_the_terms_and_conditions || '',
      First_Nearest_landmark: app.First_Nearest_landmark || '',
      Second_Nearest_landmark: app.Second_Nearest_landmark || '',
      Select_the_applicable_promo: app.Select_the_applicable_promo || '',
      Attach_the_picture_of_your_document: app.Attach_the_picture_of_your_document || '',
      Attach_SOA_from_other_provider: app.Attach_SOA_from_other_provider || '',
      Status: app.Status || '',
      
      // Convenience properties
      city: app.city || app.City || '',
      region: app.region || app.Region || '',
      barangay: app.barangay || app.Barangay || '',
      email: app.email || app.Email_Address || '',
      mobile_number: app.mobile_number || app.mobile || app.Mobile_Number || '',
      mobile: app.mobile || app.Mobile_Number || '',
      secondary_number: app.secondary_number || app.mobile_alt || app.Secondary_Mobile_Number || '',
      mobile_alt: app.mobile_alt || app.Secondary_Mobile_Number || '',
      create_date: app.create_date || '',
      create_time: app.create_time || '',
      update_date: app.update_date || '',
      update_time: app.update_time || '',
      first_name: app.first_name || app.First_Name || '',
      middle_initial: app.middle_initial || app.Middle_Initial || '',
      last_name: app.last_name || app.Last_Name || '',
      referred_by: app.referred_by || app.Referred_by || '',
      plan: app.plan || app.desired_plan || app.Desired_Plan || '',
      desired_plan: app.desired_plan || app.Desired_Plan || '',
      landmark: app.landmark || app.Landmark || '',
      first_nearest_landmark: app.first_nearest_landmark || app.First_Nearest_landmark || '',
      second_nearest_landmark: app.second_nearest_landmark || app.Second_Nearest_landmark || '',
      promo: app.promo || app.Select_the_applicable_promo || '',
      gov_id_primary: app.gov_id_primary || app.Government_Valid_ID || '',
      gov_id_secondary: app.gov_id_secondary || app['2nd_Government_Valid_ID'] || '',
      house_front_pic: app.house_front_pic || app.House_Front_Picture || '',
      proof_of_billing: app.proof_of_billing || app.Proof_of_Billing || '',
      terms_agreement: app.terms_agreement || app.I_agree_to_the_terms_and_conditions || '',
      document_attachment: app.document_attachment || app.Attach_the_picture_of_your_document || '',
      soa_attachment: app.soa_attachment || app.Attach_SOA_from_other_provider || '',
      
      // Legacy fields for compatibility
      plan_id: app.plan_id || '',
      promo_id: app.promo_id || '',
      nearest_landmark1: app.nearest_landmark1 || '',
      nearest_landmark2: app.nearest_landmark2 || '',
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
  // Convert lowercase field names to exact database column names
  const dbData: any = {};
  
  if (application.status !== undefined) {
    dbData.Status = application.status;  // Convert lowercase 'status' to capitalized 'Status'
  }
  
  const response = await apiClient.put<ApplicationResponse>(`/applications/${id}`, dbData);
  if (!response.data.application) {
    throw new Error('Failed to update application');
  }
  return response.data.application;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await apiClient.delete<ApplicationResponse>(`/applications/${id}`);
};
