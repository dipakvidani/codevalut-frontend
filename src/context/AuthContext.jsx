import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { debugLog } from '../utils/DevConsole';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        debugLog('Auth', 'Initializing auth state');
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          debugLog('Auth', 'No token found, user is not authenticated');
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          const response = await api.get('/users/profile');
          if (response.data) {
          setUser(response.data);
            debugLog('Auth', 'User profile fetched successfully', { user: response.data });
          } else {
            throw new Error('Invalid user profile data received');
          }
        } catch (profileError) {
          debugLog('Auth', 'Error fetching user profile', { error: profileError.message });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          navigate('/login', { replace: true });
        }
      } catch (error) {
        debugLog('Auth', 'Error initializing auth', { error });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      debugLog('Auth', 'Attempting login', { email });
      
      const response = await api.post('/users/login', { email, password });
      debugLog('Auth', 'Login response data', response.data);
      
      const { user, token, refreshToken, message } = response.data;
      
      if (!user || !token) {
        throw new Error(message || 'Invalid login response: Missing user data or token');
      }
      
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(user);
      debugLog('Auth', 'Login successful', { user });
      
      navigate('/dashboard', { replace: true });
      return user;
    } catch (error) {
      debugLog('Auth', 'Login failed', { error });
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setError(error.response?.data?.message || error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      debugLog('Auth', 'Attempting logout');
      
      await api.post('/users/logout').catch(err => 
        debugLog('Auth', 'Backend logout failed (non-critical)', err)
      );
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      
      debugLog('Auth', 'Logout successful');
      navigate('/login', { replace: true });
    } catch (error) {
      debugLog('Auth', 'Logout error', { error });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      debugLog('Auth', 'Attempting registration', { email: userData.email });
      
      const response = await api.post('/users/register', userData);
      debugLog('Auth', 'Registration response data', response.data);

      const { user, token, refreshToken, message } = response.data;

      if (!user || !token) {
        throw new Error(message || 'Invalid registration response: Missing user data or token');
      }

      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      setUser(user);
      debugLog('Auth', 'Registration successful', { user });
      navigate('/dashboard', { replace: true });
      return user;
    } catch (error) {
      debugLog('Auth', 'Registration failed', { error });
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setError(error.response?.data?.message || error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
