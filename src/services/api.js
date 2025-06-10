import axios from "axios";
import { logoutUser } from "../utils/logoutHandler";

// Debug logger
const debug = (component, action, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`[API:${component}] ${action}`, data || '');
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://codevault-backend-zfhm.onrender.com/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  withCredentials: true, // Enables cookie-based auth
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
  debug('Config', 'API Configuration', {
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
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log('[API:Request]', config.method.toUpperCase(), config.url, {
        headers: config.headers,
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API:Request] Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('[API:Response]', response.status, response.config.url, {
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error('[API:Error]', error.response?.status, error.config?.url, {
        message: error.message,
        response: error.response?.data,
        headers: error.response?.headers
      });
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear any stored tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 404 errors for auth status
    if (error.response?.status === 404 && error.config?.url.includes('/auth/status')) {
      // This is expected for unauthenticated users
      return Promise.resolve({ data: { user: null } });
    }

    return Promise.reject(error);
  }
);

export default api;

