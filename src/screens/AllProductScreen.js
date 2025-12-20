import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  Dimensions,
  Alert, 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');

const AllProductScreen = ({ navigation, route }) => {
  const { title = 'All Products' } = route.params || {};
  const { addToCart, removeFromCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isInCart = (productId) => {
    return cart.some(item => String(item.id) === String(productId));
  };

  // All products data
  const allProducts = [
    { id: '1', name: 'Diamond Ring', price: 125, weight: '7 Carat (Gold)', material: 'Gold', image: require('../../assets/ring1.jpg'), rating: 4.8 },
    { id: '2', name: 'Gold Ring', price: 98, weight: '5 Carat (Gold)', material: 'Gold', image: require('../../assets/ring1.jpg'), rating: 4.6 },
    { id: '3', name: 'Silver Ring', price: 75, weight: '6 Carat (Silver)', material: 'Silver', image: require('../../assets/ring1.jpg'), rating: 4.5 },
    { id: '4', name: 'Platinum Ring', price: 150, weight: '8 Carat (Platinum)', material: 'Platinum', image: require('../../assets/ring1.jpg'), rating: 4.9 },
    { id: '5', name: 'Ruby Ring', price: 110, weight: '6 Carat (Gold)', material: 'Gold', image: require('../../assets/ring1.jpg'), rating: 4.7 },
    { id: '6', name: 'Emerald Ring', price: 135, weight: '7 Carat (Gold)', material: 'Gold', image: require('../../assets/ring1.jpg'), rating: 4.8 },
    { id: '7', name: 'Gold Watch', price: 250, weight: '5 Carat (Gold)', material: 'Gold', image: require('../../assets/watch1.jpg'), rating: 4.7 },
    { id: '8', name: 'Gold Watch', price: 280, weight: '8 Carat (Gold)', material: 'Gold', image: require('../../assets/watch1.jpg'), rating: 4.6 },
    { id: '9', name: 'Luxury Watch', price: 320, weight: '6 Carat (Rose Gold)', material: 'Gold', image: require('../../assets/watch1.jpg'), rating: 4.9 },
    { id: '10', name: 'Diamond Necklace', price: 450, weight: '15 Carat (Gold)', material: 'Gold', image: require('../../assets/ring1.jpg'), rating: 4.9 },
    { id: '11', name: 'Pearl Earrings', price: 180, weight: '4 Carat (Silver)', material: 'Silver', image: require('../../assets/ring1.jpg'), rating: 4.6 },
    { id: '12', name: 'Gold Bracelet', price: 210, weight: '9 Carat (Gold)', material: 'Gold', image: require('../../assets/ring1.jpg'), rating: 4.8 },
  ];

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <TouchableOpacity style={styles.heartIconWrap} activeOpacity={0.7}>
        <Icon name="heart-outline" size={20} color="#C9A86A" />
      </TouchableOpacity>
      
      <View style={styles.productImageContainer}>
        <Image source={item.image} style={styles.productImage} resizeMode="contain" />
      </View>
      
      <View style={styles.ratingBadge}>
        <Icon name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
      
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productWeight} numberOfLines={1}>{item.weight}</Text>
      
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>₹{item.price}.00</Text>
        <TouchableOpacity 
          style={[styles.addBtn, isInCart(item.id) && styles.removeBtnActive]} 
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
          <Icon name={isInCart(item.id) ? "minus" : "plus"} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2d2d2d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Icon name="magnify" size={24} color="#2d2d2d" />
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <View style={styles.productsContainer}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>{allProducts.length} Products</Text>
          <TouchableOpacity style={styles.sortBtn}>
            <Icon name="sort" size={20} color="#2d2d2d" />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={allProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          columnWrapperStyle={styles.columnWrapper}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f3ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8f3ef',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d2d2d',
  },
  productsList: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f5f0eb',
  },
  heartIconWrap: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 8,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    left: 12,
    top: 115,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    elevation: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  productName: {
    marginTop: 4,
    fontWeight: '700',
    fontSize: 14,
    color: '#2b2b2b',
  },
  productWeight: {
    fontSize: 11,
    color: '#8a8a8a',
    marginTop: 4,
    fontWeight: '500',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productPrice: {
    fontWeight: '800',
    fontSize: 15,
    color: '#C9A86A',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#C9A86A',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  removeBtnActive: {
    backgroundColor: '#FF4444',
    shadowColor: '#FF4444',
  },
});

export default AllProductScreen;
