import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { debugLog } from '../utils/DevConsole';
import { logoutUser } from '../utils/logoutHandler';

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

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      debugLog('Auth', 'Attempting login', { email });
      
      const response = await api.post('/users/login', { email, password });
      debugLog('Auth', 'Login response data', response.data);
      
      // Extract user data and token from response
      const { user, token, refreshToken, message } = response.data;
      
      debugLog('Auth', 'Login response received', {
        hasUser: !!user,
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        message,
        responseData: response.data
      });
      
      if (!user || !token) {
        throw new Error(message || 'Invalid login response: Missing user data or token');
      }

      // Store the token from the backend
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Set user state
      setUser(user);
      
      debugLog('Auth', 'Login successful', { 
        user,
        tokenStored: !!localStorage.getItem('accessToken'),
        refreshTokenStored: !!localStorage.getItem('refreshToken')
      });
      
      // Navigate after state is updated
      navigate('/dashboard', { replace: true });
      return user;
    } catch (error) {
      debugLog('Auth', 'Login failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Clear any partial state and tokens
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setError(error.response?.data?.message || error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        debugLog('Auth', 'Initializing auth state');
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user'); // Assuming user data might be stored
        
        if (!token) {
          debugLog('Auth', 'No token found, user is not authenticated');
          setUser(null);
          setLoading(false);
          return;
        }

        // Instead of parsing a temporary token, validate with a backend call if possible
        // For now, if a token exists, assume authenticated and try to fetch user profile
        // This is a common pattern for persistent login
        try {
          const response = await api.get('/users/profile');
          setUser(response.data);
          debugLog('Auth', 'User profile fetched successfully during init', { user: response.data });
        } catch (profileError) {
          debugLog('Auth', 'Error fetching user profile during init', { error: profileError.message });
          // If profile fetch fails (e.g., token expired, invalid token), clear and logout
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          navigate('/login'); // Redirect to login on token invalidation
        }
      } catch (error) {
        debugLog('Auth', 'Error initializing auth', { 
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate]); // Add navigate to dependency array

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      debugLog('Auth', 'Attempting registration', { 
        email: userData.email,
        username: userData.username
      });
      
      const response = await api.post('/users/register', userData);
      const { user, token, refreshToken, message } = response.data;
      
      debugLog('Auth', 'Registration response received', {
        hasUser: !!user,
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        message
      });
      
      if (!user || !token) {
        throw new Error(message || 'Invalid registration response: Missing user data or token');
      }
      
      // Store tokens
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      setUser(user);
      debugLog('Auth', 'Registration successful', { 
        user,
        tokensStored: {
          accessToken: !!localStorage.getItem('accessToken'),
          refreshToken: !!localStorage.getItem('refreshToken')
        }
      });
      
      navigate('/dashboard', { replace: true }); // Use replace for registration navigation as well
      return user;
    } catch (error) {
      debugLog('Auth', 'Registration failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(error.response?.data?.message || error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      debugLog('Auth', 'Attempting logout', {
        hasAccessToken: !!localStorage.getItem('accessToken'),
        hasRefreshToken: !!localStorage.getItem('refreshToken')
      });
      
      // Attempt to call backend logout endpoint, but don't block on it
      // if it fails, we still want to clear local state
      api.post('/users/logout').catch(err => debugLog('Auth', 'Backend logout failed (non-critical)', err));
      debugLog('Auth', 'Logout API call initiated');

    } catch (error) {
      debugLog('Auth', 'Logout API call failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      // Always clear local state and tokens immediately for responsive UI
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      debugLog('Auth', 'Local state cleared', {
        userCleared: true,
        tokensCleared: {
          accessToken: !localStorage.getItem('accessToken'),
          refreshToken: !localStorage.getItem('refreshToken')
        }
      });
      navigate('/login', { replace: true }); // Use replace for logout navigation
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      debugLog('Auth', 'Updating profile', { 
        userId: user?.id,
        updateFields: Object.keys(profileData)
      });
      
      const response = await api.put('/users/profile', profileData);
      setUser(response.data);
      debugLog('Auth', 'Profile updated successfully', { 
        user: response.data,
        hasToken: !!localStorage.getItem('accessToken')
      });
      
      return response.data;
    } catch (error) {
      debugLog('Auth', 'Profile update failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setError(error.response?.data?.message || 'Profile update failed');
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
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
