import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { logoutUser } from '../utils/logoutHandler';
import api from '../services/api';
import ErrorBoundary from "../utils/ErrorBoundary.jsx";
import { toast } from 'react-toastify';

// Debug logger
const debug = (component, action, data = null) => {
  if (import.meta.env.DEV) {
    console.log(`[AuthContext:${component}] ${action}`, data || '');
  }
};

// Create context
const AuthContext = createContext(null);

// Token management utilities
export const getAccessToken = () => {
  const token = localStorage.getItem('accessToken');
  debug('Token', 'Getting access token', { exists: !!token });
  return token;
};

export const getRefreshToken = () => {
  const token = localStorage.getItem('refreshToken');
  debug('Token', 'Getting refresh token', { exists: !!token });
  return token;
};

export const setAccessToken = (token) => {
  debug('Token', 'Setting access token');
  localStorage.setItem('accessToken', token);
};

export const setRefreshToken = (token) => {
  debug('Token', 'Setting refresh token');
  localStorage.setItem('refreshToken', token);
};

export const clearTokens = () => {
  debug('Token', 'Clearing tokens');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    debug('Auth', 'Checking authentication status');
    try {
      const response = await api.get('/auth/status', {
        params: { skipPagination: true } // Skip pagination for auth status
      });
      debug('Auth', 'Auth status response', response.data);
      setUser(response.data.user);
      setError(null);
      return true;
    } catch (err) {
      debug('Auth', 'Auth check failed', err);
      setUser(null);
      const errorMessage = err.response?.data?.message || 'Authentication failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    debug('Auth', 'Attempting login', { email });
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;
      
      debug('Auth', 'Login successful', { user: { ...user, password: undefined } });
      
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setUser(user);
      setError(null);
      
      return user;
    } catch (err) {
      debug('Auth', 'Login failed', err);
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    debug('Auth', 'Attempting logout');
    try {
      await logoutUser();
      debug('Auth', 'Logout successful');
      toast.success('Logged out successfully');
    } catch (err) {
      debug('Auth', 'Logout error', err);
      toast.error('Error during logout');
    } finally {
      clearTokens();
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    debug('Auth', 'Attempting token refresh');
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        debug('Auth', 'No refresh token available');
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, newRefreshToken } = response.data;
      
      debug('Auth', 'Token refresh successful');
      
      setAccessToken(accessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
      
      return accessToken;
    } catch (err) {
      debug('Auth', 'Token refresh failed', err);
      clearTokens();
      setUser(null);
      toast.error('Session expired. Please login again.');
      throw err;
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    debug('Auth', 'Initial auth check');
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        debug('Auth', 'Initial auth check error', { error });
        toast.error('Failed to check authentication status');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [checkAuth]);

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refreshToken,
    checkAuth
  };

  return (
    <ErrorBoundary fallback={authErrorFallback}>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    debug('Auth', 'useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom fallback for auth errors
const authErrorFallback = (error, errorInfo) => (
  <div className="text-red-500 p-4 border border-red-500 rounded">
    <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
    <details className="whitespace-pre-wrap">
      <summary>Error details</summary>
      {error && error.toString()}
      <br />
      {errorInfo && errorInfo.componentStack}
    </details>
  </div>
);
