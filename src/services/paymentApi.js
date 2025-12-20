import { getToken } from './api';

const BASE_URL = 'https://arodna.gyanpith.com';

/**
 * Initiate payment for an order
 */
export const initiatePayment = async (paymentData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to initiate payment');
    }

    return data;
  } catch (error) {
    console.log('Initiate Payment Error:', error.message);
    throw error;
  }
};

/**
 * Get payment details by ID
 */
export const getPayment = async (paymentId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch payment');
    }

    return data;
  } catch (error) {
    console.log('Get Payment Error:', error.message);
    throw error;
  }
};

/**
 * Save payment method for future use
 */
export const savePaymentMethod = async (methodData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/payments/methods/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(methodData),
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to save payment method');
    }

    return data;
  } catch (error) {
    console.log('Save Payment Method Error:', error.message);
    throw error;
  }
};

/**
 * Get saved payment methods
 */
export const getPaymentMethods = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/payments/methods`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!text) {
      return [];
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch payment methods');
    }

    return data;
  } catch (error) {
    console.log('Get Payment Methods Error:', error.message);
    return [];
  }
};

/**
 * Delete saved payment method
 */
export const deletePaymentMethod = async (methodId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/payments/methods/${methodId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to delete payment method');
    }

    return data;
  } catch (error) {
    console.log('Delete Payment Method Error:', error.message);
    throw error;
  }
};

/**
 * Get payment analytics (admin/vendor only)
 */
export const getPaymentAnalytics = async (params = {}) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append('start_date', params.start_date);
    if (params.end_date) queryParams.append('end_date', params.end_date);
    if (params.vendor_id) queryParams.append('vendor_id', params.vendor_id);

    const response = await fetch(`${BASE_URL}/payments/analytics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to fetch payment analytics');
    }

    return data;
  } catch (error) {
    console.log('Get Payment Analytics Error:', error.message);
    throw error;
  }
};
