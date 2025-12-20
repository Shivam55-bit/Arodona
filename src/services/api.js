import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API
export const BASE_URL = 'https://arodna.gyanpith.com/api';

// Token storage keys
const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_data';

// Save token to AsyncStorage
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Get token from AsyncStorage
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Remove token from AsyncStorage
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Save user data to AsyncStorage
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Get user data from AsyncStorage
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Remove user data from AsyncStorage
export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

// Clear all auth data
export const clearAuthData = async () => {
  await removeToken();
  await removeUserData();
};

// API request helper with authentication
export const apiRequest = async (endpoint, method = 'GET', body = null, requiresAuth = true) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Get response text first
    const text = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // If JSON parse fails, log the actual response
      console.error('Failed to parse JSON response:', text.substring(0, 200));
      throw {
        status: response.status,
        message: 'Invalid response from server',
        data: null
      };
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || data.detail || 'Something went wrong',
        data
      };
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
