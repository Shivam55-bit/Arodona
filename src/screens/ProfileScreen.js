import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Switch,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getUserProfile } from '../services/profileApi';
import { logoutUser } from '../services/authApi';
import { getOrders } from '../services/orderApi';
import { useWishlist } from '../context/WishlistContext';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const ProfileScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);
  const { wishlist } = useWishlist();

  useEffect(() => {
    fetchUserProfile();
    fetchOrdersCount();

    // Add navigation listener for refresh on focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // First try to get from AsyncStorage
      const storedData = await AsyncStorage.getItem('user_data');
      if (storedData) {
        const userData = JSON.parse(storedData);
        setUserData(userData);
        setLoading(false);
        return;
      }

      // If not in storage, try API
      const result = await getUserProfile();
      if (result.success) {
        setUserData(result.user);
      }
    } catch (error) {
      console.log('Error loading profile:', error);
      // Try to load from storage anyway
      try {
        const storedData = await AsyncStorage.getItem('user_data');
        if (storedData) {
          setUserData(JSON.parse(storedData));
        }
      } catch (e) {
        console.log('No stored data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersCount = async () => {
    try {
      const orders = await getOrders({ page: 1, page_size: 1000 });
      if (orders && orders.results) {
        setOrdersCount(orders.count || orders.results.length);
      }
    } catch (error) {
      console.log('Error fetching orders count:', error);
      setOrdersCount(0);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logoutUser();
            if (result.success) {
              navigation.replace('Login');
            } else {
              Alert.alert('Error', result.message || 'Logout failed');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: '1',
      title: 'My Orders',
      icon: 'package-variant',
      subtitle: 'Track your orders',
      onPress: () => navigation.navigate('MyOrders'),
    },
    {
      id: '2',
      title: 'Shipping Address',
      icon: 'map-marker-outline',
      subtitle: 'Manage delivery addresses',
      onPress: () => navigation.navigate('ShippingAddress'),
    },
    {
      id: '3',
      title: 'Payment Methods',
      icon: 'credit-card-outline',
      subtitle: 'Saved cards & UPI',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      id: '4',
      title: 'Notifications',
      icon: 'bell-outline',
      subtitle: 'Manage notifications',
      hasSwitch: true,
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: '5',
      title: 'Dark Mode',
      icon: 'theme-light-dark',
      subtitle: 'App appearance',
      hasSwitch: true,
      value: darkMode,
      onToggle: setDarkMode,
    },
    {
      id: '6',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      subtitle: 'Get assistance',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      id: '7',
      title: 'About',
      icon: 'information-outline',
      subtitle: 'App info & version',
      onPress: () => navigation.navigate('About'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header with Dark Background */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.settingsBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icon name="cog-outline" size={moderateScale(24)} color="#D4AF37" />
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            {loading ? (
              <ActivityIndicator size="large" color="#D4AF37" style={{ marginVertical: 20 }} />
            ) : (
              <>
                <View style={styles.avatarContainer}>
                  {userData?.avatar ? (
                    <Image
                      source={{ uri: userData.avatar }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitials}>
                        {userData?.first_name?.charAt(0)}{userData?.last_name?.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.cameraBtn}>
                    <Icon name="camera" size={moderateScale(17)} color="#1a1a1a" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.userName}>
                  {userData?.first_name} {userData?.last_name}
                </Text>
                <Text style={styles.userEmail}>{userData?.email}</Text>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.editProfileBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icon name="pencil-outline" size={moderateScale(15)} color="#1a1a1a" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="package-variant-closed" size={moderateScale(isTablet ? 32 : 26)} color="#D4AF37" />
            <Text style={styles.statNumber}>{ordersCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="heart-outline" size={moderateScale(isTablet ? 32 : 26)} color="#D4AF37" />
            <Text style={styles.statNumber}>{wishlist?.length || 0}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="star-outline" size={moderateScale(isTablet ? 32 : 26)} color="#D4AF37" />
            <Text style={styles.statNumber}>{userData?.rating || '5.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Groups */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuGroup}>
            {menuItems.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Icon name={item.icon} size={moderateScale(isTablet ? 24 : 21)} color="#666" />
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={moderateScale(isTablet ? 24 : 21)} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.menuGroup}>
            {menuItems.slice(3, 5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                activeOpacity={1}
              >
                <View style={styles.menuLeft}>
                  <Icon name={item.icon} size={moderateScale(isTablet ? 24 : 21)} color="#666" />
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#E0E0E0', true: '#D4AF37' }}
                  thumbColor="#FFF"
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.menuGroup}>
            {menuItems.slice(5).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Icon name={item.icon} size={moderateScale(isTablet ? 24 : 21)} color="#666" />
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={moderateScale(isTablet ? 24 : 21)} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
            <Icon name="logout" size={moderateScale(isTablet ? 24 : 21)} color="#FFF" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(20),
  },
  profileHeader: {
    backgroundColor: '#1a1a1a',
    paddingTop: verticalScale(isTablet ? 60 : 40),
    paddingBottom: verticalScale(35),
    borderBottomLeftRadius: moderateScale(isTablet ? 40 : 28),
    borderBottomRightRadius: moderateScale(isTablet ? 40 : 28),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: wp('6%'),
    marginBottom: verticalScale(15),
  },
  headerTitle: {
    fontSize: moderateScale(isTablet ? 32 : 24),
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: verticalScale(16),
    shadowColor: '#D4AF37',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatar: {
    width: moderateScale(isTablet ? 130 : 100),
    height: moderateScale(isTablet ? 130 : 100),
    borderRadius: moderateScale(isTablet ? 65 : 50),
    borderWidth: moderateScale(3),
    borderColor: '#D4AF37',
  },
  avatarPlaceholder: {
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: moderateScale(isTablet ? 48 : 36),
    fontWeight: '700',
    color: '#1a1a1a',
  },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: moderateScale(3),
    borderColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  userName: {
    fontSize: moderateScale(isTablet ? 26 : 21),
    fontWeight: '700',
    color: '#FFF',
    marginBottom: verticalScale(6),
    letterSpacing: 0.3,
  },
  userEmail: {
    fontSize: moderateScale(isTablet ? 16 : 14),
    color: '#BBB',
    marginBottom: verticalScale(18),
    fontWeight: '400',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: scale(22),
    paddingVertical: verticalScale(11),
    borderRadius: moderateScale(22),
    gap: scale(7),
    shadowColor: '#D4AF37',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  editProfileText: {
    fontSize: moderateScale(isTablet ? 16 : 14),
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: wp('5%'),
    marginTop: verticalScale(-22),
    marginBottom: verticalScale(22),
    gap: scale(12),
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(isTablet ? 26 : 20),
    shadowColor: '#D4AF37',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f8f8f8',
  },
  statNumber: {
    fontSize: moderateScale(isTablet ? 26 : 20),
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(isTablet ? 14 : 12),
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  contentSection: {
    paddingHorizontal: wp('6%'),
  },
  sectionTitle: {
    fontSize: moderateScale(isTablet ? 13 : 11),
    fontWeight: '800',
    color: '#888',
    letterSpacing: 1.8,
    marginTop: verticalScale(10),
    marginBottom: verticalScale(12),
    marginLeft: scale(4),
  },
  menuGroup: {
    backgroundColor: '#FFF',
    borderRadius: moderateScale(18),
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(isTablet ? 18 : 16),
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTextContainer: {
    marginLeft: scale(14),
    flex: 1,
  },
  menuTitle: {
    fontSize: moderateScale(isTablet ? 17 : 15),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: verticalScale(3),
    letterSpacing: 0.2,
  },
  menuSubtitle: {
    fontSize: moderateScale(isTablet ? 14 : 12),
    color: '#999',
    fontWeight: '400',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginTop: verticalScale(12),
    paddingVertical: verticalScale(isTablet ? 18 : 16),
    borderRadius: moderateScale(14),
    gap: scale(10),
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoutText: {
    fontSize: moderateScale(isTablet ? 18 : 16),
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  versionText: {
    textAlign: 'center',
    fontSize: moderateScale(isTablet ? 14 : 13),
    color: '#bbb',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(30),
    fontWeight: '500',
  },
});

export default ProfileScreen;
