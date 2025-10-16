import axios from 'axios';

const PRIMARY_RADIUS_URL = 'https://103.186.139.138:8484';
const BACKUP_RADIUS_URL = 'https://103.186.139.138:8484';

interface RadiusAccountData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  plan?: string;
}

interface RadiusResponse {
  success: boolean;
  message: string;
  data?: any;
}

const createRadiusAxiosInstance = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

export const createRadiusAccount = async (accountData: RadiusAccountData): Promise<RadiusResponse> => {
  try {
    console.log('Attempting to create RADIUS account with primary URL');
    const primaryInstance = createRadiusAxiosInstance(PRIMARY_RADIUS_URL);
    
    const response = await primaryInstance.post('/api/accounts/create', accountData);
    
    console.log('RADIUS account created successfully via primary URL:', response.data);
    return {
      success: true,
      message: 'RADIUS account created successfully',
      data: response.data
    };
  } catch (primaryError: any) {
    console.warn('Primary RADIUS URL failed, attempting backup URL:', primaryError.message);
    
    try {
      const backupInstance = createRadiusAxiosInstance(BACKUP_RADIUS_URL);
      
      const response = await backupInstance.post('/api/accounts/create', accountData);
      
      console.log('RADIUS account created successfully via backup URL:', response.data);
      return {
        success: true,
        message: 'RADIUS account created successfully (via backup)',
        data: response.data
      };
    } catch (backupError: any) {
      console.error('Both primary and backup RADIUS URLs failed');
      console.error('Primary error:', primaryError.message);
      console.error('Backup error:', backupError.message);
      
      return {
        success: false,
        message: `Failed to create RADIUS account: ${backupError.response?.data?.message || backupError.message}`
      };
    }
  }
};

export const generateRadiusUsername = (lastName: string, mobileNumber: string): string => {
  const cleanLastName = lastName.trim().toLowerCase().replace(/\s+/g, '');
  const cleanMobileNumber = mobileNumber.trim().replace(/\D/g, '');
  
  return `${cleanLastName}${cleanMobileNumber}`;
};

export const generateRadiusPassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};
