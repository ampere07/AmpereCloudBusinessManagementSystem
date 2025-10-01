export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: {
      email: string;
      name: string;
      role: string;
    };
    token: string;
  };
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
  data: {
    server: string;
    timestamp: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface UserData {
  email: string;
  name: string;
  role: string;
}

export interface User {
  user_id: number;
  salutation?: string;
  full_name: string;
  username: string;
  email_address: string;
  mobile_number?: string;
  org_id?: number | null;
  created_at: string;
  updated_at: string;
  organization?: {
    id: number;
    organization_name: string;
    address?: string | null;
    contact_number?: string | null;
    email_address?: string | null;
  };
}

export interface Organization {
  id: number;
  organization_name: string;
  address?: string | null;
  contact_number?: string | null;
  email_address?: string | null;
  created_at: string;
  created_by_user_id?: number | null;
  updated_at: string;
  updated_by_user_id?: number | null;
  users?: User[];
}

export interface Role {
  role_id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
  users?: User[];
}

export interface Group {
  id: number;
  group_name: string;
  fb_page_link?: string | null;
  fb_messenger_link?: string | null;
  template?: string | null;
  company_name?: string | null;
  portal_url?: string | null;
  hotline?: string | null;
  email?: string | null;
  modified_by_user_id?: number | null;
  modified_date?: string | null;
  users?: User[];
}

export interface CreateUserRequest {
  salutation?: string;
  full_name: string;
  username: string;
  email: string;
  mobile_number?: string;
  password: string;
  org_id?: number;
}

export interface UpdateUserRequest {
  salutation?: string;
  full_name?: string;
  username?: string;
  email?: string;
  mobile_number?: string;
  password?: string;
  org_id?: number | null | undefined;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface Application {
  id: string;
  customerName: string;
  timestamp: string;
  address: string;
  action?: 'Schedule' | 'Duplicate';
  location: string;
  email?: string;
  mobileNumber?: string;
  secondaryNumber?: string;
}

export interface ApplicationsResponse {
  applications: Application[];
}

export interface SalesAgent {
  id: number;
  name: string;
  email?: string;
  mobile_number?: string;
  territory?: string;
  commission_rate?: number;
  created_at: string;
  updated_at: string;
}
