import React, { createContext, useState, useContext, useEffect } from 'react';
import * as cartApi from '../services/cartApi';
import { getToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

const CART_STORAGE_KEY = 'guest_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState(null);

  // Load cart from storage on mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      saveCartToStorage(cart);
    }
  }, [cart]);

  const loadCartFromStorage = async () => {
    try {
      const token = await getToken();
      if (token) {
        // User is logged in, fetch from API
        await fetchCart();
      } else {
        // Guest user, load from AsyncStorage
        const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('Loaded cart from storage:', parsedCart);
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.log('Error loading cart:', error);
    }
  };

  const saveCartToStorage = async (cartData) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      console.log('Cart saved to storage:', cartData.length, 'items');
    } catch (error) {
      console.log('Error saving cart:', error);
    }
  };

  const fetchCart = async () => {
    const token = await getToken();
    if (!token) {
      // User not logged in, skip API call
      return;
    }

    setLoading(true);
    const result = await cartApi.getCart();
    if (result.success && result.cart) {
      // Transform API cart to local cart format
      const transformedCart = transformApiCart(result.cart);
      setCart(transformedCart);
    } else if (result.error && result.error !== 'Not authenticated') {
      // Only log errors other than authentication
      console.log('Cart fetch error:', result.error);
    }
    setLoading(false);
  };

  const fetchCartSummary = async () => {
    const result = await cartApi.getCartSummary();
    if (result.success) {
      setCartSummary(result.summary);
      return result.summary;
    }
    return null;
  };

  const transformApiCart = (apiCart) => {
    if (!apiCart || !apiCart.items) return [];
    
    return apiCart.items.map(item => ({
      id: item.product_id || item.product?._id,
      name: item.product?.name,
      price: item.product?.price || item.price,
      quantity: item.quantity,
      images: item.product?.images,
      metal_type: item.product?.metal_type,
      description: item.product?.description,
      size: item.size,
      variant_id: item.variant_id,
      personalization: item.personalization,
      gift_message: item.gift_message,
    }));
  };

  const addToCart = async (product, options = {}) => {
    try {
      // Ensure product has an ID
      const productId = String(product.id || product._id || Date.now());
      
      console.log('=== ADD TO CART ===');
      console.log('Product ID:', productId);
      console.log('Product Name:', product.name);
      console.log('Current cart length:', cart.length);
      
      // Always use guest mode (local storage) for now
      console.log('Guest mode - adding to local cart');
      
      const existingItem = cart.find(item => String(item.id) === String(productId));
      
      let newCart;
      if (existingItem) {
        console.log('Item exists, increasing quantity from', existingItem.quantity, 'to', existingItem.quantity + 1);
        newCart = cart.map(item =>
          String(item.id) === String(productId)
            ? { ...item, quantity: item.quantity + (options.quantity || 1) }
            : item
        );
      } else {
        console.log('Adding NEW item to cart');
        const newItem = { 
          ...product,
          id: productId,
          quantity: options.quantity || 1,
          // Ensure all required fields are present
          name: product.name,
          price: product.price,
          images: product.images || [],
          metal_type: product.metal_type,
          description: product.description,
        };
        newCart = [...cart, newItem];
        console.log('New item added:', newItem.name);
      }
      
      console.log('Setting cart with', newCart.length, 'items');
      setCart(newCart);
      await saveCartToStorage(newCart);
      console.log('Cart saved to storage successfully');
      console.log('===================');
      return true;
    } catch (error) {
      console.error('Error in addToCart:', error);
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      console.log('Removing from cart:', productId);
      // Always use guest mode (local storage)
      setCart(prev => prev.filter(item => String(item.id) !== String(productId)));
      console.log('Item removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      console.log('Updating quantity for product:', productId, 'to:', quantity);
      
      // Always use guest mode (local storage)
      if (quantity <= 0) {
        console.log('Quantity <= 0, removing item');
        return await removeFromCart(productId);
      }
      
      setCart(prev =>
        prev.map(item =>
          String(item.id) === String(productId) ? { ...item, quantity } : item
        )
      );
      console.log('Quantity updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const increaseQuantity = async (productId) => {
    try {
      const item = cart.find(i => String(i.id) === String(productId));
      if (item) {
        return await updateQuantity(productId, item.quantity + 1);
      }
      return false;
    } catch (error) {
      console.error('Error increasing quantity:', error);
      return false;
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      const item = cart.find(i => String(i.id) === String(productId));
      if (item && item.quantity > 1) {
        return await updateQuantity(productId, item.quantity - 1);
      } else if (item && item.quantity === 1) {
        return await removeFromCart(productId);
      }
      return false;
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      console.log('Clearing cart');
      // Always use guest mode (local storage)
      setCart([]);
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      console.log('Cart cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const applyDiscount = async (code) => {
    const result = await cartApi.applyDiscount(code);
    if (result.success) {
      const transformedCart = transformApiCart(result.cart);
      setCart(transformedCart);
      await fetchCartSummary();
    }
    return result;
  };

  const validateCheckout = async () => {
    return await cartApi.validateCheckout();
  };

  const mergeCart = async () => {
    const result = await cartApi.mergeCart();
    if (result.success) {
      const transformedCart = transformApiCart(result.cart);
      setCart(transformedCart);
    }
    return result;
  };

  const getCartTotal = () => {
    if (cartSummary && cartSummary.subtotal) {
      return cartSummary.subtotal;
    }
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading,
      cartSummary,
      addToCart, 
      removeFromCart, 
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      applyDiscount,
      validateCheckout,
      mergeCart,
      fetchCart,
      fetchCartSummary,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
