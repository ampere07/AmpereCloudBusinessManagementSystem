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

export {};
