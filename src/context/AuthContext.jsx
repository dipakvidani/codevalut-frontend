import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import ErrorBoundary from "../utils/ErrorBoundary";

// Token management utilities
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const getToken = () => document.cookie.split('; ').find(row => row.startsWith(`${TOKEN_KEY}=`))?.split('=')[1];
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const setTokens = (accessToken, refreshToken) => {
  document.cookie = `${TOKEN_KEY}=${accessToken}; path=/; secure; samesite=strict`;
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};
const clearTokens = () => {
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Create context with default values
const defaultContext = {
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isLoading: true,
  error: null,
  setError: () => {},
  login: async () => {},
  logout: async () => {},
  refreshToken: async () => {}
};

export const AuthContext = createContext(defaultContext);

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

// Named export for the provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleError = useCallback((err, defaultMessage) => {
    const errorMessage = err.response?.data?.message || err.message || defaultMessage;
    console.error(defaultMessage, err);
    setError(errorMessage);
    return errorMessage;
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const res = await api.post('/users/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = res.data;
      
      setTokens(accessToken, newRefreshToken);
      return true;
    } catch (err) {
      handleError(err, 'Failed to refresh token');
      clearTokens();
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, [handleError]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const res = await api.get("/users/profile");
      
      if (res.data?.user && typeof res.data.user === 'object') {
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        if (refreshed) {
          return fetchProfile();
        }
      }
      handleError(err, 'Failed to fetch profile');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [refreshToken, handleError]);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await api.post('/users/login', credentials);
      const { user, accessToken, refreshToken } = res.data;
      
      setTokens(accessToken, refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      handleError(err, 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await api.post("/users/logout");
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      handleError(err, 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
      setError(null);
    }
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  const contextValue = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    error,
    setError,
    login,
    logout,
    refreshToken
  };

  return (
    <ErrorBoundary fallback={authErrorFallback}>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
