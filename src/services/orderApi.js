import { getToken } from './api';

const BASE_URL = 'https://arodona.theashirwad.com';

/**
 * Create order from cart
 */
export const createOrder = async (orderData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to create order');
    }

    return data;
  } catch (error) {
    console.log('Create Order Error:', error.message);
    throw error;
  }
};

/**
 * Get customer's orders with pagination and filters
 */
export const getOrders = async (params = {}) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams({
      page: params.page || 1,
      per_page: params.per_page || 20,
      ...(params.status && { status: JSON.stringify(params.status) }),
    });

    const response = await fetch(`${BASE_URL}/api/orders/?${queryParams}`, {
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
      throw new Error(data.detail || 'Failed to fetch orders');
    }

    return data;
  } catch (error) {
    console.log('Get Orders Error:', error.message);
    throw error;
  }
};

/**
 * Get order details by ID
 */
export const getOrderDetails = async (orderId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
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
      throw new Error(data.detail || 'Failed to fetch order details');
    }

    return data;
  } catch (error) {
    console.log('Get Order Details Error:', error.message);
    throw error;
  }
};

/**
 * Track order by order number
 */
export const trackOrder = async (orderNumber) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/orders/track/${orderNumber}`, {
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
      throw new Error(data.detail || 'Failed to track order');
    }

    return data;
  } catch (error) {
    console.log('Track Order Error:', error.message);
    throw error;
  }
};

/**
 * Create return request for an order
 */
export const createReturn = async (orderId, returnData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/returns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(returnData),
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to create return request');
    }

    return data;
  } catch (error) {
    console.log('Create Return Error:', error.message);
    throw error;
  }
};

/**
 * Get customer's return requests
 */
export const getReturns = async (params = {}) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams({
      page: params.page || 1,
      per_page: params.per_page || 20,
    });

    const response = await fetch(`${BASE_URL}/api/orders/returns/my-returns?${queryParams}`, {
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
      throw new Error(data.detail || 'Failed to fetch returns');
    }

    return data;
  } catch (error) {
    console.log('Get Returns Error:', error.message);
    throw error;
  }
};
