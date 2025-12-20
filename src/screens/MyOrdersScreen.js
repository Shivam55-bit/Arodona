import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getOrders } from '../services';

const MyOrdersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? null : [activeTab];
      const data = await getOrders({ 
        page: 1, 
        per_page: 20,
        ...(statusFilter && { status: statusFilter })
      });
      
      console.log('Orders fetched:', data);
      
      // Handle different response formats
      const ordersList = data.items || data.orders || data || [];
      setOrders(ordersList);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      'delivered': '#4CAF50',
      'shipped': '#FF9800',
      'in_transit': '#FF9800',
      'processing': '#2196F3',
      'pending': '#FFC107',
      'confirmed': '#2196F3',
      'cancelled': '#F44336',
      'returned': '#9E9E9E',
    };
    return statusMap[status?.toLowerCase()] || '#666';
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'delivered': 'check-circle',
      'shipped': 'truck-delivery',
      'in_transit': 'truck-delivery',
      'processing': 'package-variant',
      'pending': 'clock-outline',
      'confirmed': 'check',
      'cancelled': 'close-circle',
      'returned': 'package-variant-closed',
    };
    return iconMap[status?.toLowerCase()] || 'package-variant';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price, currency = '₹') => {
    if (typeof price === 'string') {
      return `${currency}${price}`;
    }
    return `${currency}${price?.toFixed(2) || '0.00'}`;
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'processing', label: 'Processing' },
    { id: 'delivered', label: 'Delivered' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant-closed" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No Orders Found</Text>
          <Text style={styles.emptyText}>
            You haven't placed any orders yet
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#D4AF37']}
            />
          }
        >
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
            >
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderNumber}>
                    {order.order_number || `#${order.id?.slice(0, 8)}`}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(order.status) }
                ]}>
                  <Icon name={getStatusIcon(order.status)} size={14} color="#FFF" />
                  <Text style={styles.statusText}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDivider} />

              <View style={styles.orderFooter}>
                <View style={styles.orderInfo}>
                  <Icon name="package-variant" size={18} color="#666" />
                  <Text style={styles.orderInfoText}>
                    {order.items?.length || 0} Items
                  </Text>
                </View>
                <Text style={styles.orderTotal}>
                  {formatPrice(order.pricing?.total_amount || order.total_amount)}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.trackBtn}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
              >
                <Text style={styles.trackBtnText}>View Details</Text>
                <Icon name="chevron-right" size={18} color="#D4AF37" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#1a1a1a',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#888',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderInfoText: {
    fontSize: 13,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  trackBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default MyOrdersScreen;
