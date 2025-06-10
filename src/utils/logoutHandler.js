import { debugLog } from './DevConsole';

/**
 * Handles user logout by clearing tokens and redirecting to login
 */
export const logoutUser = () => {
  try {
    debugLog('Auth', 'Starting logout process');
    
    // Clear tokens from localStorage
    clearTokens();
    
    // Clear any other auth-related data
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear any auth-related cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      if (name.trim().toLowerCase().includes('auth') || 
          name.trim().toLowerCase().includes('token') ||
          name.trim().toLowerCase().includes('session')) {
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        debugLog('Auth', 'Cleared cookie', { name: name.trim() });
      }
    });
    
    // Clear any auth-related headers from the current page
    if (window.axios) {
      delete window.axios.defaults.headers.common['Authorization'];
    }
    
    debugLog('Auth', 'Logout cleanup completed');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    debugLog('Auth', 'Error during logout', error);
    // Still redirect to login even if there's an error
    window.location.href = '/login';
  }
};

/**
 * Clear tokens from localStorage and handle any errors
 */
export const clearTokens = () => {
  try {
    const hadAccessToken = !!localStorage.getItem('accessToken');
    const hadRefreshToken = !!localStorage.getItem('refreshToken');
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    debugLog('Auth', 'Tokens cleared from localStorage', {
      hadAccessToken,
      hadRefreshToken,
      accessTokenCleared: !localStorage.getItem('accessToken'),
      refreshTokenCleared: !localStorage.getItem('refreshToken')
    });
  } catch (error) {
    debugLog('Auth', 'Error clearing tokens', error);
    // Try to clear tokens individually in case one fails
    try {
      localStorage.removeItem('accessToken');
    } catch (e) {
      debugLog('Auth', 'Error clearing access token', e);
    }
    try {
      localStorage.removeItem('refreshToken');
    } catch (e) {
      debugLog('Auth', 'Error clearing refresh token', e);
    }
  }
};
  