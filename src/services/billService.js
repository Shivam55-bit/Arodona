import { apiRequest, BASE_URL } from './api';
import { Platform, Linking, Alert } from 'react-native';

/**
 * Bill Service for User App
 * Handles bill fetching and downloading after payment
 * Note: Some APIs may not be available yet on backend
 */

// Get Bill for an Order (Auto-generated after payment)
export const getOrderBill = async (orderId) => {
  try {
    const response = await apiRequest(`/bill/order/${orderId}`, 'GET', null, true);
    if (response && !response.error) {
      return {
        success: true,
        data: response.data || response.bill || response,
      };
    }
    return {
      success: false,
      error: response?.message || 'Bill not available yet',
    };
  } catch (error) {
    // Silently fail - bill API may not exist yet
    console.log('Bill API not available:', error.message);
    return {
      success: false,
      error: 'Bill will be available after payment processing',
    };
  }
};

// Get All User Bills
export const getUserBills = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      page_size: params.page_size || 20,
    }).toString();
    
    const response = await apiRequest(`/bill/user?${queryParams}`, 'GET', null, true);
    if (response.success) {
      return {
        success: true,
        data: response.data || response.bills,
      };
    }
    return {
      success: false,
      error: response.message || 'Failed to fetch bills',
    };
  } catch (error) {
    console.error('Get user bills error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch bills',
    };
  }
};

// Get Bill PDF URL
export const getBillPdfUrl = (billId) => {
  return `https://arodona.theashirwad.com/bill/${billId}/pdf`;
};

// Download/Open Bill PDF
export const downloadBillPdf = async (billId) => {
  try {
    const pdfUrl = getBillPdfUrl(billId);
    
    if (Platform.OS === 'web') {
      window.open(pdfUrl, '_blank');
    } else {
      // Check if we can open the URL
      const canOpen = await Linking.canOpenURL(pdfUrl);
      if (canOpen) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert('Error', 'Unable to open bill PDF');
        return {
          success: false,
          error: 'Unable to open bill PDF',
        };
      }
    }
    
    return {
      success: true,
      message: 'Bill opened successfully',
    };
  } catch (error) {
    console.error('Download bill error:', error);
    return {
      success: false,
      error: 'Failed to open bill',
    };
  }
};

// Generate bill after payment (called by checkout)
export const requestBillGeneration = async (orderData) => {
  try {
    const response = await apiRequest('/bill/generate', 'POST', {
      order_id: orderData.orderId,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail,
      total_amount: orderData.totalAmount,
      items: orderData.items,
      payment_id: orderData.paymentId,
      payment_status: 'PAID',
      delivery_address: orderData.deliveryAddress,
    }, true);
    
    if (response.success) {
      return {
        success: true,
        data: response.data || response.bill,
      };
    }
    return {
      success: false,
      error: response.message || 'Bill generation failed',
    };
  } catch (error) {
    console.error('Bill generation error:', error);
    return {
      success: false,
      error: error.message || 'Bill generation failed',
    };
  }
};

export default {
  getOrderBill,
  getUserBills,
  getBillPdfUrl,
  downloadBillPdf,
  requestBillGeneration,
};
