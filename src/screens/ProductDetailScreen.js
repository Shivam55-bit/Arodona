// Enhanced ProductDetailScreen with comprehensive details (React Native)
// Full updated version with all product details

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
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
// import DocumentPicker from 'react-native-document-picker'; // Commented out to prevent errors
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductById, formatPrice, getMetalTypeDisplay } from '../services/productApi';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [product, setProduct] = useState(route.params?.product || null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewImages, setReviewImages] = useState([]);

  const { addToCart, removeFromCart, cart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const isInWishlist = wishlist.some(item => String(item.id) === String(product?.id));

  useEffect(() => {
    if (route.params?.productId && !product) {
      fetchProductDetails(route.params.productId);
    }
    if (product?.available_sizes?.length > 0) {
      setSelectedSize(product.available_sizes[0]);
    }
  }, [route.params]);

  const fetchProductDetails = async (productId) => {
    setLoading(true);
    try {
      const response = await getProductById(productId);
      if (response.success) {
        setProduct(response.product);
        if (response.product.available_sizes?.length > 0) {
          setSelectedSize(response.product.available_sizes[0]);
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to load product details');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (id) => cart.some(item => String(item.id) === String(id));

  // Product-specific reviews data (in real app, this would come from API based on product ID)
  const productReviews = [
    {
      id: 1,
      userName: 'Priya Sharma',
      rating: 5,
      verified: true,
      date: '2 weeks ago',
      title: 'Beautiful jewellery piece!',
      comment: `Love this ${product?.name || 'jewellery'}! The craftsmanship is excellent and it looks exactly like in the pictures. Perfect for special occasions.`,
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
        'https://images.unsplash.com/photo-1506629905607-21e1dcfb9f5f?w=300',
      ],
      helpful: 15,
      notHelpful: 2
    },
    {
      id: 2,
      userName: 'Anjali Patel',
      rating: 4,
      verified: true,
      date: '1 month ago',
      title: 'Good quality',
      comment: `The ${getMetalTypeDisplay(product?.metal_type)} finish is really nice. Packaging was excellent and delivery was on time. Worth the price!`,
      images: [
        'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300'
      ],
      helpful: 12,
      notHelpful: 1
    },
    {
      id: 3,
      userName: 'Kavita Singh',
      rating: 5,
      verified: true,
      date: '3 weeks ago',
      title: 'Excellent purchase',
      comment: `Absolutely beautiful! The ${product?.jewellery_type || 'design'} is stunning and the quality is top-notch. My family loved it. Highly recommended!`,
      images: [],
      helpful: 18,
      notHelpful: 0
    },
    {
      id: 4,
      userName: 'Meera Gupta',
      rating: 4,
      verified: false,
      date: '5 days ago',
      title: 'Nice design',
      comment: `Good product overall. The weight feels right and the finish is smooth. Will definitely buy more from this collection.`,
      images: [
        'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=300'
      ],
      helpful: 8,
      notHelpful: 1
    }
  ];

  // Calculate product-specific rating statistics
  const averageRating = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
  const totalReviews = productReviews.length;
  const verifiedReviewsCount = productReviews.filter(r => r.verified).length;

  const submitReview = () => {
    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please provide a rating before submitting.');
      return;
    }
    
    // In real app, submit to API
    Alert.alert('Review Submitted', 'Thank you for your feedback!');
    setShowReviewModal(false);
    setUserRating(0);
    setUserReview('');
    setReviewImages([]);
  };

  const selectImageSource = () => {
    Alert.alert(
      'Add Photo to Review',
      'Choose how you want to add a photo',
      [
        {
          text: '📱 From Gallery',
          onPress: () => openPhotoGallery(),
        },
        {
          text: '📷 Sample Photo',
          onPress: () => addSamplePhoto(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Simulate opening phone gallery with multiple photo options
  const openPhotoGallery = () => {
    const galleryPhotos = [
      {
        name: 'Product Photo 1',
        uri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&auto=format'
      },
      {
        name: 'Product Photo 2', 
        uri: 'https://images.unsplash.com/photo-1506629905607-21e1dcfb9f5f?w=400&h=400&fit=crop&auto=format'
      },
      {
        name: 'Jewellery Close-up',
        uri: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&auto=format'
      },
      {
        name: 'Ring Detail',
        uri: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop&auto=format'
      },
      {
        name: 'My Product Photo',
        uri: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&h=400&fit=crop&auto=format'
      },
      {
        name: 'Unboxing Photo',
        uri: 'https://images.unsplash.com/photo-1588444640107-6dc644dd4227?w=400&h=400&fit=crop&auto=format'
      }
    ];

    const photoOptions = galleryPhotos.map((photo, index) => ({
      text: photo.name,
      onPress: () => {
        setReviewImages([...reviewImages, photo.uri]);
        Alert.alert('✅ Photo Added!', `"${photo.name}" has been added to your review!`);
      }
    }));

    photoOptions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert(
      '📱 Select from Gallery',
      'Choose a photo from your gallery:',
      photoOptions
    );
  };

  // Add a random sample photo
  const addSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506629905607-21e1dcfb9f5f?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop',
    ];
    
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setReviewImages([...reviewImages, randomPhoto]);
    Alert.alert('📸 Sample Photo Added!', 'A sample photo has been added to demonstrate the feature!');
  };

  const openCamera = () => {
    addSamplePhoto();
  };

  const openImageLibrary = () => {
    openPhotoGallery();
  };

  const renderStarRating = (rating, size = 16, onPress = null) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Icon
              name={star <= rating ? "star" : "star-outline"}
              size={size}
              color="#FFD700"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const productImages = product?.images || [];
  const currentImage = productImages[currentImageIndex];

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#C9A86A" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingCenter}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* ================= HEADER ================= */}
      <LinearGradient
        colors={['#ffffff', '#f8f8f8']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#2d2d2d" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Product Details</Text>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn}>
              <Icon name="share-variant" size={22} color="#2d2d2d" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= IMAGE AREA ================= */}
        <LinearGradient
          colors={['#faf8f5', '#f5f2ee', '#f0ebe6']}
          style={styles.imageArea}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImage?.url }}
              style={styles.mainImage}
              resizeMode="contain"
            />
            
            {/* Image Badge */}
            <View style={styles.imageBadge}>
              <Icon name="image" size={16} color="#C9A86A" />
              <Text style={styles.imageBadgeText}>{currentImageIndex + 1}/{productImages.length}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.wishBtn, isInWishlist && styles.wishBtnActive]} 
            onPress={() => toggleWishlist(product.id)}
            activeOpacity={0.8}
          >
            <Icon
              name={isInWishlist ? "heart" : "heart-outline"}
              size={26}
              color={isInWishlist ? '#fff' : '#C9A86A'}
            />
          </TouchableOpacity>
        </LinearGradient>

        {/* Thumbnails */}
        <View style={styles.thumbRow}>
          {productImages.map((img, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.thumbBox, idx === currentImageIndex && styles.thumbActive]}
              onPress={() => setCurrentImageIndex(idx)}
            >
              <Image source={{ uri: img.url }} style={styles.thumbImg} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= PRODUCT INFO ================= */}
        <View style={styles.infoCard}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            <View style={styles.productTitleSection}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productSub}>{product.jewellery_type || product.jewelry_type}</Text>
              
              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <View style={styles.ratingStars}>
                  {[1,2,3,4,5].map(star => (
                    <Icon 
                      key={star}
                      name={star <= (product.rating_avg || 4) ? "star" : "star-outline"} 
                      size={16} 
                      color="#FFD700" 
                    />
                  ))}
                </View>
                <Text style={styles.ratingText}>({product.rating_count || 127} reviews)</Text>
              </View>
            </View>
            
            {/* Stock Badge */}
            <View style={[styles.stockBadge, product.in_stock ? styles.inStock : styles.outOfStock]}>
              <Icon 
                name={product.in_stock ? "check-circle" : "close-circle"} 
                size={16} 
                color={product.in_stock ? '#4CAF50' : '#FF4444'} 
              />
              <Text style={[styles.stockText, { color: product.in_stock ? '#4CAF50' : '#FF4444' }]}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <LinearGradient
            colors={['#fff7f0', '#fff']}
            style={styles.priceCard}
          >
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.original_price && product.original_price > product.price && (
              <View style={styles.discountSection}>
                <Text style={styles.originalPrice}>{formatPrice(product.original_price)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </Text>
                </View>
              </View>
            )}
          </LinearGradient>

          {product.description ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Icon name="text-box" size={22} color="#C9A86A" />
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <Text style={styles.sectionText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Additional Specs based on reference screenshot */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Icon name="information" size={22} color="#C9A86A" />
              <Text style={styles.sectionTitle}>Product Details</Text>
            </View>

            {product.product_code && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Product Code</Text>
                <Text style={styles.specValue}>{product.product_code}</Text>
              </View>
            )}

            {product.height && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Height</Text>
                <Text style={styles.specValue}>{product.height} mm</Text>
              </View>
            )}

            {product.width && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Width</Text>
                <Text style={styles.specValue}>{product.width} mm</Text>
              </View>
            )}

            {product.weight && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Weight</Text>
                <Text style={styles.specValue}>{product.weight} gram</Text>
              </View>
            )}
          </View>

          {/* Solitaire Details */}
          {(product.solitaire_weight || product.solitaire_count || product.solitaire_shape || product.solitaire_clarity || product.solitaire_color) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Solitaire Details</Text>

              {product.solitaire_weight && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Total Weight</Text>
                  <Text style={styles.specValue}>{product.solitaire_weight} Ct</Text>
                </View>
              )}

              {product.solitaire_count && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Total No. of Solitaires</Text>
                  <Text style={styles.specValue}>{product.solitaire_count}</Text>
                </View>
              )}

              {product.solitaire_shape && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Shape</Text>
                  <Text style={styles.specValue}>{product.solitaire_shape}</Text>
                </View>
              )}

              {product.solitaire_clarity && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Clarity</Text>
                  <Text style={styles.specValue}>{product.solitaire_clarity}</Text>
                </View>
              )}

              {product.solitaire_color && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Color</Text>
                  <Text style={styles.specValue}>{product.solitaire_color}</Text>
                </View>
              )}

              {product.solitaire_cut && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Cut</Text>
                  <Text style={styles.specValue}>{product.solitaire_cut}</Text>
                </View>
              )}

              {product.solitaire_polish && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Polish</Text>
                  <Text style={styles.specValue}>{product.solitaire_polish}</Text>
                </View>
              )}

              {product.solitaire_symmetry && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Symmetry</Text>
                  <Text style={styles.specValue}>{product.solitaire_symmetry}</Text>
                </View>
              )}

              {product.solitaire_fluorescence && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Fluorescence</Text>
                  <Text style={styles.specValue}>{product.solitaire_fluorescence}</Text>
                </View>
              )}
            </View>
          )}

          {/* Metal Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metal Details</Text>

            {product.metal_type && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Type</Text>
                <Text style={styles.specValue}>{getMetalTypeDisplay(product.metal_type)}</Text>
              </View>
            )}

            {product.metal_weight && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Weight</Text>
                <Text style={styles.specValue}>{product.metal_weight} gram</Text>
              </View>
            )}

            {product.purity && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Purity</Text>
                <Text style={styles.specValue}>{product.purity}</Text>
              </View>
            )}

            {product.metal_color && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Metal Color</Text>
                <Text style={styles.specValue}>{product.metal_color}</Text>
              </View>
            )}
          </View>

          {/* Diamond Details */}
          {(product.diamond_count || product.diamond_weight || product.diamond_clarity || product.diamond_color) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diamond Details</Text>

              {/* Diamond details in table format for multiple diamonds */}
              {product.diamonds && Array.isArray(product.diamonds) && product.diamonds.length > 0 ? (
                <>
                  <View style={styles.diamondTableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Count</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Shape</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Size</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Setting</Text>
                  </View>
                  {product.diamonds.map((diamond, index) => (
                    <View key={index} style={styles.diamondTableRow}>
                      <Text style={[styles.tableCellText, { flex: 1 }]}>{diamond.count}</Text>
                      <Text style={[styles.tableCellText, { flex: 1 }]}>{diamond.shape}</Text>
                      <Text style={[styles.tableCellText, { flex: 1 }]}>{diamond.size}</Text>
                      <Text style={[styles.tableCellText, { flex: 1 }]}>{diamond.setting}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <>
                  {product.diamond_count && (
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Count</Text>
                      <Text style={styles.specValue}>{product.diamond_count}</Text>
                    </View>
                  )}

                  {product.diamond_shape && (
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Shape</Text>
                      <Text style={styles.specValue}>{product.diamond_shape}</Text>
                    </View>
                  )}

                  {product.diamond_size && (
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Size</Text>
                      <Text style={styles.specValue}>{product.diamond_size}</Text>
                    </View>
                  )}

                  {product.diamond_setting && (
                    <View style={styles.specRow}>
                      <Text style={styles.specLabel}>Setting Type</Text>
                      <Text style={styles.specValue}>{product.diamond_setting}</Text>
                    </View>
                  )}
                </>
              )}

              {product.diamond_weight && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Total Weight</Text>
                  <Text style={styles.specValue}>{product.diamond_weight} carat</Text>
                </View>
              )}

              {product.diamond_clarity && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Clarity</Text>
                  <Text style={styles.specValue}>{product.diamond_clarity}</Text>
                </View>
              )}

              {product.diamond_color && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Color</Text>
                  <Text style={styles.specValue}>{product.diamond_color}</Text>
                </View>
              )}
            </View>
          )}

          {/* Gemstone Details */}
          {(product.gemstone_type || product.gemstone_weight || product.gemstone_count) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gemstone Details</Text>

              {product.gemstone_type && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Gemstone Type</Text>
                  <Text style={styles.specValue}>{product.gemstone_type}</Text>
                </View>
              )}

              {product.gemstone_count && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Number of Gemstones</Text>
                  <Text style={styles.specValue}>{product.gemstone_count}</Text>
                </View>
              )}

              {product.gemstone_weight && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Gemstone Weight</Text>
                  <Text style={styles.specValue}>{product.gemstone_weight} carat</Text>
                </View>
              )}

              {product.gemstone_color && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Gemstone Color</Text>
                  <Text style={styles.specValue}>{product.gemstone_color}</Text>
                </View>
              )}

              {product.gemstone_shape && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Gemstone Shape</Text>
                  <Text style={styles.specValue}>{product.gemstone_shape}</Text>
                </View>
              )}
            </View>
          )}

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Breakup</Text>

            {product.gold_price && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Gold</Text>
                <Text style={styles.specValue}>{formatPrice(product.gold_price)}</Text>
              </View>
            )}

            {product.diamond_price && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Diamond</Text>
                <Text style={styles.specValue}>{formatPrice(product.diamond_price)}</Text>
              </View>
            )}

            {product.solitaire_price && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Solitaire</Text>
                <Text style={styles.specValue}>{formatPrice(product.solitaire_price)}</Text>
              </View>
            )}

            {product.gemstone_price && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Gemstone</Text>
                <Text style={styles.specValue}>{formatPrice(product.gemstone_price)}</Text>
              </View>
            )}

            {product.making_charges && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Making Charges</Text>
                <Text style={styles.specValue}>{formatPrice(product.making_charges)}</Text>
              </View>
            )}

            {product.gst && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>GST</Text>
                <Text style={styles.specValue}>{formatPrice(product.gst)}</Text>
              </View>
            )}

            <View style={[styles.specRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(product.price)}</Text>
            </View>
          </View>

          {/* Additional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>

            {product.collection && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Collection</Text>
                <Text style={styles.specValue}>{product.collection}</Text>
              </View>
            )}

            {product.occasion && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Occasion</Text>
                <Text style={styles.specValue}>{product.occasion}</Text>
              </View>
            )}

            {product.gender && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Gender</Text>
                <Text style={styles.specValue}>{product.gender}</Text>
              </View>
            )}

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Stock Status</Text>
              <Text style={[styles.specValue, { color: product.in_stock ? '#4CAF50' : '#FF4444' }]}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>

            {product.certifications && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Certifications</Text>
                <Text style={styles.specValue}>{product.certifications}</Text>
              </View>
            )}

            {product.hallmark && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Hallmark</Text>
                <Text style={styles.specValue}>{product.hallmark}</Text>
              </View>
            )}
          </View>

          {/* Ratings & Reviews */}
          <View style={styles.sectionCard}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setShowAllReviews(!showAllReviews)}
            >
              <Icon name="star" size={22} color="#C9A86A" />
              <Text style={styles.sectionTitle}>Ratings and reviews</Text>
              <Icon name={showAllReviews ? "chevron-up" : "chevron-down"} size={22} color="#666" />
            </TouchableOpacity>
            
            {/* Rating Summary */}
            <View style={styles.ratingCard}>
              <View style={styles.ratingLeft}>
                <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
                {renderStarRating(averageRating, 18)}
                <Text style={styles.ratingSubtext}>based on {totalReviews} ratings</Text>
                <View style={styles.verifiedBuyers}>
                  <Icon name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>{verifiedReviewsCount} Verified Buyers</Text>
                </View>
              </View>
              
              <View style={styles.ratingRight}>
                <TouchableOpacity 
                  style={styles.writeReviewBtn}
                  onPress={() => setShowReviewModal(true)}
                >
                  <Icon name="pencil" size={16} color="#C9A86A" />
                  <Text style={styles.writeReviewText}>Write Review</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Customer Review Images */}
            <View style={styles.reviewImagesSection}>
              <Text style={styles.reviewImagesTitle}>Customer Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.reviewImagesRow}>
                  {productReviews.map(review => 
                    review.images.map((image, index) => (
                      <TouchableOpacity key={`${review.id}-${index}`} style={styles.reviewImageBox}>
                        <Image source={{ uri: image }} style={styles.reviewImage} />
                        <View style={styles.imageOverlay}>
                          <Icon name="camera" size={16} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                  <TouchableOpacity style={styles.moreImagesBox}>
                    <Text style={styles.moreImagesText}>+{productReviews.reduce((total, review) => total + review.images.length, 0)}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {/* Customer Reviews Horizontal Scroll */}
            <View style={styles.horizontalReviewsSection}>
              <Text style={styles.horizontalReviewsTitle}>Customer Reviews</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalReviewsContainer}
              >
                {productReviews.map(review => (
                  <View key={review.id} style={styles.horizontalReviewCard}>
                    <View style={styles.horizontalReviewHeader}>
                      <View style={styles.horizontalRatingStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Icon
                            key={star}
                            name={star <= review.rating ? "star" : "star-outline"}
                            size={14}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                      <Text style={styles.horizontalReviewTitle}>{review.title}</Text>
                      <Text style={styles.horizontalReviewDate}>{review.date}</Text>
                    </View>
                    
                    <Text style={styles.horizontalReviewComment} numberOfLines={3}>
                      {review.comment}
                    </Text>
                    
                    <View style={styles.horizontalReviewFooter}>
                      <Text style={styles.horizontalReviewerName}>{review.userName}</Text>
                      {review.verified && (
                        <View style={styles.horizontalVerifiedBadge}>
                          <Icon name="check-circle" size={12} color="#4CAF50" />
                          <Text style={styles.horizontalVerifiedText}>Verified</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.horizontalReviewActions}>
                      <View style={styles.horizontalActionBtn}>
                        <Icon name="thumb-up-outline" size={14} color="#666" />
                        <Text style={styles.horizontalActionText}>{review.helpful}</Text>
                      </View>
                      <View style={styles.horizontalActionBtn}>
                        <Icon name="thumb-down-outline" size={14} color="#666" />
                        <Text style={styles.horizontalActionText}>{review.notHelpful}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Reviews List */}
            {showAllReviews && (
              <View style={styles.reviewsList}>
                {productReviews.slice(0, 2).map(review => (
                  <View key={review.id} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        {renderStarRating(review.rating, 14)}
                        <Text style={styles.reviewTitle}>{review.title}</Text>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                      <View style={styles.reviewRating}>
                        <Text style={styles.reviewRatingNumber}>{review.rating}</Text>
                        <Icon name="star" size={16} color="#FFD700" />
                      </View>
                    </View>
                    
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                    
                    {/* Review Images */}
                    {review.images.length > 0 && (
                      <View style={styles.reviewItemImages}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={styles.reviewItemImagesRow}>
                            {review.images.map((image, index) => (
                              <TouchableOpacity key={index} style={styles.reviewItemImageBox}>
                                <Image source={{ uri: image }} style={styles.reviewItemImage} />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    )}
                    
                    <View style={styles.reviewFooter}>
                      <Text style={styles.reviewerName}>{review.userName}</Text>
                      {review.verified && (
                        <View style={styles.verifiedBadge}>
                          <Icon name="check-circle" size={14} color="#4CAF50" />
                          <Text style={styles.verifiedBadgeText}>Verified Buyer</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.reviewActions}>
                      <TouchableOpacity style={styles.reviewActionBtn}>
                        <Icon name="thumb-up-outline" size={16} color="#666" />
                        <Text style={styles.reviewActionText}>{review.helpful}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.reviewActionBtn}>
                        <Icon name="thumb-down-outline" size={16} color="#666" />
                        <Text style={styles.reviewActionText}>{review.notHelpful}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                <TouchableOpacity style={styles.showAllReviewsBtn}>
                  <Text style={styles.showAllReviewsText}>Show all reviews</Text>
                  <Icon name="chevron-right" size={20} color="#C9A86A" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Care Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Care Instructions</Text>
            <View style={styles.careCard}>
              <View style={styles.careItem}>
                <Icon name="water" size={24} color="#C9A86A" />
                <Text style={styles.careText}>Keep away from water and moisture</Text>
              </View>
              <View style={styles.careItem}>
                <Icon name="spray" size={24} color="#C9A86A" />
                <Text style={styles.careText}>Avoid perfumes and chemicals</Text>
              </View>
              <View style={styles.careItem}>
                <Icon name="star-outline" size={24} color="#C9A86A" />
                <Text style={styles.careText}>Store in a soft jewellery box</Text>
              </View>
              <View style={styles.careItem}>
                <Icon name="shimmer" size={24} color="#C9A86A" />
                <Text style={styles.careText}>Clean with soft cloth regularly</Text>
              </View>
            </View>
          </View>

          {/* Delivery & Return */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery & Returns</Text>
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryItem}>
                <Icon name="truck-delivery" size={24} color="#4CAF50" />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryTitle}>Free Delivery</Text>
                  <Text style={styles.deliveryText}>Estimated delivery in 5-7 business days</Text>
                </View>
              </View>
              <View style={styles.deliveryItem}>
                <Icon name="shield-check" size={24} color="#4CAF50" />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryTitle}>Easy Returns</Text>
                  <Text style={styles.deliveryText}>7 days return & exchange policy</Text>
                </View>
              </View>
              <View style={styles.deliveryItem}>
                <Icon name="certificate" size={24} color="#4CAF50" />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryTitle}>Certified Product</Text>
                  <Text style={styles.deliveryText}>Comes with authenticity certificate</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reviewModal}>
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Icon name="close" size={24} color="#2d2d2d" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.reviewModalContent}>
              <Text style={styles.reviewModalLabel}>Rate this product</Text>
              <View style={styles.reviewRatingSection}>
                {renderStarRating(userRating, 32, setUserRating)}
              </View>
              
              <Text style={styles.reviewModalLabel}>Write your review</Text>
              <TextInput
                style={styles.reviewTextInput}
                placeholder="Share your experience with this product..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={userReview}
                onChangeText={setUserReview}
                textAlignVertical="top"
              />
              
              <Text style={styles.reviewModalLabel}>Add Photos (Optional)</Text>
              <TouchableOpacity 
                style={styles.addPhotosBtn}
                onPress={selectImageSource}
              >
                <Icon name="camera-plus" size={24} color="#C9A86A" />
                <Text style={styles.addPhotosText}>Add Photos</Text>
              </TouchableOpacity>
              
              {reviewImages.length > 0 && (
                <View style={styles.selectedImagesRow}>
                  {reviewImages.map((image, index) => (
                    <View key={index} style={styles.selectedImageBox}>
                      <Image source={{ uri: image }} style={styles.selectedImage} />
                      <TouchableOpacity 
                        style={styles.removeImageBtn}
                        onPress={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                      >
                        <Icon name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            
            <View style={styles.reviewModalFooter}>
              <TouchableOpacity 
                style={styles.cancelReviewBtn}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.cancelReviewText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitReviewBtn}
                onPress={submitReview}
              >
                <Text style={styles.submitReviewText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= BOTTOM BAR ================= */}
      <LinearGradient
        colors={['#f8f8f8', '#ffffff']}
        style={styles.bottomBarGradient}
      >
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.cartBtn, isInCart(product.id) && styles.removeBtn]}
            onPress={() =>
              isInCart(product.id)
                ? removeFromCart(product.id)
                : addToCart(product)
            }
            activeOpacity={0.8}
          >
            <Icon
              name={isInCart(product.id) ? "minus" : "cart-plus"}
              size={22}
              color="#fff"
            />
            <Text style={styles.cartBtnText}>
              {isInCart(product.id) ? "Remove" : "Add to Cart"}
            </Text>
          </TouchableOpacity>

          <LinearGradient
            colors={['#D4B068', '#C9A86A', '#B8975C']}
            style={styles.buyBtn}
          >
            <TouchableOpacity style={styles.buyBtnInner} activeOpacity={0.8}>
              <Icon name="lightning-bolt" size={22} color="#fff" />
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  loadingCenter: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  loadingText: { 
    marginTop: verticalScale(10), 
    color: '#777',
    fontSize: moderateScale(16)
  },
  errorText: { 
    fontSize: moderateScale(18), 
    color: 'red' 
  },

  headerGradient: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(2) },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
  },
  headerBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    shadowOffset: { width: 0, height: verticalScale(2) },
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#2d2d2d',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: scale(8),
  },

  imageArea: {
    height: verticalScale(380),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: verticalScale(20),
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: { 
    width: width * 0.85, 
    height: verticalScale(320),
    borderRadius: moderateScale(16),
  },
  imageBadge: {
    position: 'absolute',
    bottom: scale(-10),
    left: scale(20),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    gap: scale(6),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(6),
    shadowOffset: { width: 0, height: verticalScale(2) },
  },
  imageBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#2d2d2d',
  },
  wishBtn: {
    position: 'absolute',
    top: verticalScale(30),
    right: scale(20),
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(3) },
  },
  wishBtnActive: {
    backgroundColor: '#C9A86A',
  },

  thumbRow: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    gap: scale(12),
  },
  thumbBox: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    shadowOffset: { width: 0, height: verticalScale(2) },
  },
  thumbActive: {
    borderColor: '#C9A86A',
    borderWidth: 3,
    elevation: 4,
  },
  thumbImg: { 
    width: '100%', 
    height: '100%' 
  },

  infoCard: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    backgroundColor: '#fff',
  },
  productHeader: {
    marginBottom: verticalScale(16),
  },
  productTitleSection: {
    marginBottom: verticalScale(12),
  },
  productName: {
    fontSize: moderateScale(26),
    fontWeight: '800',
    color: '#2d2d2d',
    lineHeight: moderateScale(32),
    marginBottom: verticalScale(4),
  },
  productSub: {
    fontSize: moderateScale(16),
    color: '#777',
    fontWeight: '500',
    marginBottom: verticalScale(8),
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  ratingStars: {
    flexDirection: 'row',
    gap: scale(2),
  },
  ratingText: {
    fontSize: moderateScale(14),
    color: '#666',
    fontWeight: '500',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    gap: scale(6),
    alignSelf: 'flex-start',
  },
  inStock: {
    backgroundColor: '#E8F5E8',
  },
  outOfStock: {
    backgroundColor: '#FFE8E8',
  },
  stockText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  priceCard: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(18),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(2) },
  },
  price: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    color: '#C9A86A',
    marginBottom: verticalScale(4),
  },
  discountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  originalPrice: {
    fontSize: moderateScale(18),
    color: '#999',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  discountText: {
    fontSize: moderateScale(12),
    color: '#fff',
    fontWeight: '700',
  },

  section: { 
    marginTop: verticalScale(24) 
  },
  sectionCard: {
    backgroundColor: '#fafafa',
    borderRadius: moderateScale(16),
    padding: scale(16),
    marginBottom: verticalScale(16),
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: moderateScale(6),
    shadowOffset: { width: 0, height: verticalScale(2) },
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    gap: scale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  sectionText: {
    color: '#555',
    lineHeight: moderateScale(22),
    fontSize: moderateScale(15),
    fontWeight: '400',
  },

  specRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  specLabel: { color: '#777', fontSize: 15 },
  specValue: { color: '#2d2d2d', fontSize: 15, fontWeight: '600' },

  totalRow: {
    borderTopWidth: 2,
    borderBottomWidth: 0,
    borderColor: '#C9A86A',
    paddingTop: 14,
    marginTop: 6,
  },
  totalLabel: { color: '#2d2d2d', fontSize: 17, fontWeight: '700' },
  totalValue: { color: '#C9A86A', fontSize: 18, fontWeight: '800' },

  careCard: {
    backgroundColor: '#faf8f5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  careText: {
    flex: 1,
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },

  deliveryCard: {
    backgroundColor: '#f0f9f4',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 2,
  },
  deliveryText: {
    fontSize: 13,
    color: '#666',
  },

  // Diamond Table Styles
  diamondTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d2d2d',
    textAlign: 'center',
  },
  diamondTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  tableCellText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },

  bottomBarGradient: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(12),
    shadowOffset: { width: 0, height: verticalScale(-4) },
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    gap: scale(12),
  },
  cartBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2d2d2d',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(3) },
  },
  removeBtn: { 
    backgroundColor: '#FF4444' 
  },
  cartBtnText: { 
    color: '#fff', 
    fontSize: moderateScale(16), 
    fontWeight: '700' 
  },

  buyBtn: {
    flex: 1,
    borderRadius: moderateScale(16),
    elevation: 6,
    shadowColor: '#C9A86A',
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(10),
    shadowOffset: { width: 0, height: verticalScale(4) },
  },
  buyBtnInner: {
    flexDirection: 'row',
    paddingVertical: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  buyBtnText: { 
    color: '#fff', 
    fontSize: moderateScale(16), 
    fontWeight: '700' 
  },

  // Ratings & Reviews Styles
  ratingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  ratingLeft: {
    flex: 1,
  },
  ratingNumber: {
    fontSize: moderateScale(36),
    fontWeight: '900',
    color: '#2d2d2d',
    marginBottom: verticalScale(4),
  },
  ratingSubtext: {
    fontSize: moderateScale(13),
    color: '#666',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(2),
  },
  verifiedBuyers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  verifiedText: {
    fontSize: moderateScale(13),
    color: '#4CAF50',
    fontWeight: '500',
  },
  ratingRight: {
    alignItems: 'flex-end',
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: '#C9A86A',
    gap: scale(6),
  },
  writeReviewText: {
    fontSize: moderateScale(14),
    color: '#C9A86A',
    fontWeight: '600',
  },
  starRow: {
    flexDirection: 'row',
    gap: scale(2),
  },
  reviewImagesSection: {
    marginBottom: verticalScale(16),
  },
  reviewImagesTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: verticalScale(8),
  },
  reviewImagesRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  reviewImageBox: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
  },
  reviewImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: scale(4),
    right: scale(4),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: moderateScale(12),
    width: moderateScale(24),
    height: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesBox: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    fontSize: moderateScale(16),
    color: '#fff',
    fontWeight: '700',
  },
  featuresSection: {
    marginBottom: verticalScale(16),
  },
  featuresTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: verticalScale(8),
  },
  featureTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  featureTag: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: '#f0f0f0',
    borderRadius: moderateScale(20),
  },
  featureTagText: {
    fontSize: moderateScale(13),
    color: '#555',
    fontWeight: '500',
  },
  
  // Horizontal Reviews Styles
  horizontalReviewsSection: {
    marginBottom: verticalScale(16),
  },
  horizontalReviewsTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(0),
  },
  horizontalReviewsContainer: {
    paddingRight: scale(20),
  },
  horizontalReviewCard: {
    width: moderateScale(280),
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: scale(16),
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 2,
  },
  horizontalReviewHeader: {
    marginBottom: verticalScale(8),
  },
  horizontalRatingStars: {
    flexDirection: 'row',
    gap: scale(2),
    marginBottom: verticalScale(4),
  },
  horizontalReviewTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: verticalScale(2),
  },
  horizontalReviewDate: {
    fontSize: moderateScale(12),
    color: '#999',
  },
  horizontalReviewComment: {
    fontSize: moderateScale(13),
    color: '#555',
    lineHeight: moderateScale(18),
    marginBottom: verticalScale(12),
  },
  horizontalReviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  horizontalReviewerName: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: '#2d2d2d',
  },
  horizontalVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  horizontalVerifiedText: {
    fontSize: moderateScale(11),
    color: '#4CAF50',
    fontWeight: '500',
  },
  horizontalReviewActions: {
    flexDirection: 'row',
    gap: scale(16),
  },
  horizontalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  horizontalActionText: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  reviewsList: {
    marginTop: verticalScale(16),
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: verticalScale(16),
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#2d2d2d',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(2),
  },
  reviewDate: {
    fontSize: moderateScale(12),
    color: '#999',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  reviewRatingNumber: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  reviewComment: {
    fontSize: moderateScale(14),
    color: '#555',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(8),
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  reviewerName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#2d2d2d',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  verifiedBadgeText: {
    fontSize: moderateScale(12),
    color: '#4CAF50',
    fontWeight: '500',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: scale(16),
  },
  reviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  reviewActionText: {
    fontSize: moderateScale(13),
    color: '#666',
  },
  reviewItemImages: {
    marginVertical: verticalScale(8),
  },
  reviewItemImagesRow: {
    flexDirection: 'row',
    gap: scale(8),
  },
  reviewItemImageBox: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewItemImage: {
    width: '100%',
    height: '100%',
  },
  showAllReviewsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    marginTop: verticalScale(8),
    gap: scale(8),
  },
  showAllReviewsText: {
    fontSize: moderateScale(15),
    color: '#C9A86A',
    fontWeight: '600',
  },

  // Review Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  reviewModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: '90%',
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewModalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  reviewModalContent: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
  },
  reviewModalLabel: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: verticalScale(8),
    marginTop: verticalScale(16),
  },
  reviewRatingSection: {
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
  },
  reviewTextInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#2d2d2d',
    minHeight: verticalScale(100),
    marginBottom: verticalScale(8),
  },
  addPhotosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
    borderWidth: 2,
    borderColor: '#C9A86A',
    borderStyle: 'dashed',
    borderRadius: moderateScale(12),
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  addPhotosText: {
    fontSize: moderateScale(14),
    color: '#C9A86A',
    fontWeight: '600',
  },
  selectedImagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  selectedImageBox: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: scale(4),
    right: scale(4),
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: scale(12),
  },
  cancelReviewBtn: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelReviewText: {
    fontSize: moderateScale(14),
    color: '#C9A86A',
    fontWeight: '600',
  },
  submitReviewBtn: {
    flex: 1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewText: {
    fontSize: moderateScale(14),
    color: '#fff',
    fontWeight: '600',
  },
});