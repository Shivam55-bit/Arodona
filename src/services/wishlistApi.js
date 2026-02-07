import { getToken } from './api';

const BASE_URL = 'https://arodona.theashirwad.com/api';

/**
 * Toggle product in wishlist (add/remove)
 * @param {number} productId - Product ID to toggle
 * @returns {Promise<Object>} Response with message and wishlist status
 */
export const toggleWishlist = async (productId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/wishlist/toggle/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('Toggle wishlist response status:', response.status);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }

    if (!response.ok) {
      // 404 might occur when trying to remove item that doesn't exist
      if (response.status === 404) {
        console.log('Item not in wishlist, treating as removed');
        return { message: 'Item removed from wishlist', in_wishlist: false };
      }
      throw new Error(data.detail || data.message || 'Failed to update wishlist');
    }

    return data;
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    throw error;
  }
};

/**
 * Add product to wishlist
 * @param {number} productId - Product ID to add
 * @returns {Promise<Object>} Added wishlist item
 */
export const addToWishlist = async (productId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/wishlist/add/${productId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('Add to wishlist response:', text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to add to wishlist');
    }

    return data;
  } catch (error) {
    console.error('Add to wishlist error:', error);
    throw error;
  }
};

/**
 * Remove product from wishlist
 * @param {number} productId - Product ID to remove
 * @returns {Promise<Object>} Response with message
 */
export const removeFromWishlist = async (productId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/wishlist/remove/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('Remove from wishlist response:', text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to remove from wishlist');
    }

    return data;
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    throw error;
  }
};

/**
 * Get all wishlist items
 * @returns {Promise<Array>} Array of wishlist items with product details
 */
export const getWishlist = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/wishlist`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('Get wishlist response status:', response.status);

    if (!response.ok) {
      // 404 means empty wishlist, not an error
      if (response.status === 404) {
        console.log('Wishlist is empty');
        return [];
      }
      console.error('Failed to fetch wishlist, status:', response.status);
      return [];
    }

    let data;
    try {
      data = text ? JSON.parse(text) : [];
    } catch (e) {
      console.error('Failed to parse wishlist response:', e);
      return [];
    }

    // Handle different response formats
    const wishlistItems = Array.isArray(data) ? data : (data.items || data.wishlist || []);
    return wishlistItems;
  } catch (error) {
    console.error('Get wishlist error:', error);
    return [];
  }
};

/**
 * Check if product is in wishlist
 * @param {number} productId - Product ID to check
 * @returns {Promise<boolean>} True if product is in wishlist
 */
export const isInWishlist = async (productId) => {
  try {
    const token = await getToken();
    if (!token) {
      return false;
    }

    const response = await fetch(`${BASE_URL}/wishlist/check/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('Check wishlist response:', text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      return false;
    }

    if (!response.ok) {
      return false;
    }

    // Handle different response formats
    return data.is_in_wishlist || data.in_wishlist || false;
  } catch (error) {
    console.error('Check wishlist error:', error);
    return false;
  }
};

/**
 * Clear entire wishlist
 * @returns {Promise<Object>} Response with message
 */
export const clearWishlist = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/wishlist/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await response.text();
    console.log('Clear wishlist response:', text);

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Failed to clear wishlist');
    }

    return data;
  } catch (error) {
    console.error('Clear wishlist error:', error);
    throw error;
  }
};
