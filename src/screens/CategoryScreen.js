import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getProductsByCategory, getPrimaryImage, formatPrice, getMetalTypeDisplay } from '../services/productApi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const FILTER_DATA = {
  priceRange: [
    { label: 'Under ₹5,000', value: '0-5000' },
    { label: '₹5,000 - ₹10,000', value: '5000-10000' },
    { label: '₹10,000 - ₹25,000', value: '10000-25000' },
    { label: '₹25,000 - ₹50,000', value: '25000-50000' },
    { label: 'Above ₹50,000', value: '50000+' }
  ],
  type: [
    { label: 'Women', value: 'women' },
    { label: 'Men', value: 'men' },
    { label: 'Girls', value: 'girls' },
    { label: 'Boys', value: 'boys' }
  ],
  metal: [
    { label: '18k gold plated', value: 'artificial' },
    { label: 'Gold jewellery', value: 'gold' },
    { label: 'Silver jewellery', value: 'silver' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'Diamond jewellery', value: 'diamond' }
  ],
  gender: [
    { label: 'Unisex', value: 'unisex' },
    { label: 'Women', value: 'women' },
    { label: 'Men', value: 'men' }
  ],
  stones: [
    { label: 'Diamond', value: 'diamond' },
    { label: 'Diamond And Gemstone', value: 'diamond_gemstone' },
    { label: 'Gemstone', value: 'gemstone' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'Emerald', value: 'emerald' },
    { label: 'Pearl', value: 'pearl' }
  ],
  occasion: [
    { label: 'Party', value: 'party' },
    { label: 'Wedding', value: 'wedding' },
    { label: 'Workwear', value: 'workwear' },
    { label: 'Birthday', value: 'birthday' },
    { label: 'Festival', value: 'festival' },
    { label: 'Regular Wear', value: 'regular_wear' }
  ],
  design: [
    { label: 'Classic', value: 'classic' },
    { label: 'Contemporary', value: 'contemporary' },
    { label: 'Fashion', value: 'fashion' },
    { label: 'Traditional', value: 'traditional' },
    { label: 'Geometric Designer', value: 'geometric_designer' },
    { label: 'Fusion And Versatile', value: 'fusion_versatile' }
  ]
};

export default function CategoryScreen({ navigation, route }) {
  const { addToCart, removeFromCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: null,
    type: null,
    metal: null,
    gender: null,
    stones: null,
    occasion: null,
    design: null
  });

  const categoryFromRoute = route.params?.category || 'ALL';

  useEffect(() => {
    fetchProducts();
  }, [categoryFromRoute, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Map route category names to API category names
      const categoryMap = {
        'Rings': 'Ring',
        'Earrings': 'Earring',
        'Bracelet': 'Bracelet',
        'Bangles': 'Bangle',
        'Pendant': 'Pendant',
      };

      const apiCategory = categoryMap[categoryFromRoute] || categoryFromRoute;
      
      // Determine sort parameters
      let sort_by = 'created_at';
      let sort_order = '-1';
      
      if (sortBy === 'price-low') {
        sort_by = 'price';
        sort_order = '1';
      } else if (sortBy === 'price-high') {
        sort_by = 'price';
        sort_order = '-1';
      } else if (sortBy === 'name') {
        sort_by = 'name';
        sort_order = '1';
      }

      const result = await getProductsByCategory(apiCategory, {
        skip: 0,
        limit: 50,
        sort_by,
        sort_order,
      });

      if (result.success) {
        setAllProducts(result.products);
        setTotal(result.total);
      } else {
        Alert.alert('Error', result.message || 'Failed to load products');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPress = () => {
    setShowSearchBar(!showSearchBar);
  };

  const isInCart = (productId) => {
    return cart.some(item => String(item.id) === String(productId));
  };

  // Filter products by search query and filters
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.metal_type && p.metal_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.priceRange) {
      filtered = filtered.filter(p => applyPriceFilter(p, filters.priceRange));
    }
    if (filters.metal) {
      filtered = filtered.filter(p => p.metal_type && p.metal_type.toLowerCase().includes(filters.metal));
    }
    if (filters.gender) {
      filtered = filtered.filter(p => p.gender && p.gender.toLowerCase() === filters.gender);
    }
    if (filters.type) {
      filtered = filtered.filter(p => p.category && p.category.toLowerCase().includes(filters.type));
    }

    // Sort by rating if selected (API handles other sorting)
    if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    }

    return filtered;
  }, [allProducts, searchQuery, sortBy, filters]);

  const clearAllFilters = () => {
    setSortBy('default');
    setSearchQuery('');
    setFilters({
      priceRange: null,
      type: null,
      metal: null,
      gender: null,
      stones: null,
      occasion: null,
      design: null
    });
    fetchProducts();
  };

  const applyFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType] === value ? null : value
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== null).length;
  };

  const applyPriceFilter = (product, priceRange) => {
    if (!priceRange) return true;
    const price = parseFloat(product.price);
    if (priceRange === '50000+') return price > 50000;
    const [min, max] = priceRange.split('-').map(Number);
    return price >= min && price <= max;
  };

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
                await toggleWishlist(item);
              } catch (error) {
                console.log('Wishlist toggle:', error.message);
              }
            }}
          >
            <Icon 
              name={isInWishlist(item.id) ? "heart" : "heart-outline"} 
              size={24} 
              color={isInWishlist(item.id) ? "#4CAF50" : "#4CAF50"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
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
            try {
              if (isInCart(item.id)) {
                await removeFromCart(item.id);
              } else {
                const success = await addToCart(item);
                if (success) {
                  setTimeout(() => {
                    navigation.navigate('Cart');
                  }, 100);
                } else {
                  Alert.alert('Error', 'Failed to add product to cart. Please try again.');
                }
              }
            } catch (error) {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          }}
        >
          <Icon name={isInCart(item.id) ? "minus" : "plus"} size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setShowFilters(false)}
        />
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>FILTERS</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Icon name="close" size={24} color="#2d2d2d" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {Object.entries(FILTER_DATA).map(([filterType, options]) => (
              <View key={filterType} style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters[filterType] === option.value && styles.filterOptionActive
                    ]}
                    onPress={() => applyFilter(filterType, option.value)}
                  >
                    <View style={[
                      styles.filterCheckbox,
                      filters[filterType] === option.value && styles.filterCheckboxActive
                    ]}>
                      {filters[filterType] === option.value && (
                        <Icon name="check" size={12} color="#fff" />
                      )}
                    </View>
                    <Text style={[
                      styles.filterOptionText,
                      filters[filterType] === option.value && styles.filterOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity 
              style={styles.clearFiltersBtn}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersBtn}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={() => setShowSortModal(false)}
        />
        <View style={styles.sortModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sort By Price</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Icon name="close" size={24} color="#2d2d2d" />
            </TouchableOpacity>
          </View>

          <View style={styles.sortContent}>
            {[
              { label: 'Default', value: 'default', icon: 'format-list-bulleted' },
              { label: 'Price: Low to High', value: 'price-low', icon: 'arrow-up' },
              { label: 'Price: High to Low', value: 'price-high', icon: 'arrow-down' },
              { label: 'Highest Rated', value: 'rating', icon: 'star' },
              { label: 'Name A-Z', value: 'name', icon: 'sort-alphabetical-ascending' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.sortOptionActive
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setShowSortModal(false);
                }}
              >
                <View style={styles.sortOptionLeft}>
                  <Icon 
                    name={option.icon} 
                    size={22} 
                    color={sortBy === option.value ? "#C9A86A" : "#2d2d2d"} 
                  />
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {sortBy === option.value && (
                  <Icon name="check-circle" size={22} color="#C9A86A" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2d2d2d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryFromRoute === 'ALL' ? 'All Products' : categoryFromRoute}</Text>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearchPress}>
          <Icon name="magnify" size={24} color="#2d2d2d" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearchBar && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputWrapper}>
            <Icon name="magnify" size={20} color="#8a8a8a" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#8a8a8a"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color="#8a8a8a" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.searchCloseBtn}
            onPress={() => {
              setShowSearchBar(false);
              setSearchQuery('');
            }}
          >
            <Text style={styles.searchCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Grid */}
      <View style={styles.productsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>{filteredProducts.length} Products</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.filterBtn}
              onPress={() => setShowFilters(true)}
            >
              <Icon name="filter-variant" size={20} color="#2d2d2d" />
              <Text style={styles.filterText}>Filter</Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.sortBtn}
              onPress={() => setShowSortModal(true)}
            >
              <Icon name="sort" size={20} color="#2d2d2d" />
              <Text style={styles.sortText}>Sort</Text>
              {sortBy !== 'default' && (
                <View style={styles.filterBadge}>
                  <Icon name="check" size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#C9A86A" style={{ marginVertical: 40 }} />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            columnWrapperStyle={styles.columnWrapper}
            ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="filter-remove" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={clearAllFilters}>
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
          />
        )}
      </View>

      {renderFilterModal()}
      {renderSortModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#f8f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: isTablet ? moderateScale(20) : moderateScale(18),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  searchBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#f8f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryFilterContainer: {
    paddingVertical: verticalScale(16),
    marginBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryFilterList: {
    paddingHorizontal: scale(20),
    gap: scale(12),
  },
  categoryFilterBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
    backgroundColor: '#f8f3ef',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryFilterBtnActive: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },
  categoryFilterText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2d2d2d',
  },
  categoryFilterTextActive: {
    color: '#fff',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(16),
  },
  resultsText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(8),
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
    backgroundColor: '#f8f3ef',
    position: 'relative',
  },
  filterText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2d2d2d',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
    backgroundColor: '#f8f3ef',
  },
  sortText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2d2d2d',
  },
  filterBadge: {
    position: 'absolute',
    right: scale(-4),
    top: verticalScale(-4),
    backgroundColor: '#C9A86A',
    borderRadius: moderateScale(10),
    minWidth: moderateScale(18),
    height: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(4),
  },
  filterBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#fff',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: height * 0.85,
    paddingBottom: verticalScale(20),
  },
  filterContent: {
    maxHeight: height * 0.6,
    paddingHorizontal: scale(20),
  },
  filterSection: {
    marginBottom: verticalScale(24),
  },
  filterSectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: verticalScale(12),
    backgroundColor: '#f8f3ef',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(4),
    gap: scale(12),
  },
  filterOptionActive: {
    backgroundColor: '#f8f3ef',
    borderRadius: moderateScale(8),
  },
  filterCheckbox: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(4),
    borderWidth: 2,
    borderColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCheckboxActive: {
    backgroundColor: '#C9A86A',
  },
  filterOptionText: {
    fontSize: moderateScale(14),
    color: '#2d2d2d',
    flex: 1,
  },
  filterOptionTextActive: {
    fontWeight: '600',
    color: '#C9A86A',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: scale(12),
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  clearFiltersBtn: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFiltersText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#C9A86A',
  },
  applyFiltersBtn: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyFiltersText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    gap: scale(12),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f3ef',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    gap: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#2d2d2d',
    padding: 0,
  },
  searchCloseBtn: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  searchCloseText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#C9A86A',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sortModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingBottom: verticalScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  sortContent: {
    paddingVertical: verticalScale(8),
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionActive: {
    backgroundColor: '#f8f3ef',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  sortOptionText: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    color: '#2d2d2d',
  },
  sortOptionTextActive: {
    fontWeight: '700',
    color: '#C9A86A',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#2d2d2d',
    marginTop: verticalScale(16),
  },
  emptySubText: {
    fontSize: moderateScale(14),
    color: '#8a8a8a',
    marginTop: verticalScale(8),
  },
  resetBtn: {
    marginTop: verticalScale(24),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    backgroundColor: '#C9A86A',
  },
  resetBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#fff',
  },
  productsList: {
    paddingBottom: verticalScale(20),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: verticalScale(16),
  },
  productCard: {
    width: (width - scale(52)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(2) },
    elevation: 3,
    marginBottom: verticalScale(16),
  },
  heartIconWrap: {
    position: 'absolute',
    right: scale(12),
    top: verticalScale(12),
    zIndex: 10,
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    shadowOffset: { width: 0, height: verticalScale(2) },
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    height: isTablet ? verticalScale(160) : verticalScale(140),
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: scale(12),
    paddingRight: scale(50),
  },
  productPrice: {
    fontWeight: '700',
    fontSize: moderateScale(18),
    color: '#4CAF50',
    marginBottom: verticalScale(6),
  },
  productName: {
    fontWeight: '700',
    fontSize: moderateScale(14),
    color: '#2d2d2d',
    marginBottom: verticalScale(2),
    lineHeight: moderateScale(18),
  },
  productDescription: {
    fontSize: moderateScale(11),
    color: '#999',
    marginBottom: verticalScale(4),
    lineHeight: moderateScale(14),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  locationText: {
    fontSize: moderateScale(12),
    color: '#999',
  },
  addToCartBtn: {
    position: 'absolute',
    bottom: scale(10),
    right: scale(10),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9A86A',
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(3) },
    elevation: 5,
  },
  removeFromCartBtn: {
    backgroundColor: '#FF4444',
    shadowColor: '#FF4444',
  },
});
