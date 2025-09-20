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
  email: string;
  mobile_number?: string;
  org_id?: number | null;
  created_at: string;
  updated_at: string;
  organization?: {
    org_id: number;
    org_name: string;
    org_type: string;
  };
  roles?: Role[];
  groups?: Group[];
}

export interface Organization {
  org_id: number;
  org_name: string;
  org_type: string;
  created_at: string;
  updated_at: string;
  users?: User[];
  groups?: Group[];
}

export interface Role {
  role_id: number;
  role_name: string;
  created_at: string;
  updated_at: string;
  users?: User[];
}

export interface Group {
  group_id: number;
  group_name: string;
  org_id: number;
  created_at: string;
  updated_at: string;
  organization?: Organization;
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
