import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { addToCart, removeFromCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const recentSearches = [
    'Diamond Ring',
    'Gold Necklace',
    'Pendant',
    'Bracelet',
  ];

  const popularSearches = [
    { id: '1', text: 'Gold Earrings', icon: 'trending-up' },
    { id: '2', text: 'Diamond Ring', icon: 'fire' },
    { id: '3', text: 'Silver Bracelet', icon: 'star' },
    { id: '4', text: 'Pearl Necklace', icon: 'crown' },
  ];

  const filters = ['All', 'Rings', 'Earrings', 'Necklace', 'Bracelet', 'Pendant'];

  const searchResults = [
    { id: 'r1', name: 'Diamond Ring', price: '₹125.00', weight: '7 Carat (Gold)', image: require('../../assets/ring.png'), rating: 4.8 },
    { id: 'r2', name: 'Gold Earring', price: '₹250.00', weight: '5 Carat (Gold)', image: require('../../assets/earring.png'), rating: 4.7 },
    { id: 'r3', name: 'Diamond Pendant', price: '₹125.00', weight: '10 Carat (Platinum)', image: require('../../assets/pendant.png'), rating: 4.9 },
    { id: 'r4', name: 'Gold Bracelet', price: '₹280.00', weight: '8 Carat (Gold)', image: require('../../assets/bracelet.png'), rating: 4.6 },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Add search logic here
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isInCart = (productId) => {
    return cart.some(item => String(item.id) === String(productId));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#2d2d2d" />
        </TouchableOpacity>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#C9A86A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for jewellery..."
            placeholderTextColor="#c4c4c4"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Icon name="close-circle" size={20} color="#c4c4c4" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.recentItem}
                    onPress={() => handleSearch(item)}
                  >
                    <Icon name="clock-outline" size={20} color="#8a8a8a" />
                    <Text style={styles.recentText}>{item}</Text>
                    <Icon name="arrow-top-left" size={18} color="#c4c4c4" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.popularGrid}>
                {popularSearches.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.popularCard}
                    onPress={() => handleSearch(item.text)}
                    activeOpacity={0.8}
                  >
                    <Icon name={item.icon} size={24} color="#C9A86A" />
                    <Text style={styles.popularText}>{item.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    activeFilter === filter && styles.filterChipActive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search Results */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>{searchResults.length} Results found</Text>
              <TouchableOpacity style={styles.sortBtn}>
                <Icon name="tune-variant" size={20} color="#C9A86A" />
              </TouchableOpacity>
            </View>

            <View style={styles.resultsGrid}>
              {searchResults.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.resultCard} 
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
                    <Icon name="star" size={12} color="#FFB800" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.productWeight} numberOfLines={1}>{item.weight}</Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>{item.price}</Text>
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
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f3ef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    gap: 12,
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f3ef',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8D5C4',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2d2d2d',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  clearText: {
    fontSize: 14,
    color: '#C9A86A',
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentText: {
    flex: 1,
    fontSize: 15,
    color: '#2d2d2d',
    fontWeight: '500',
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E8D5C4',
  },
  popularText: {
    fontSize: 14,
    color: '#2d2d2d',
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8D5C4',
  },
  filterChipActive: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d2d2d',
  },
  filterTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  sortBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8D5C4',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultCard: {
    width: (width - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  heartIconWrap: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 16,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  removeBtnActive: {
    backgroundColor: '#FF4444',
    shadowColor: '#FF4444',
  },
});

export default SearchScreen;
