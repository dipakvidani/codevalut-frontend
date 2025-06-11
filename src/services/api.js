import axios from "axios";
import { logoutUser } from "../utils/logoutHandler";
import { debugLog } from '../utils/DevConsole';

// Get backend URL based on environment
const getBackendUrl = () => {
  // In development, use a proxy to avoid CORS issues
  if (import.meta.env.DEV) {
    const url = '/proxy-api';
    debugLog('API:Config', 'Using development proxy URL', { url });
    return url;
  }
  
  // In production, use the full URL
  const url = import.meta.env.VITE_API_URL || 'https://codevault-backend-zfhm.onrender.com/api/v1';
  debugLog('API:Config', 'Using production API URL', { url });
  return url;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBackendUrl(),
  timeout: 15000, // Reduced timeout to 15 seconds
  withCredentials: true, // Enable credentials for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Default pagination settings
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

// Helper function to add pagination params
const addPaginationParams = (config) => {
  if (config.method === 'get' && !config.params?.skipPagination) {
    config.params = {
      ...config.params,
      page: config.params?.page || DEFAULT_PAGE,
      limit: config.params?.limit || DEFAULT_PAGE_SIZE,
      _t: Date.now()
    };
  }
  return config;
};

// Log API configuration in development
if (import.meta.env.DEV) {
  debugLog('Config', 'API Configuration', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    withCredentials: api.defaults.withCredentials,
    environment: import.meta.env.MODE,
    headers: api.defaults.headers
  });
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (import.meta.env.DEV) {
      debugLog('API', 'Making request', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
        params: config.params,
        fullUrl: `${config.baseURL}${config.url}`,
        hasToken: !!token
      });
    }

    // Only add token if it exists and the request is not for login/register
    if (token && !config.url.includes('/users/login') && !config.url.includes('/users/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    debugLog('API', 'Request error', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      debugLog('API', 'Response received', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    debugLog('API', 'Response error', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      response: error.response?.data
    });

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please check your internet connection and try again.'));
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Don't treat login/register requests as session expiration
      if (config.url.includes('/users/login') || config.url.includes('/users/register')) {
        return Promise.reject(new Error(error.response?.data?.message || 'Invalid credentials'));
      }

      // For other requests, handle as session expiration
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle 429 Rate Limit errors
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      debugLog('API', 'Rate limit exceeded', {
        retryAfter,
        url: error.config.url
      });
      return Promise.reject(new Error(`Too many requests. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`));
    }

    // Handle validation errors
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      debugLog('API', 'Validation error', {
        errors: validationErrors,
        url: error.config.url
      });
      return Promise.reject(new Error(validationErrors.map(err => err.msg).join(', ')));
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/users/logout');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }
};

// Snippets API
export const snippetsAPI = {
  create: async (snippetData) => {
    const response = await api.post('/snippets', snippetData);
    return response.data;
  },
  getAll: async (params = {}) => {
    const response = await api.get('/snippets', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/snippets/${id}`);
    return response.data;
  },
  update: async (id, snippetData) => {
    const response = await api.put(`/snippets/${id}`, snippetData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/snippets/${id}`);
    return response.data;
  },
  like: async (id) => {
    const response = await api.post(`/snippets/${id}/like`);
    return response.data;
  },
  fork: async (id) => {
    const response = await api.post(`/snippets/${id}/fork`);
    return response.data;
  }
};

export default api;

