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
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

function DeliveryHomeScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationAnim = useRef(new Animated.Value(-100)).current;

  const handleNotificationPress = () => {
    setShowNotifications(true);
    Animated.spring(notificationAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const handleCloseNotifications = () => {
    Animated.timing(notificationAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowNotifications(false));
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  // Delivery Statistics
  const todayStats = {
    deliveries: 12,
    earnings: '₹850',
    distance: '45.2',
    rating: 4.8,
  };

  // Active Deliveries
  const activeDeliveries = [
    { 
      id: 'd1', 
      orderId: '#ORD12345', 
      customerName: 'Priya Sharma', 
      address: 'Street 12, Sector 15, Noida',
      items: 3,
      amount: '₹1,250',
      distance: '2.5 km',
      status: 'picked_up',
      estimatedTime: '15 mins',
      customerPhone: '+91 98765 43210'
    },
    { 
      id: 'd2', 
      orderId: '#ORD12346', 
      customerName: 'Rahul Kumar', 
      address: 'House 45, Block B, Greater Noida',
      items: 2,
      amount: '₹890',
      distance: '4.1 km',
      status: 'ready_to_pickup',
      estimatedTime: '25 mins',
      customerPhone: '+91 98765 43211'
    },
  ];

  // Delivery Zones
  const deliveryZones = [
    { id: 'z1', name: 'Sector 15', orders: 8, distance: '2 km', demand: 'high' },
    { id: 'z2', name: 'Sector 18', orders: 5, distance: '3.5 km', demand: 'medium' },
    { id: 'z3', name: 'Greater Noida', orders: 12, distance: '6 km', demand: 'high' },
    { id: 'z4', name: 'Noida City Center', orders: 3, distance: '1.5 km', demand: 'low' },
  ];

  // Recent Completed Deliveries
  const recentDeliveries = [
    { 
      id: 'c1', 
      orderId: '#ORD12340', 
      customerName: 'Anjali Verma',
      amount: '₹650',
      time: '10 mins ago',
      rating: 5,
      tip: '₹50'
    },
    { 
      id: 'c2', 
      orderId: '#ORD12338', 
      customerName: 'Vikram Singh',
      amount: '₹1,120',
      time: '35 mins ago',
      rating: 4,
      tip: '₹0'
    },
    { 
      id: 'c3', 
      orderId: '#ORD12335', 
      customerName: 'Neha Gupta',
      amount: '₹780',
      time: '1 hr ago',
      rating: 5,
      tip: '₹30'
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'picked_up': return '#C9A86A';
      case 'ready_to_pickup': return '#4CAF50';
      case 'on_the_way': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'picked_up': return 'Picked Up';
      case 'ready_to_pickup': return 'Ready to Pickup';
      case 'on_the_way': return 'On the Way';
      default: return 'Pending';
    }
  };

  const getDemandColor = (demand) => {
    switch(demand) {
      case 'high': return '#FF5252';
      case 'medium': return '#FFA726';
      case 'low': return '#66BB6A';
      default: return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Notification Panel */}
      {showNotifications && (
        <Animated.View 
          style={[
            styles.notificationPanel,
            {
              transform: [{ translateY: notificationAnim }],
            }
          ]}
        >
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>Notifications</Text>
            <TouchableOpacity onPress={handleCloseNotifications}>
              <Icon name="close" size={24} color="#2d2d2d" />
            </TouchableOpacity>
          </View>
          <Text style={styles.notificationItem}>New order available in your zone</Text>
          <Text style={styles.notificationItem}>Your rating increased to 4.8⭐</Text>
        </Animated.View>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Header with Profile and Status */}
        <View style={styles.headerBg}>
          <View style={styles.overlay} />
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Image 
                source={require('../../assets/Profile.png')} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.welcomeText}>Good Morning</Text>
              <Text style={styles.driverName}>Delivery Partner</Text>
            </View>

            <TouchableOpacity 
              style={styles.notificationBtn}
              onPress={handleNotificationPress}
            >
              <Icon name="bell-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Online/Offline Toggle */}
          <View style={styles.statusContainer}>
            <View style={styles.statusCard}>
              <View style={styles.statusLeft}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#FF5252' }]} />
                <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.toggleBtn, { backgroundColor: isOnline ? '#4CAF50' : '#666' }]}
                onPress={toggleOnlineStatus}
                activeOpacity={0.8}
              >
                <Text style={styles.toggleBtnText}>{isOnline ? 'Go Offline' : 'Go Online'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logo/Badge */}
          <View style={styles.logoContainer}>
            <View style={styles.badgeCircle}>
              <Icon name="bike-fast" size={moderateScale(50)} color="#C9A86A" />
            </View>
          </View>
        </View>

        {/* SVG Curved White Card */}
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
          <View style={styles.logoSpacing} />
          
          {/* Today's Statistics */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Stats</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeliveryHistory')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="package-variant-closed" size={moderateScale(32)} color="#C9A86A" />
              <Text style={styles.statValue}>{todayStats.deliveries}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="currency-inr" size={moderateScale(32)} color="#4CAF50" />
              <Text style={styles.statValue}>{todayStats.earnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="map-marker-distance" size={moderateScale(32)} color="#2196F3" />
              <Text style={styles.statValue}>{todayStats.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="star" size={moderateScale(32)} color="#FFB800" />
              <Text style={styles.statValue}>{todayStats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Active Deliveries Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Deliveries</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{activeDeliveries.length}</Text>
            </View>
          </View>

          <FlatList
            data={activeDeliveries}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: verticalScale(12) }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.deliveryCard} 
                activeOpacity={0.9}
                onPress={() => navigation.navigate('DeliveryDetail', { delivery: item })}
              >
                <View style={styles.deliveryHeader}>
                  <Text style={styles.orderId}>{item.orderId}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusBadgeText}>{getStatusText(item.status)}</Text>
                  </View>
                </View>

                <View style={styles.customerInfo}>
                  <Icon name="account" size={20} color="#2d2d2d" />
                  <Text style={styles.customerName} numberOfLines={1}>{item.customerName}</Text>
                </View>

                <View style={styles.addressInfo}>
                  <Icon name="map-marker" size={18} color="#C9A86A" />
                  <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
                </View>

                <View style={styles.deliveryDetails}>
                  <View style={styles.detailItem}>
                    <Icon name="package-variant" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.items} items</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Icon name="map-marker-distance" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.distance}</Text>
                  </View>
                </View>

                <View style={styles.deliveryFooter}>
                  <View>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>{item.amount}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.callBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      console.log('Call customer', item.customerPhone);
                    }}
                  >
                    <Icon name="phone" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.timeIndicator}>
                  <Icon name="clock-outline" size={14} color="#4CAF50" />
                  <Text style={styles.timeText}>{item.estimatedTime}</Text>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* Delivery Zones Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Zones</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeliveryZones')}>
              <Text style={styles.viewAllText}>View Map</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zonesScroll}
          >
            {deliveryZones.map((zone) => (
              <TouchableOpacity 
                key={zone.id} 
                style={styles.zoneCard} 
                activeOpacity={0.8}
              >
                <View style={styles.zoneHeader}>
                  <Icon name="map-marker-radius" size={moderateScale(28)} color="#C9A86A" />
                  <View style={[styles.demandBadge, { backgroundColor: getDemandColor(zone.demand) }]}>
                    <Text style={styles.demandText}>{zone.demand}</Text>
                  </View>
                </View>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <View style={styles.zoneDetails}>
                  <View style={styles.zoneDetailItem}>
                    <Icon name="package-variant" size={16} color="#666" />
                    <Text style={styles.zoneDetailText}>{zone.orders} orders</Text>
                  </View>
                  <View style={styles.zoneDetailItem}>
                    <Icon name="map-marker-distance" size={16} color="#666" />
                    <Text style={styles.zoneDetailText}>{zone.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recent Deliveries Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Deliveries</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeliveryHistory')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            {recentDeliveries.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={styles.recentCard} 
                activeOpacity={0.9}
              >
                <View style={styles.recentLeft}>
                  <View style={styles.recentIcon}>
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentOrderId}>{item.orderId}</Text>
                    <Text style={styles.recentCustomer}>{item.customerName}</Text>
                    <Text style={styles.recentTime}>{item.time}</Text>
                  </View>
                </View>
                <View style={styles.recentRight}>
                  <Text style={styles.recentAmount}>{item.amount}</Text>
                  <View style={styles.recentRating}>
                    <Icon name="star" size={14} color="#FFB800" />
                    <Text style={styles.recentRatingText}>{item.rating}</Text>
                  </View>
                  {item.tip !== '₹0' && (
                    <Text style={styles.tipText}>Tip: {item.tip}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    backgroundColor: '#1a1a1a',
    height: isTablet ? verticalScale(320) : verticalScale(280), 
    position: 'relative',
    paddingTop: verticalScale(16),
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.2)' 
  },
  headerTop: { 
    marginHorizontal: scale(20), 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    zIndex: 10 
  },
  profileBtn: { 
    width: moderateScale(50), 
    height: moderateScale(50), 
    borderRadius: moderateScale(25), 
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
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
  },
  headerCenter: {
    flex: 1,
    marginLeft: scale(12),
  },
  welcomeText: {
    fontSize: moderateScale(13),
    color: '#D4AF37',
    fontWeight: '500',
  },
  driverName: {
    fontSize: isTablet ? moderateScale(20) : moderateScale(18),
    color: '#fff',
    fontWeight: '700',
    marginTop: verticalScale(2),
  },
  notificationBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: verticalScale(8),
    right: scale(8),
    backgroundColor: '#FF5252',
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: moderateScale(10),
    color: '#fff',
    fontWeight: '700',
  },
  statusContainer: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(20),
    zIndex: 10,
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: moderateScale(16),
    padding: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(3) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    marginRight: scale(10),
  },
  statusText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  toggleBtn: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(20),
  },
  toggleBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#fff',
  },
  logoContainer: { 
    position: 'absolute', 
    bottom: verticalScale(-35), 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 5 
  },
  badgeCircle: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(12),
    borderWidth: 4,
    borderColor: '#D4AF37',
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
  activeBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  activeBadgeText: {
    fontSize: moderateScale(12),
    color: '#fff',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  statCard: {
    width: (width - scale(52)) / 4 - scale(4),
    backgroundColor: '#f8f3ef',
    borderRadius: moderateScale(16),
    padding: scale(12),
    alignItems: 'center',
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#2d2d2d',
    marginTop: verticalScale(8),
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: '#666',
    marginTop: verticalScale(4),
    textAlign: 'center',
  },
  deliveryCard: { 
    width: isTablet ? scale(320) : scale(280), 
    marginRight: scale(16), 
    backgroundColor: '#fff', 
    borderRadius: moderateScale(20), 
    padding: scale(16), 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: moderateScale(12), 
    shadowOffset: { width: 0, height: verticalScale(4) },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  orderId: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
  },
  statusBadgeText: {
    fontSize: moderateScale(11),
    color: '#fff',
    fontWeight: '700',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
    gap: scale(8),
  },
  customerName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#2d2d2d',
    flex: 1,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
    gap: scale(8),
  },
  addressText: {
    fontSize: moderateScale(13),
    color: '#666',
    flex: 1,
    lineHeight: moderateScale(18),
  },
  deliveryDetails: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(12),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  detailText: {
    fontSize: moderateScale(12),
    color: '#666',
    fontWeight: '500',
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(8),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  amountLabel: {
    fontSize: moderateScale(11),
    color: '#666',
    marginBottom: verticalScale(2),
  },
  amountValue: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#4CAF50',
  },
  callBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  timeIndicator: {
    position: 'absolute',
    top: verticalScale(16),
    right: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    gap: scale(4),
  },
  timeText: {
    fontSize: moderateScale(11),
    color: '#4CAF50',
    fontWeight: '600',
  },
  zonesScroll: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(4),
  },
  zoneCard: {
    width: scale(140),
    backgroundColor: '#f8f3ef',
    borderRadius: moderateScale(16),
    padding: scale(14),
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  demandBadge: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  demandText: {
    fontSize: moderateScale(10),
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  zoneName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: verticalScale(8),
  },
  zoneDetails: {
    gap: verticalScale(6),
  },
  zoneDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  zoneDetailText: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  recentList: {
    gap: verticalScale(12),
    marginBottom: verticalScale(20),
  },
  recentCard: {
    backgroundColor: '#f8f3ef',
    borderRadius: moderateScale(16),
    padding: scale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(12),
  },
  recentIcon: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentOrderId: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  recentCustomer: {
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: verticalScale(2),
  },
  recentTime: {
    fontSize: moderateScale(11),
    color: '#999',
    marginTop: verticalScale(2),
  },
  recentRight: {
    alignItems: 'flex-end',
  },
  recentAmount: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#4CAF50',
  },
  recentRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    marginTop: verticalScale(4),
  },
  recentRatingText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#2d2d2d',
  },
  tipText: {
    fontSize: moderateScale(11),
    color: '#C9A86A',
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  notificationPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    padding: scale(20),
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(8),
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  notificationTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#2d2d2d',
  },
  notificationItem: {
    fontSize: moderateScale(14),
    color: '#666',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

export default DeliveryHomeScreen;
