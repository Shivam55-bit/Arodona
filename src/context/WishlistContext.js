import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  getWishlist,
  toggleWishlist as toggleWishlistAPI,
  removeFromWishlist as removeFromWishlistAPI,
  clearWishlist as clearWishlistAPI,
  isInWishlist as checkIsInWishlist,
} from '../services/wishlistApi';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await getWishlist();
      console.log('Wishlist fetched:', items);
      
      // Map API response to match expected format
      const formattedItems = items.map(item => ({
        id: item.product?.id || item.product_id,
        name: item.product?.name || item.name,
        price: item.product?.price || item.price,
        image: item.product?.image || item.image,
        brand: item.product?.brand || item.brand,
        rating: item.product?.rating || item.rating,
        ...item.product, // Include all product fields
      }));
      
      setWishlist(formattedItems);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setError(err.message);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    try {
      setError(null);
      const productId = product.id || product.product_id;
      
      // Optimistic update
      const isCurrentlyInWishlist = wishlist.some(item => item.id === productId);
      if (isCurrentlyInWishlist) {
        setWishlist(prev => prev.filter(item => item.id !== productId));
      } else {
        setWishlist(prev => [...prev, product]);
      }

      // API call
      const response = await toggleWishlistAPI(productId);
      console.log('Toggle wishlist response:', response);
      
      // Don't refresh immediately - keep optimistic update
      // fetchWishlist will be called on screen focus/mount
      
      return response;
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      // Don't set error for "Not Found" - it just means item wasn't in wishlist
      if (!err.message?.includes('Not Found')) {
        setError(err.message);
      }
      // Only revert on actual error, not on "Not Found"
      if (!err.message?.includes('Not Found')) {
        await fetchWishlist();
      }
      throw err;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const removeFromWishlist = async (productId) => {
    try {
      setError(null);
      
      // Optimistic update
      const previousWishlist = [...wishlist];
      setWishlist(prev => prev.filter(item => item.id !== productId));

      // API call
      await removeFromWishlistAPI(productId);
      console.log('Removed from wishlist:', productId);
      
      return true;
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError(err.message);
      // Revert on error
      await fetchWishlist();
      throw err;
    }
  };

  const clearWishlist = async () => {
    try {
      setError(null);
      
      // Optimistic update
      const previousWishlist = [...wishlist];
      setWishlist([]);

      // API call
      await clearWishlistAPI();
      console.log('Wishlist cleared');
      
      return true;
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
      setError(err.message);
      // Revert on error
      await fetchWishlist();
      throw err;
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      loading,
      error,
      toggleWishlist, 
      isInWishlist, 
      removeFromWishlist,
      clearWishlist,
      fetchWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
