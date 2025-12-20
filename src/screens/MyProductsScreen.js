import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { scale, verticalScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getMyProducts, getPrimaryImage, formatPrice, getMetalTypeDisplay } from '../services';

const MyProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setSkip(0);
      } else {
        setLoading(true);
      }

      const response = await getMyProducts(isRefresh ? 0 : skip, 20);
      
      if (response && response.products) {
        if (isRefresh) {
          setProducts(response.products);
        } else {
          setProducts(prevProducts => [...prevProducts, ...response.products]);
        }
        setHasMore(response.products.length === 20);
      }
    } catch (error) {
      console.error('Error fetching my products:', error);
      Alert.alert('Error', 'Failed to load your products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const newSkip = skip + 20;
      setSkip(newSkip);
      fetchMyProducts();
    }
  };

  const handleRefresh = () => {
    fetchMyProducts(true);
  };

  const renderProduct = ({ item }) => {
    const imageUrl = getPrimaryImage(item);

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../../assets/ring.png')}
              style={styles.productImage}
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="cube-outline" size={14} color="#666" />
              <Text style={styles.detailText}>{getMetalTypeDisplay(item.metal_type)}</Text>
            </View>
            {(item.jewellery_type || item.jewelry_type) && (
              <View style={styles.detailItem}>
                <Icon name="pricetag-outline" size={14} color="#666" />
                <Text style={styles.detailText}>{item.jewellery_type || item.jewelry_type}</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomRow}>
            <View>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              {item.stock !== undefined && (
                <Text style={[styles.stockText, item.stock > 0 ? styles.inStock : styles.outOfStock]}>
                  {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                </Text>
              )}
            </View>

            {item.rating_avg > 0 && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FFB800" />
                <Text style={styles.ratingText}>{item.rating_avg.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cube-outline" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No Products Yet</Text>
      <Text style={styles.emptyText}>You haven't added any products</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || products.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#C9A86A" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Products</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Products List */}
      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C9A86A" />
          <Text style={styles.loadingText}>Loading your products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#C9A86A']}
              tintColor="#C9A86A"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: verticalScale(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: scale(5),
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: scale(34),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(10),
    fontSize: scale(14),
    color: '#666',
  },
  listContent: {
    padding: wp('4%'),
    flexGrow: 1,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
    padding: scale(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: scale(100),
    height: scale(100),
    backgroundColor: '#F8F8F8',
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#000',
    marginBottom: verticalScale(4),
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(4),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(12),
  },
  detailText: {
    fontSize: scale(12),
    color: '#666',
    marginLeft: scale(4),
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productPrice: {
    fontSize: scale(16),
    fontWeight: '700',
    color: '#C9A86A',
  },
  stockText: {
    fontSize: scale(11),
    marginTop: verticalScale(2),
  },
  inStock: {
    color: '#4CAF50',
  },
  outOfStock: {
    color: '#F44336',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  ratingText: {
    fontSize: scale(12),
    fontWeight: '600',
    color: '#000',
    marginLeft: scale(4),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#333',
    marginTop: verticalScale(16),
  },
  emptyText: {
    fontSize: scale(14),
    color: '#999',
    marginTop: verticalScale(8),
  },
  footerLoader: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
});

export default MyProductsScreen;
