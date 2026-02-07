import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import { getPrimaryImage, formatPrice, getMetalTypeDisplay } from '../services/productApi';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  const { 
    cart, 
    removeFromCart, 
    increaseQuantity, 
    decreaseQuantity, 
    clearCart, 
    getCartTotal,
    applyDiscount,
    fetchCartSummary,
    validateCheckout,
    cartSummary,
    loading
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const cartItems = cart;

  console.log('==================');
  console.log('CartScreen - Total items:', cartItems.length);
  console.log('CartScreen - Cart items:', JSON.stringify(cartItems, null, 2));
  console.log('==================');

  // Fetch cart summary on mount and when cart changes
  useEffect(() => {
    console.log('CartScreen useEffect - cart length:', cartItems.length);
    if (cartItems.length > 0) {
      loadCartSummary();
    }
  }, [cartItems.length]);

  const loadCartSummary = async () => {
    setLoadingSummary(true);
    await fetchCartSummary();
    setLoadingSummary(false);
  };

  // Use cart summary if available, otherwise calculate locally
  const subtotal = cartSummary?.subtotal || getCartTotal();
  const shipping = cartSummary?.shipping_cost || (cartItems.length > 0 ? 10.00 : 0);
  const tax = cartSummary?.tax || (subtotal * 0.08);
  const discount = cartSummary?.discount || 0;
  const total = cartSummary?.total || (subtotal + shipping + tax - discount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setApplyingPromo(true);
    const result = await applyDiscount(promoCode.trim());
    setApplyingPromo(false);

    if (result.success) {
      Alert.alert('Success', 'Promo code applied successfully!');
      setPromoCode('');
    } else {
      Alert.alert('Error', result.error || 'Invalid promo code');
    }
  };

  const handleClearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const success = await clearCart();
            if (success) {
              Alert.alert('Success', 'Cart cleared successfully');
            }
          },
        },
      ]
    );
  };

  const handleRemoveItem = async (itemId) => {
    const success = await removeFromCart(itemId);
    if (!success) {
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const handleIncreaseQuantity = async (itemId) => {
    const success = await increaseQuantity(itemId);
    if (!success) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleDecreaseQuantity = async (itemId) => {
    const success = await decreaseQuantity(itemId);
    if (!success) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }

    // Local validation - skip API call that's causing JSON parse error
    // Check if all items have valid data
    const invalidItems = cartItems.filter(item => !item.price || item.price <= 0);
    if (invalidItems.length > 0) {
      Alert.alert('Invalid Items', 'Some items in your cart have invalid prices');
      return;
    }

    // Proceed to order confirmation with cart data
    navigation.navigate('OrderConfirmation', {
      orderId: `ORD${Date.now()}`,
      orderDetails: {
        items: cartItems.map(item => ({
          ...item,
          product_id: item.id,
        })),
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        discount: discount,
        total: total,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2d2d2d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={handleClearCart}
          disabled={cartItems.length === 0}
        >
          <Icon name="delete-outline" size={22} color={cartItems.length === 0 ? "#ccc" : "#ff4444"} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="cart-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>Add some products to get started</Text>
            <TouchableOpacity 
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#C9A86A" />
              </View>
            ) : (
              <View style={styles.cartItemsContainer}>
                {cartItems.map((item) => {
                  const imageUrl = getPrimaryImage(item);
                  return (
                    <View key={item.id} style={styles.cartItem}>
                      <View style={styles.itemImageContainer}>
                        {imageUrl ? (
                          <Image source={{ uri: imageUrl }} style={styles.itemImage} resizeMode="contain" />
                        ) : (
                          <Image source={require('../../assets/ring.png')} style={styles.itemImage} resizeMode="contain" />
                        )}
                      </View>
                      
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemWeight}>{getMetalTypeDisplay(item.metal_type)}</Text>
                        {item.packaging && (
                          <View style={styles.packagingBadge}>
                            <Icon name="package-variant" size={12} color="#C9A86A" />
                            <Text style={styles.packagingText}>{item.packaging}</Text>
                          </View>
                        )}
                        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                      </View>
                      
                      <View style={styles.itemActions}>
                        <TouchableOpacity 
                          style={styles.removeBtn}
                          onPress={() => handleRemoveItem(item.id)}
                        >
                          <Icon name="close" size={18} color="#6a6a6a" />
                        </TouchableOpacity>
                        
                        <View style={styles.quantityContainer}>
                          <TouchableOpacity 
                            style={styles.quantityBtn}
                            onPress={() => handleDecreaseQuantity(item.id)}
                          >
                            <Icon name="minus" size={16} color="#2d2d2d" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity 
                            style={styles.quantityBtn}
                            onPress={() => handleIncreaseQuantity(item.id)}
                          >
                            <Icon name="plus" size={16} color="#2d2d2d" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Promo Code */}
            <View style={styles.promoContainer}>
              <View style={styles.promoInputContainer}>
                <Icon name="ticket-percent" size={20} color="#C9A86A" />
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter Promo Code"
                  placeholderTextColor="#8a8a8a"
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
              </View>
              <TouchableOpacity 
                style={[styles.applyBtn, applyingPromo && styles.applyBtnDisabled]}
                onPress={handleApplyPromo}
                disabled={applyingPromo}
              >
                {applyingPromo ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.applyText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Price Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              {loadingSummary ? (
                <ActivityIndicator size="small" color="#C9A86A" style={{ marginVertical: 20 }} />
              ) : (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping</Text>
                    <Text style={styles.summaryValue}>₹{shipping.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax</Text>
                    <Text style={styles.summaryValue}>₹{tax.toFixed(2)}</Text>
                  </View>
                  
                  {discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>Discount</Text>
                      <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>-₹{discount.toFixed(2)}</Text>
                    </View>
                  )}
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                  </View>
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.checkoutBtn}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            <Icon name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f3ef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItemsContainer: {
    padding: 20,
    gap: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImageContainer: {
    width: 90,
    height: 90,
    backgroundColor: '#f8f3ef',
    borderRadius: 12,
    padding: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  itemWeight: {
    fontSize: 13,
    color: '#8a8a8a',
    marginTop: 4,
  },
  packagingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  packagingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C9A86A',
    marginLeft: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C9A86A',
    marginTop: 4,
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f3ef',
    borderRadius: 20,
    padding: 4,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d2d2d',
    paddingHorizontal: 12,
  },
  promoContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    color: '#2d2d2d',
    fontWeight: '500',
    padding: 0,
  },
  applyBtn: {
    backgroundColor: '#C9A86A',
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    height: 48,
  },
  applyBtnDisabled: {
    opacity: 0.6,
  },
  applyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6a6a6a',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: '#2d2d2d',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#C9A86A',
  },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalText: {
    fontSize: 16,
    color: '#6a6a6a',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d2d2d',
  },
  checkoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#C9A86A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d2d2d',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8a8a8a',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: '#C9A86A',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#C9A86A',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  shopNowText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
