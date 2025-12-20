import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPaymentMethods, deletePaymentMethod } from '../services';

const PaymentMethodsScreen = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const data = await getPaymentMethods();
      console.log('Payment methods fetched:', data);
      
      const methodsList = Array.isArray(data) ? data : [];
      setPaymentMethods(methodsList);
      
      // Auto-select default method
      const defaultMethod = methodsList.find(method => method.is_default);
      if (defaultMethod) {
        setSelectedMethod(defaultMethod.id);
      } else if (methodsList.length > 0) {
        setSelectedMethod(methodsList[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPaymentMethods();
    setRefreshing(false);
  };

  // Separate cards and UPI from payment methods
  const cards = paymentMethods.filter(method => 
    method.type === 'credit_card' || method.type === 'debit_card'
  );
  
  const upiMethods = paymentMethods.filter(method => 
    method.type === 'digital_wallet' || method.gateway === 'upi'
  );

  const handleAddCard = () => {
    navigation.navigate('AddPaymentMethod', {
      onMethodAdded: fetchPaymentMethods
    });
  };

  const handleDeleteCard = async (methodId) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(methodId);
              Alert.alert('Success', 'Payment method deleted successfully');
              fetchPaymentMethods();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete payment method');
            }
          }
        },
      ]
    );
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'Visa':
        return 'credit-card';
      case 'Mastercard':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      ) : paymentMethods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="credit-card-off" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No Payment Methods</Text>
          <Text style={styles.emptyText}>
            Add a payment method for faster checkout
          </Text>
          <TouchableOpacity 
            style={styles.addFirstBtn}
            onPress={handleAddCard}
          >
            <Icon name="plus" size={20} color="#1a1a1a" />
            <Text style={styles.addFirstBtnText}>Add Payment Method</Text>
          </TouchableOpacity>
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
          {/* Cards Section */}
          {cards.length > 0 && (
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>SAVED CARDS</Text>
            
            {cards.map((card) => (
              <View key={card.id} style={styles.paymentCard}>
                <View style={styles.cardLeft}>
                  <View style={styles.cardIconContainer}>
                    <Icon name={getCardIcon(card.brand || card.type)} size={28} color="#D4AF37" />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardType}>
                        {card.brand || card.type?.replace('_', ' ').toUpperCase()}
                      </Text>
                      {card.is_default && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardNumber}>
                      **** **** **** {card.last_four || card.last4}
                    </Text>
                    {card.expires_month && card.expires_year && (
                      <Text style={styles.cardExpiry}>
                        Expires {String(card.expires_month).padStart(2, '0')}/{String(card.expires_year).slice(-2)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.radioBtn}
                    onPress={() => setSelectedMethod(card.id)}
                  >
                    <Icon
                      name={selectedMethod === card.id ? 'radiobox-marked' : 'radiobox-blank'}
                      size={24}
                      color={selectedMethod === card.id ? '#D4AF37' : '#CCC'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteCard(card.id)}
                  >
                    <Icon name="delete-outline" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.addBtn}
              onPress={handleAddCard}
              activeOpacity={0.8}
            >
              <Icon name="plus-circle" size={20} color="#D4AF37" />
              <Text style={styles.addBtnText}>Add New Card</Text>
            </TouchableOpacity>
          </View>
          )}

          {/* UPI Section */}
          {upiMethods.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>UPI / DIGITAL WALLETS</Text>
              
              {upiMethods.map((upi) => (
              <View key={upi.id} style={styles.paymentCard}>
                <View style={styles.cardLeft}>
                  <View style={styles.upiIconContainer}>
                    <Icon name={upi.gateway === 'upi' ? 'bank' : 'wallet'} size={24} color="#FFF" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardType}>
                      {upi.nickname || upi.type?.replace('_', ' ').toUpperCase()}
                    </Text>
                    {upi.gateway_method_id && (
                      <Text style={styles.upiId}>{upi.gateway_method_id}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.radioBtn}
                    onPress={() => setSelectedMethod(upi.id)}
                  >
                    <Icon
                      name={selectedMethod === upi.id ? 'radiobox-marked' : 'radiobox-blank'}
                      size={24}
                      color={selectedMethod === upi.id ? '#D4AF37' : '#CCC'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteCard(upi.id)}
                  >
                    <Icon name="delete-outline" size={20} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity 
              style={styles.addBtn}
              onPress={handleAddCard}
              activeOpacity={0.8}
            >
              <Icon name="plus-circle" size={20} color="#D4AF37" />
              <Text style={styles.addBtnText}>Add UPI / Wallet</Text>
            </TouchableOpacity>
          </View>
          )}

        {/* Other Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OTHER METHODS</Text>
          
          <TouchableOpacity style={styles.otherMethodCard}>
            <View style={styles.methodLeft}>
              <View style={styles.methodIconContainer}>
                <Icon name="cash" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.methodText}>Cash on Delivery</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.otherMethodCard}>
            <View style={styles.methodLeft}>
              <View style={styles.methodIconContainer}>
                <Icon name="bank" size={24} color="#2196F3" />
              </View>
              <Text style={styles.methodText}>Net Banking</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#CCC" />
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cardNumber: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: '#999',
  },
  upiId: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioBtn: {
    padding: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D4AF37',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  otherMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
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
    marginBottom: 24,
  },
  addFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFirstBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default PaymentMethodsScreen;
