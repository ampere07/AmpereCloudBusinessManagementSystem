// Define the JobOrder interface to match job_orders database table
export interface JobOrder {
  id?: string | number;
  JobOrder_ID?: string;
  Application_ID?: string;
  Status?: string;
  Timestamp?: string | null;
  First_Name?: string | null;
  Middle_Initial?: string | null;
  Last_Name?: string | null;
  Address?: string | null;
  Contact_Number?: string | null;
  Email?: string | null;
  Second_Contact_Number?: string | null;
  Email_Address?: string | null;
  Applicant_Email_Address?: string | null;
  City?: string | null;
  Barangay?: string | null;
  Location?: string;
  Choose_Plan?: string | null;
  Contract_Template?: string | null;
  Contract_Link?: string | null;
  Username?: string | null;
  Referred_By?: string | null;
  Connection_Type?: string | null;
  Installation_Landmark?: string | null;
  Billing_Day?: string | null;
  Assigned_Email?: string | null;
  Onsite_Status?: string | null;
  Billing_Status?: string | null;
  Installation_Fee?: number | null;
  Status_Remarks?: string | null;
  Remarks?: string | null;
  Modified_By?: string | null;
  Modified_Date?: string | null;
  Created_By?: string;
  Created_At?: string;
  Updated_At?: string | null;
  
  // Additional fields that might be used in forms and modals
  Visit_With_Other?: string | null;
  [key: string]: any; // Allow additional properties for flexibility
}

// Export JobOrderData for compatibility with existing code
export type JobOrderData = JobOrder;

// Define component prop interfaces
export interface JobOrderDetailsProps {
  jobOrder: JobOrder;
  onClose: () => void;
}
