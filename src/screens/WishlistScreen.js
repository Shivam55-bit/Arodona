import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Path, Svg } from 'react-native-svg';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getPrimaryImage, formatPrice, getMetalTypeDisplay } from '../services/productApi';

const { width } = Dimensions.get('window');

const WishlistScreen = ({ navigation }) => {
  const { wishlist, removeFromWishlist, toggleWishlist, loading, error, fetchWishlist } = useWishlist();
  const { addToCart, removeFromCart, cart } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter options
  const filters = [
    { id: 'all', label: 'All', icon: 'view-grid' },
    { id: 'rings', label: 'Rings', icon: 'ring' },
    { id: 'necklaces', label: 'Necklaces', icon: 'necklace' },
    { id: 'earrings', label: 'Earrings', icon: 'earring' },
    { id: 'bracelets', label: 'Bracelets', icon: 'arm-flex' },
  ];
  
  // Filter wishlist items based on selected filter using useMemo
  const wishlistItems = useMemo(() => {
    if (selectedFilter === 'all') {
      return wishlist;
    }
    return wishlist.filter(item => {
      const category = item.category?.toLowerCase() || '';
      const name = item.name?.toLowerCase() || '';
      return category.includes(selectedFilter) || name.includes(selectedFilter);
    });
  }, [wishlist, selectedFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  };

  const isInCart = (productId) => {
    return cart.some(item => String(item.id) === String(productId));
  };

  const handleFilterSelect = useCallback((filterId) => {
    setSelectedFilter(filterId);
    setShowFilterModal(false);
  }, []);

  const renderProduct = ({ item }) => {
    const imageUrl = getPrimaryImage(item);
    
    return (
      <TouchableOpacity 
        style={styles.productCard} 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.productImageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.productImage} 
              resizeMode="cover" 
            />
          ) : (
            <Image 
              source={require('../../assets/ring.png')} 
              style={styles.productImage} 
              resizeMode="cover" 
            />
          )}
          <TouchableOpacity 
            style={styles.heartIconWrap} 
            activeOpacity={0.7}
            onPress={async (e) => {
              e.stopPropagation();
              try {
                await removeFromWishlist(item.id);
              } catch (error) {
                console.log('Remove from wishlist error:', error.message);
              }
            }}
          >
            <Icon name="heart" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={1}>
            {item.description || getMetalTypeDisplay(item.metal_type)}
          </Text>
          <View style={styles.locationRow}>
            <Icon name="map-marker-outline" size={14} color="#999" />
            <Text style={styles.locationText}>{item.location || 'India'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.addToCartBtn, isInCart(item.id) && styles.removeFromCartBtn]} 
          activeOpacity={0.8}
          onPress={async (e) => {
            e.stopPropagation();
            if (isInCart(item.id)) {
              await removeFromCart(item.id);
            } else {
              await addToCart(item);
              Alert.alert('Success', `${item.name} added to cart!`, [
                { text: 'OK' },
                { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
              ]);
            }
          }}
        >
          <Icon name={isInCart(item.id) ? "minus" : "plus"} size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C9A86A" />
      
      {/* Curved Header */}
      <View style={styles.headerContainer}>
        <Svg height="100" width={width} style={styles.headerSvg}>
          <Path
            d={`M0,0 L${width},0 L${width},70 Q${width / 2},90 0,70 Z`}
            fill="#C9A86A"
          />
        </Svg>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My Wishlist</Text>
            <Text style={styles.headerSubtitle}>{wishlistItems.length} Items</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterIconBtn}
            onPress={() => setShowFilterModal(!showFilterModal)}
          >
            <Icon name="filter-variant" size={22} color="#fff" />
            {selectedFilter !== 'all' && (
              <View style={styles.filterBadge}>
                <View style={styles.filterDot} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.filterModalContent}>
            <Text style={styles.filterModalTitle}>Filter</Text>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterOption,
                  selectedFilter === filter.id && styles.filterOptionSelected
                ]}
                onPress={() => handleFilterSelect(filter.id)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === filter.id && styles.filterOptionTextSelected
                ]}>
                  {filter.label}
                </Text>
                {selectedFilter === filter.id && (
                  <Icon name="check-circle" size={20} color="#C9A86A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Loading State */}
      {loading && wishlist.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9A86A" />
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#C9A86A']}
            />
          }
        >
          {/* Products Grid */}
          {wishlistItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="heart-outline" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySubtitle}>Add items you love to your wishlist</Text>
            <TouchableOpacity 
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
          ) : (
            <View style={styles.popularGrid}>
              {wishlistItems.map((item) => (
                <View key={item.id}>
                  {renderProduct({ item })}
                </View>
              ))}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f3ef',
  },
  headerContainer: {
    position: 'relative',
    height: 100,
  },
  headerSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8a8a8a',
  },
  filterIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: '#f8f3ef',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: '#C9A86A',
    fontWeight: '600',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 30,
  },
  productCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  heartIconWrap: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  productInfo: {
    padding: 12,
    paddingRight: 50,
  },
  productPrice: {
    fontWeight: '700',
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 6,
  },
  productName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#2d2d2d',
    marginBottom: 2,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    lineHeight: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
  },
  addToCartBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9A86A',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  removeFromCartBtn: {
    backgroundColor: '#FF4444',
    shadowColor: '#FF4444',
  },
  bottomPadding: {
    height: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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

export default WishlistScreen;
