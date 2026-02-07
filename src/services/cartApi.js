import { getToken } from './api';

const BASE_URL = 'https://arodona.theashirwad.com';

/**
 * Get user's cart
 * @returns {Promise} Cart data
 */
export const getCart = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch cart');
    }

    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    // Silent error for unauthenticated users
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Add item to cart
 * @param {Object} cartItem - Cart item details
 * @param {string} cartItem.product_id - Product ID
 * @param {number} cartItem.quantity - Quantity
 * @param {string} cartItem.size - Size (optional)
 * @param {string} cartItem.variant_id - Variant ID (optional)
 * @param {Object} cartItem.personalization - Personalization options (optional)
 * @param {string} cartItem.gift_message - Gift message (optional)
 * @returns {Promise} Updated cart data
 */
export const addToCart = async (cartItem) => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: cartItem.product_id,
        quantity: cartItem.quantity || 1,
        size: cartItem.size || null,
        variant_id: cartItem.variant_id || null,
        personalization: cartItem.personalization || null,
        gift_message: cartItem.gift_message || null,
      }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to add to cart');
    }

    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update item quantity in cart
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Updated cart data
 */
export const updateCartQuantity = async (productId, quantity) => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/items/${productId}/quantity?quantity=${quantity}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to update quantity');
    }

    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Remove item from cart
 * @param {string} productId - Product ID to remove
 * @returns {Promise} Updated cart data
 */
export const removeFromCart = async (productId) => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to remove from cart');
    }

    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Clear entire cart
 * @returns {Promise} Success status
 */
export const clearCart = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to clear cart');
    }

    return {
      success: true,
      message: data.message || 'Cart cleared successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Apply discount code to cart
 * @param {string} code - Discount code
 * @returns {Promise} Updated cart with discount applied
 */
export const applyDiscount = async (code) => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/apply-discount`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to apply discount');
    }

    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get cart summary
 * @returns {Promise} Cart summary with totals
 */
export const getCartSummary = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/summary`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch cart summary');
    }

    return {
      success: true,
      summary: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Validate cart before checkout
 * @returns {Promise} Validation result
 */
export const validateCheckout = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/validate-checkout`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: '',
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Checkout validation failed');
    }

    return {
      success: true,
      validation: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Merge guest cart with user cart after login
 * @returns {Promise} Merged cart data
 */
export const mergeCart = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${BASE_URL}/cart/merge`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: '',
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    
    if (!response.ok) {
      throw new Error(data.detail || 'Failed to merge cart');
    }

    return {
      success: true,
      cart: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
