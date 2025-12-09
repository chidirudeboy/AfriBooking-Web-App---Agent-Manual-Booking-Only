import axios from 'axios';
import Cookies from 'js-cookie';

// Get base URL from environment or use default
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: check for environment variable or use default
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (envUrl) return envUrl;
    
    // Try to infer from current host
    const hostname = window.location.hostname;
    if (hostname.includes('api.africartz.com')) {
      return 'https://api.africartz.com/api';
    } else if (hostname.includes('staging-api.africartz.com')) {
      return 'https://staging-api.africartz.com/api';
    }
  }
  
  // Default to production API
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.africartz.com/api';
};

const baseURL = getBaseUrl();

// Create axios instance
export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear auth on unauthorized
      Cookies.remove('auth_token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  login: '/auth/signin',
  profile: '/auth/profile',
  addManualBooking: (agentId: string) => `/bookings/manual/${agentId}`,
  getApartments: '/apartment/getAgentApartments',
};

export default apiClient;

