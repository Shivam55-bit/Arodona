import { apiRequest, saveToken, saveUserData, clearAuthData } from './api';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.first_name - First name
 * @param {string} userData.last_name - Last name
 * @param {string} userData.email - Email address
 * @param {string} userData.phone - Phone number
 * @param {string} userData.password - Password
 * @returns {Promise<Object>} Response with user data
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest('/auth/register', 'POST', userData, false);
    
    // Save user data after successful registration
    if (response.user) {
      await saveUserData(response.user);
    }
    
    return {
      success: true,
      message: response.message,
      user: response.user,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Registration failed',
      error,
    };
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with access token and user data
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiRequest('/auth/login', 'POST', credentials, false);
    
    // Save token and user data after successful login
    if (response.access_token) {
      await saveToken(response.access_token);
    }
    
    if (response.user) {
      await saveUserData(response.user);
    }
    
    return {
      success: true,
      accessToken: response.access_token,
      tokenType: response.token_type,
      user: response.user,
      require2FA: response.require_2fa,
      tempToken: response.temp_token,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Login failed',
      error,
    };
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Response
 */
export const logoutUser = async () => {
  try {
    // Clear all auth data from storage
    await clearAuthData();
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Logout failed',
      error,
    };
  }
};

/**
 * Verify if user is authenticated
 * @returns {Promise<boolean>} True if authenticated
 */
export const isAuthenticated = async () => {
  try {
    const { getToken, getUserData } = require('./api');
    const token = await getToken();
    const user = await getUserData();
    return !!(token && user);
  } catch (error) {
    return false;
  }
};
