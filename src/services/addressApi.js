import { getToken } from './api';

const BASE_URL = 'https://arodna.gyanpith.com';

/**
 * Get all addresses for the current user
 */
export const getAddresses = async () => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/addresses/`, {
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
      throw new Error(data.detail || 'Failed to fetch addresses');
    }

    return data;
  } catch (error) {
    console.log('Get Addresses Error:', error.message);
    return [];
  }
};

/**
 * Get single address by ID
 */
export const getAddress = async (addressId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/addresses/${addressId}`, {
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
      throw new Error(data.detail || 'Failed to fetch address');
    }

    return data;
  } catch (error) {
    console.log('Get Address Error:', error.message);
    throw error;
  }
};

/**
 * Create new address
 */
export const createAddress = async (addressData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/addresses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to create address');
    }

    return data;
  } catch (error) {
    console.log('Create Address Error:', error.message);
    throw error;
  }
};

/**
 * Update existing address
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });

    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to update address');
    }

    return data;
  } catch (error) {
    console.log('Update Address Error:', error.message);
    throw error;
  }
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 204) {
      return { success: true };
    }

    const text = await response.text();
    if (!text) {
      return { success: true };
    }

    const data = JSON.parse(text);

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to delete address');
    }

    return data;
  } catch (error) {
    console.log('Delete Address Error:', error.message);
    throw error;
  }
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (addressId) => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${BASE_URL}/api/addresses/${addressId}/set-default`, {
      method: 'PUT',
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
      throw new Error(data.detail || 'Failed to set default address');
    }

    return data;
  } catch (error) {
    console.log('Set Default Address Error:', error.message);
    throw error;
  }
};
