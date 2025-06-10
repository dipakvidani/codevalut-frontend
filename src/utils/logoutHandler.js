import { clearTokens } from '../context/AuthContext';

/**
 * Handles user logout by clearing tokens and redirecting to login
 */
export const logoutUser = async () => {
  try {
    // Clear tokens from storage
    clearTokens();
    
    // Clear any other auth-related data
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear any cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error during logout:', error);
    // Still redirect to login even if there's an error
    window.location.href = '/login';
  }
};
  