import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getProducts, getTrendingProducts, getCategories, getPrimaryImage, formatPrice, getMetalTypeDisplay } from '../services/productApi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;
const BANNER_WIDTH = wp('90%');

function HomeScreen({ navigation }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, removeFromCart, cart } = useCart();
  const bannerScrollRef = useRef(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const searchBarAnim = useRef(new Animated.Value(-100)).current;
  const bannerCount = 3;
  const [bestSellers, setBestSellers] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearchIconPress = () => {
    setShowSearchBar(true);
    Animated.spring(searchBarAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleCloseSearch = () => {
    Animated.timing(searchBarAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSearchBar(false));
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY > 150) {
      if (!showSearchBar) {
        setShowSearchBar(true);
        Animated.spring(searchBarAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    } else {
      if (showSearchBar) {
        Animated.timing(searchBarAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setShowSearchBar(false));
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bannerCount;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * (BANNER_WIDTH + 16),
          animated: true,
        });
        return nextIndex;
      });
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array - runs once on mount

  const isInCart = (productId) => {
    return cart.some(item => String(item.id) === String(productId));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesResult = await getCategories({ flat: true, limit: 10 });
      if (categoriesResult.success) {
        // Map categories to include images (using default images for now)
        const categoryImages = {
          'Earrings': require('../../assets/earring.png'),
          'Rings': require('../../assets/ring.png'),
          'Bracelets': require('../../assets/bracelet.png'),
          'Pendants': require('../../assets/pendant.png'),
          'Necklaces': require('../../assets/pendant.png'),
        };
        
        const mappedCategories = categoriesResult.categories.map((cat, index) => ({
          id: cat._id,
          label: cat.name,
          type: cat.slug,
          image: categoryImages[cat.name] || require('../../assets/ring.png'),
        }));
        setCategories(mappedCategories);
      }

      // Fetch trending products for best sellers (7 days, 10 items)
      const trendingResult = await getTrendingProducts(7, 10);
      if (trendingResult.success) {
        setBestSellers(trendingResult.products);
      }

      // Fetch all products for popular section
      const allProductsResult = await getProducts({ limit: 20 });
      if (allProductsResult.success) {
        setPopularProducts(allProductsResult.products.slice(0, 6));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Full Screen Search Bar */}
      {showSearchBar && (
        <Animated.View 
          style={[
            styles.fullScreenSearchHeader,
            {
              transform: [{ translateY: searchBarAnim }],
            }
          ]}
        >
          <TouchableOpacity style={styles.searchBarBack} onPress={handleCloseSearch}>
            <Icon name="arrow-left" size={24} color="#2d2d2d" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.searchBarInput}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="magnify" size={20} color="#8a8a8a" />
            <Text style={styles.searchBarPlaceholder}>Search products...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchCloseBtn} onPress={handleCloseSearch}>
            <Icon name="close" size={24} color="#2d2d2d" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ImageBackground source={require('../../assets/banner.png')} style={styles.headerBg} imageStyle={styles.headerBgImage}>
          <View style={styles.overlay} />
          {!showSearchBar && (
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.profileBtn}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.8}
              >
                <Image 
                  source={require('../../assets/Profile.png')} 
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity 
                style={styles.searchIconBtn} 
                onPress={() => navigation.navigate('Search')}
                activeOpacity={0.8}
              >
                <Icon name="magnify" size={24} color="#2d2d2d" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/soaoaoaoa.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>

        {/* SVG Curved White Card - Center se upar curve for logo */}
        <View style={styles.svgCardContainer}>
          <Svg
            height="190"
            width={width}
            viewBox={`0 0 ${width} 190`}
            style={styles.svgCurve}
          >
            <Path
              d={`M 0 80 Q ${width / 2} -30 ${width} 80 L ${width} 190 L 0 190 Z`}
              fill="#fff"
            />
          </Svg>
        </View>

        <View style={styles.whiteCard}>
          {/* Categories Section - Moved up */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {/* <TouchableOpacity onPress={() => navigation.navigate('AllProductScreen', { 
              title: 'All Products'
            })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity> */}
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((c) => (
              <TouchableOpacity 
                key={c.id} 
                style={styles.categoryItem} 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('CategoryScreen', { category: c.label })}
              >
                <View style={styles.catIconWrap}>
                  <Image 
                    source={c.image} 
                    style={styles.catIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.catLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Best Seller Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Seller</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllProductScreen', { 
              title: 'Best Seller'
            })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#C9A86A" style={{ marginVertical: 20 }} />
          ) : bestSellers.length === 0 ? (
            <Text style={styles.noProductsText}>No products available</Text>
          ) : (
            <FlatList
              data={bestSellers}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 12 }}
              renderItem={({ item }) => {
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
                            // Silently handle - optimistic update already done
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
                          console.log('Plus button clicked for:', item.name);
                          if (isInCart(item.id)) {
                            console.log('Removing from cart...');
                            await removeFromCart(item.id);
                          } else {
                            console.log('Adding to cart...');
                            const success = await addToCart(item);
                            console.log('Add to cart result:', success);
                            if (success) {
                              console.log('Navigating to Cart screen');
                              setTimeout(() => {
                                navigation.navigate('Cart');
                              }, 100);
                            } else {
                              console.log('Failed to add to cart');
                              Alert.alert('Error', 'Failed to add product to cart. Please try again.');
                            }
                          }
                        } catch (error) {
                          console.error('Error in cart button:', error);
                          Alert.alert('Error', 'Something went wrong. Please try again.');
                        }
                      }}
                    >
                      <Icon name={isInCart(item.id) ? "minus" : "plus"} size={20} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          <ScrollView 
            ref={bannerScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            contentContainerStyle={styles.bannerScrollContainer}
          >
            <View style={styles.bannerWrap}>
              <Image source={require('../../assets/scroll_banner1.png')} style={styles.bannerImage} resizeMode="cover" />
            </View>
            <View style={styles.bannerWrap}>
              <Image source={require('../../assets/banner.png')} style={styles.bannerImage} resizeMode="cover" />
            </View>
            <View style={styles.bannerWrap}>
              <Image source={require('../../assets/scroll_banner1.png')} style={styles.bannerImage} resizeMode="cover" />
            </View>
          </ScrollView>

          {/* Popular Products Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllProductScreen', { 
              title: 'Popular Products'
            })}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#C9A86A" style={{ marginVertical: 20 }} />
          ) : popularProducts.length === 0 ? (
            <Text style={styles.noProductsText}>No products available</Text>
          ) : (
            <View style={styles.popularGrid}>
              {popularProducts.map((item) => {
                const imageUrl = getPrimaryImage(item);
                return (
                  <TouchableOpacity 
                    key={item.id}
                    style={styles.popularCard} 
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  >
                    <View style={styles.popularImageContainer}>
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
                            // Silently handle - optimistic update already done
                            console.log('Wishlist toggle:', error.message);
                          }
                        }}
                      >
                        <Icon 
                          name={isInWishlist(item.id) ? "heart" : "heart-outline"} 
                          size={20} 
                          color={isInWishlist(item.id) ? "#4CAF50" : "#4CAF50"} 
                        />
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
                        try {
                          console.log('Plus button clicked for:', item.name);
                          if (isInCart(item.id)) {
                            console.log('Removing from cart...');
                            await removeFromCart(item.id);
                          } else {
                            console.log('Adding to cart...');
                            const success = await addToCart(item);
                            console.log('Add to cart result:', success);
                            if (success) {
                              console.log('Navigating to Cart screen');
                              setTimeout(() => {
                                navigation.navigate('Cart');
                              }, 100);
                            } else {
                              console.log('Failed to add to cart');
                              Alert.alert('Error', 'Failed to add product to cart. Please try again.');
                            }
                          }
                        } catch (error) {
                          console.error('Error in cart button:', error);
                          Alert.alert('Error', 'Something went wrong. Please try again.');
                        }
                      }}
                    >
                      <Icon name={isInCart(item.id) ? "minus" : "plus"} size={16} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f3ef' 
  },
  headerBg: { 
    height: isTablet ? verticalScale(320) : verticalScale(280), 
    justifyContent: 'flex-start', 
    position: 'relative' 
  },
  headerBgImage: { 
    opacity: 1,
    resizeMode: 'cover'
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255, 255, 255, 0.15)' 
  },
  headerTop: { 
    marginTop: Platform.OS === 'ios' ? verticalScale(12) : verticalScale(16), 
    marginHorizontal: scale(20), 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    zIndex: 10,
    paddingBottom: verticalScale(8),
  },
  profileBtn: { 
    width: moderateScale(46), 
    height: moderateScale(46), 
    borderRadius: moderateScale(23), 
    backgroundColor: 'rgba(255,255,255,0.95)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(6),
    overflow: 'hidden',
  },
  profileImage: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
  },
  searchIconBtn: {
    width: moderateScale(46),
    height: moderateScale(46),
    borderRadius: moderateScale(23),
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(6),
  },
  logoContainer: { 
    position: 'absolute', 
    bottom: verticalScale(-20), 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 5 
  },
  logoImage: { 
    width: moderateScale(90), 
    height: moderateScale(90) 
  },
  svgCardContainer: {
    marginTop: verticalScale(-110),
    backgroundColor: 'transparent',
    height: verticalScale(180),
  },
  svgCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  whiteCard: { 
    marginTop: verticalScale(-10), 
    backgroundColor: '#fff', 
    padding: scale(20), 
    paddingTop: verticalScale(10),
    minHeight: verticalScale(500) 
  },
  logoSpacing: { 
    height: verticalScale(10) 
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    marginTop: verticalScale(8),
  },
  sectionTitle: { 
    fontSize: isTablet ? moderateScale(22) : moderateScale(20), 
    fontWeight: '700', 
    color: '#2d2d2d',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: moderateScale(14),
    color: '#C9A86A',
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(4),
  },
  categoryItem: { 
    alignItems: 'center', 
    marginRight: scale(18),
    marginHorizontal: scale(4),
  },
  catIconWrap: { 
    width: moderateScale(75), 
    height: moderateScale(75), 
    borderRadius: moderateScale(37.5), 
    backgroundColor: '#dfcdaf', 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 4,
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    overflow: 'hidden',
  },
  catIcon: { 
    width: moderateScale(58), 
    height: moderateScale(58),
  },
  catLabel: { 
    marginTop: verticalScale(8), 
    fontSize: moderateScale(13), 
    color: '#3a3a3a',
    fontWeight: '600',
  },
  productCard: { 
    width: isTablet ? scale(220) : scale(200), 
    marginRight: scale(14), 
    backgroundColor: '#FFFFFF', 
    borderRadius: moderateScale(20), 
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: moderateScale(8), 
    shadowOffset: { width: 0, height: verticalScale(2) },
    elevation: 3,
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
  productWeight: { 
    fontSize: moderateScale(11.5), 
    color: '#A0A0A0', 
    marginTop: verticalScale(4),
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  productFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: verticalScale(12),
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 168, 106, 0.08)',
  },
  productPrice: { 
    fontWeight: '700', 
    fontSize: moderateScale(18),
    color: '#4CAF50',
    marginBottom: verticalScale(6),
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
  addBtn: { 
    width: moderateScale(38), 
    height: moderateScale(38), 
    borderRadius: moderateScale(19), 
    backgroundColor: '#C9A86A', 
    alignItems: 'center', 
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#C9A86A',
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(3) },
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bannerScrollContainer: {
    paddingTop: verticalScale(24),
    paddingBottom: verticalScale(16),
  },
  bannerWrap: { 
    borderRadius: moderateScale(20), 
    overflow: 'hidden', 
    marginRight: scale(16),
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(12),
    shadowOffset: { width: 0, height: verticalScale(4) },
  },
  bannerImage: { 
    width: BANNER_WIDTH, 
    height: isTablet ? verticalScale(220) : verticalScale(180),
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(30),
  },
  popularCard: {
    width: (width - scale(52)) / 2,
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(2) },
    elevation: 3,
  },
  popularImageContainer: {
    width: '100%',
    height: isTablet ? verticalScale(150) : verticalScale(130),
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  ratingBadge: {
    position: 'absolute',
    left: scale(12),
    top: isTablet ? verticalScale(125) : verticalScale(115),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    gap: scale(4),
    elevation: 2,
  },
  ratingText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  fullScreenSearchHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: scale(12),
    zIndex: 100,
    elevation: 10,
  },
  searchBarBack: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#f8f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f3ef',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    gap: scale(8),
  },
  searchBarPlaceholder: {
    fontSize: moderateScale(14),
    color: '#8a8a8a',
  },
  searchCloseBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#f8f3ef',
    alignItems: 'center',
    justifyContent: 'center',
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

export default HomeScreen;
