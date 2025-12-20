import { apiRequest, saveUserData } from './api';

/**
 * Get user profile
 * @returns {Promise<Object>} Response with user profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await apiRequest('/users/profile', 'GET', null, true);
    
    // Save updated user data
    if (response) {
      await saveUserData(response);
    }
    
    return {
      success: true,
      user: response,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch profile',
      error,
    };
  }
};

/**
 * Update user avatar/profile picture
 * @param {string} avatarUrl - URL or base64 string of the avatar image
 * @returns {Promise<Object>} Response with updated user data
 */
export const updateUserAvatar = async (avatarUrl) => {
  try {
    const response = await apiRequest('/profile/avatar', 'PUT', { avatar: avatarUrl }, true);
    
    // Save updated user data
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
      message: error.message || 'Failed to update avatar',
      error,
    };
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.first_name - First name
 * @param {string} profileData.last_name - Last name
 * @param {string} profileData.phone - Phone number
 * @param {string} profileData.avatar - Avatar URL (optional)
 * @param {Object} profileData.preferences - User preferences (optional)
 * @returns {Promise<Object>} Response with updated user data
 */
export const updateUserProfile = async (profileData) => {
  try {
    console.log('ProfileAPI: Updating profile with:', profileData);
    const response = await apiRequest('/users/profile', 'PUT', profileData, true);
    console.log('ProfileAPI: Update response:', response);
    
    // Save updated user data
    if (response) {
      await saveUserData(response);
    }
    
    return {
      success: true,
      message: 'Profile updated successfully',
      user: response,
    };
  } catch (error) {
    console.error('ProfileAPI: Update error:', error);
    return {
      success: false,
      message: error.message || error.data?.message || 'Failed to update profile',
      error,
    };
  }
};

/**
 * Change user password
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.current_password - Current password
 * @param {string} passwordData.new_password - New password
 * @returns {Promise<Object>} Response with success status
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiRequest('/users/change-password', 'POST', passwordData, true);
    
    return {
      success: true,
      message: response.message || 'Password changed successfully',
    };
  } catch (error) {
    console.error('Change password API error:', error);
    return {
      success: false,
      message: error?.message || error?.data?.message || 'Failed to change password',
      error,
    };
  }
};
