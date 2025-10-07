import axios from 'axios';

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL must be defined in .env file');
}

console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let csrfInitialized = false;

export const initializeCsrf = async (): Promise<void> => {
  if (csrfInitialized) {
    return;
  }

  try {
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfInitialized = true;
    console.log('CSRF cookie initialized');
  } catch (error) {
    console.error('Failed to initialize CSRF cookie:', error);
  }
};

apiClient.interceptors.request.use(
  async (config: any) => {
    const method = config.method?.toUpperCase();
    const requiresCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '');

    if (requiresCsrf && !csrfInitialized) {
      await initializeCsrf();
    }

    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken && requiresCsrf) {
      config.headers = config.headers || {};
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data || 'No data'
    );
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(
        `API Error: ${error.response.status} ${error.response.config?.url}`,
        error.response.data
      );

      if (error.response.status === 419) {
        csrfInitialized = false;
        const originalRequest = error.config;

        if (!originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await initializeCsrf();
            const xsrfToken = getCookie('XSRF-TOKEN');
            if (xsrfToken) {
              originalRequest.headers['X-XSRF-TOKEN'] = xsrfToken;
            }
            return apiClient(originalRequest);
          } catch (retryError) {
            return Promise.reject(retryError);
          }
        }
      }
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
