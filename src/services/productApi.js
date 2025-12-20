import { apiRequest } from './api';

/**
 * Normalize product data to ensure consistent ID field
 * @param {Object} product - Product object from API
 * @returns {Object} Normalized product with 'id' field
 */
const normalizeProduct = (product) => {
  if (!product) return product;
  return {
    ...product,
    id: product.id || product._id,
  };
};

/**
 * Normalize array of products
 * @param {Array} products - Array of products
 * @returns {Array} Normalized products
 */
const normalizeProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(normalizeProduct);
};

/**
 * Get products with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Number of items to skip (pagination)
 * @param {number} params.limit - Number of items to return
 * @param {boolean} params.featured_only - Filter for featured products only
 * @param {boolean} params.in_stock_only - Filter for in-stock products only
 * @param {string} params.sort_by - Field to sort by (created_at, price, name, etc.)
 * @param {string} params.sort_order - Sort order (1 for ascending, -1 for descending)
 * @param {string} params.jewelry_type - Filter by jewelry type (ring, bracelet, pendant, earring)
 * @param {string} params.search - Search query
 * @returns {Promise<Object>} Response with products array and metadata
 */
export const getProducts = async (params = {}) => {
  try {
    const {
      skip = 0,
      limit = 20,
      featured_only = false,
      in_stock_only = true,
      sort_by = 'created_at',
      sort_order = '-1',
      jewelry_type = null,
      search = null,
    } = params;

    // Build query string
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      featured_only: featured_only.toString(),
      in_stock_only: in_stock_only.toString(),
      sort_by,
      sort_order,
    });

    if (jewelry_type) queryParams.append('jewelry_type', jewelry_type);
    if (search) queryParams.append('search', search);

    const response = await apiRequest(`/products?${queryParams.toString()}`, 'GET', null, false);
    
    return {
      success: true,
      products: normalizeProducts(response.products || []),
      total: response.total || 0,
      skip: response.skip || 0,
      limit: response.limit || 20,
      filters: response.filters || {},
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch products',
      products: [],
      total: 0,
      error,
    };
  }
};

/**
 * Get featured products
 * @param {number} limit - Number of products to return
 * @returns {Promise<Object>} Response with featured products
 */
export const getFeaturedProducts = async (limit = 10) => {
  return await getProducts({
    limit,
    featured_only: true,
    sort_by: 'created_at',
    sort_order: '-1',
  });
};

/**
 * Get trending products
 * @param {number} days - Number of days to consider for trending (default: 7)
 * @param {number} limit - Number of products to return (default: 10)
 * @returns {Promise<Object>} Response with trending products
 */
export const getTrendingProducts = async (days = 7, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      days: days.toString(),
      limit: limit.toString(),
    });

    const response = await apiRequest(`/products/trending?${queryParams.toString()}`, 'GET', null, false);
    
    return {
      success: true,
      products: normalizeProducts(response.products || response || []),
      total: response.total || response.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch trending products',
      products: [],
      total: 0,
      error,
    };
  }
};

/**
 * Get products by category using category endpoint
 * @param {string} category - Category name (Earring, Ring, Bracelet, Pendant)
 * @param {Object} params - Query parameters
 * @param {number} params.skip - Number of items to skip (pagination)
 * @param {number} params.limit - Number of items to return
 * @param {string} params.sort_by - Field to sort by (created_at, price, name, etc.)
 * @param {string} params.sort_order - Sort order (1 for ascending, -1 for descending)
 * @returns {Promise<Object>} Response with products array and metadata
 */
export const getProductsByCategory = async (category, params = {}) => {
  try {
    const {
      skip = 0,
      limit = 20,
      sort_by = 'created_at',
      sort_order = '-1',
    } = params;

    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order,
    });

    const response = await apiRequest(`/products/categories/${category}/products?${queryParams.toString()}`, 'GET', null, false);
    
    return {
      success: true,
      products: normalizeProducts(response.products || response || []),
      total: response.total || response.length || 0,
      skip: response.skip || 0,
      limit: response.limit || 20,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch products by category',
      products: [],
      total: 0,
      error,
    };
  }
};

/**
 * Get products by category/jewelry type
 * @param {string} jewelryType - Type of jewelry (ring, bracelet, pendant, earring)
 * @param {number} limit - Number of products to return
 * @returns {Promise<Object>} Response with filtered products
 */
export const getProductsByType = async (jewelryType, limit = 20) => {
  return await getProducts({
    limit,
    jewelry_type: jewelryType,
    sort_by: 'created_at',
    sort_order: '-1',
  });
};

/**
 * Search products
 * @param {string} query - Search query
 * @param {number} limit - Number of products to return
 * @returns {Promise<Object>} Response with search results
 */
export const searchProducts = async (query, limit = 20) => {
  return await getProducts({
    limit,
    search: query,
    sort_by: 'created_at',
    sort_order: '-1',
  });
};

/**
 * Get product details by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Response with product details
 */
export const getProductById = async (productId) => {
  try {
    const response = await apiRequest(`/products/${productId}`, 'GET', null, false);
    
    return {
      success: true,
      product: normalizeProduct(response),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch product details',
      error,
    };
  }
};

/**
 * Helper function to get primary image URL from product
 * @param {Object} product - Product object
 * @returns {string|null} Primary image URL or null
 */
export const getPrimaryImage = (product) => {
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return null;
  }
  
  const primaryImage = product.images.find(img => img.is_primary);
  return primaryImage ? primaryImage.url : product.images[0]?.url || null;
};

/**
 * Helper function to format product price
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '₹0.00';
  return `₹${price.toFixed(2)}`;
};

/**
 * Helper function to get metal type display name
 * @param {string} metalType - Metal type code
 * @returns {string} Display name
 */
export const getMetalTypeDisplay = (metalType) => {
  const metalTypes = {
    '18k_gold': '18K Gold',
    'rose_gold': 'Rose Gold',
    'white_gold': 'White Gold',
    'sterling_silver': 'Sterling Silver',
    'platinum': 'Platinum',
  };
  return metalTypes[metalType] || metalType;
};

/**
 * Get user's own products (requires authentication)
 * @param {number} skip - Number of items to skip
 * @param {number} limit - Number of items to return
 * @returns {Promise<Object>} Response with user's products
 */
export const getMyProducts = async (skip = 0, limit = 20) => {
  try {
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await apiRequest(`/products/my-products?${queryParams.toString()}`, 'GET', null, true);
    
    return {
      success: true,
      products: normalizeProducts(response.products || []),
      total: response.total || 0,
      skip: response.skip || 0,
      limit: response.limit || 20,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch your products',
      products: [],
      total: 0,
      error,
    };
  }
};

/**
 * Get all categories
 * @param {Object} params - Query parameters
 * @param {boolean} params.flat - Whether to return flat list (true) or hierarchical (false)
 * @param {number} params.skip - Number of items to skip
 * @param {number} params.limit - Number of items to return
 * @returns {Promise<Object>} Response with categories array and metadata
 */
export const getCategories = async (params = {}) => {
  try {
    const {
      flat = true,
      skip = 0,
      limit = 50,
    } = params;

    const queryParams = new URLSearchParams({
      flat: flat.toString(),
      skip: skip.toString(),
      limit: limit.toString(),
    });

    const response = await apiRequest(`/categories/?${queryParams.toString()}`, 'GET', null, false);
    
    return {
      success: true,
      categories: response.categories || [],
      total: response.total || 0,
      skip: response.skip || 0,
      limit: response.limit || 50,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch categories',
      categories: [],
      total: 0,
      error,
    };
  }
};
