import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { formatPrice } from '../services/productApi';

const OrderConfirmationScreen = ({ route, navigation }) => {
  const { orderId, orderDetails, paymentId } = route.params || {};
  const [billData, setBillData] = useState(null);
  const [loadingBill, setLoadingBill] = useState(true);

  useEffect(() => {
    // Generate local bill immediately
    generateLocalBill();
  }, []);

  const generateLocalBill = () => {
    setLoadingBill(true);
    
    // Create bill data locally
    const bill = {
      id: `BILL-${orderId}`,
      order_id: orderId,
      bill_number: `INV-${Date.now().toString().slice(-8)}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      items: orderDetails?.items || [],
      subtotal: orderDetails?.subtotal || 0,
      shipping: orderDetails?.shipping || 0,
      tax: orderDetails?.tax || 0,
      discount: orderDetails?.discount || 0,
      total: orderDetails?.total || 0,
      payment_status: 'Pending',
      payment_id: paymentId || null,
    };
    
    setBillData(bill);
    setLoadingBill(false);
  };

  const handleShareBill = async () => {
    if (!billData) return;
    
    const billText = `
🧾 ARODONA - INVOICE
━━━━━━━━━━━━━━━━━━━━
📋 Bill No: ${billData.bill_number}
📅 Date: ${billData.date} ${billData.time}
🆔 Order ID: #${orderId}
━━━━━━━━━━━━━━━━━━━━

📦 ITEMS:
${billData.items.map((item, i) => `${i + 1}. ${item.name} (${item.packaging || 'Box'})
   Qty: ${item.quantity} × ${formatPrice(item.price)}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━
💰 Subtotal: ${formatPrice(billData.subtotal)}
🚚 Shipping: ${formatPrice(billData.shipping)}
📊 Tax: ${formatPrice(billData.tax)}
${billData.discount > 0 ? `🎉 Discount: -${formatPrice(billData.discount)}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
💵 TOTAL: ${formatPrice(billData.total)}
━━━━━━━━━━━━━━━━━━━━

Thank you for shopping with Arodona! 🙏
    `.trim();

    try {
      await Share.share({
        message: billText,
        title: `Arodona Invoice - ${billData.bill_number}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share bill');
    }
  };

  const handleViewBill = () => {
    Alert.alert(
      `📄 Invoice: ${billData?.bill_number}`,
      `Order ID: #${orderId}\nDate: ${billData?.date}\n\nTotal: ${formatPrice(billData?.total)}\n\nItems: ${billData?.items?.length || 0}`,
      [
        { text: 'Share', onPress: handleShareBill },
        { text: 'OK' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Animation Container */}
        <View style={styles.successContainer}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
            style={styles.successIconBg}
          >
            <Icon name="check-circle" size={80} color="#4CAF50" />
          </LinearGradient>
          
          <Text style={styles.title}>Order Placed Successfully!</Text>
          <Text style={styles.subtitle}>Thank you for your purchase</Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Icon name="receipt" size={24} color="#C9A86A" />
            <Text style={styles.cardTitle}>Order Details</Text>
          </View>
          
          <View style={styles.orderInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>#{orderId || 'N/A'}</Text>
            </View>
            
            {paymentId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment ID</Text>
                <Text style={styles.infoValue}>{paymentId}</Text>
              </View>
            )}
            
            {orderDetails?.total && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Amount</Text>
                <Text style={styles.infoValueHighlight}>
                  {formatPrice(orderDetails.total)}
                </Text>
              </View>
            )}
            
            {orderDetails?.items?.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Items</Text>
                <Text style={styles.infoValue}>
                  {orderDetails.items.length} item(s)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Bill Section */}
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <Icon name="file-document" size={24} color="#C9A86A" />
            <Text style={styles.cardTitle}>Your Invoice</Text>
          </View>
          
          {loadingBill ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#C9A86A" />
              <Text style={styles.loadingText}>Generating your bill...</Text>
            </View>
          ) : billData ? (
            <View style={styles.billReady}>
              {/* Bill Preview */}
              <View style={styles.billPreview}>
                <View style={styles.billPreviewHeader}>
                  <Text style={styles.billNumber}>📄 {billData.bill_number}</Text>
                  <Text style={styles.billDate}>{billData.date}</Text>
                </View>
                
                <View style={styles.billDivider} />
                
                {/* Bill Items */}
                {billData.items?.map((item, index) => (
                  <View key={index} style={styles.billItem}>
                    <View style={styles.billItemLeft}>
                      <Text style={styles.billItemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.billItemMeta}>
                        Qty: {item.quantity} • {item.packaging || 'Box'}
                      </Text>
                    </View>
                    <Text style={styles.billItemPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </Text>
                  </View>
                ))}
                
                <View style={styles.billDivider} />
                
                {/* Bill Summary */}
                <View style={styles.billSummaryRow}>
                  <Text style={styles.billSummaryLabel}>Subtotal</Text>
                  <Text style={styles.billSummaryValue}>{formatPrice(billData.subtotal)}</Text>
                </View>
                <View style={styles.billSummaryRow}>
                  <Text style={styles.billSummaryLabel}>Shipping</Text>
                  <Text style={styles.billSummaryValue}>{formatPrice(billData.shipping)}</Text>
                </View>
                <View style={styles.billSummaryRow}>
                  <Text style={styles.billSummaryLabel}>Tax</Text>
                  <Text style={styles.billSummaryValue}>{formatPrice(billData.tax)}</Text>
                </View>
                {billData.discount > 0 && (
                  <View style={styles.billSummaryRow}>
                    <Text style={[styles.billSummaryLabel, {color: '#4CAF50'}]}>Discount</Text>
                    <Text style={[styles.billSummaryValue, {color: '#4CAF50'}]}>-{formatPrice(billData.discount)}</Text>
                  </View>
                )}
                
                <View style={styles.billTotalRow}>
                  <Text style={styles.billTotalLabel}>Total</Text>
                  <Text style={styles.billTotalValue}>{formatPrice(billData.total)}</Text>
                </View>
              </View>
              
              {/* Share Button */}
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={handleShareBill}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#C9A86A', '#B8975C']}
                  style={styles.downloadGradient}
                >
                  <Icon name="share-variant" size={22} color="#fff" />
                  <Text style={styles.downloadText}>Share Invoice</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.billPending}>
              <Icon name="clock-outline" size={40} color="#999" />
              <Text style={styles.billPendingText}>
                Bill will be available shortly
              </Text>
            </View>
          )}
        </View>

        {/* Packaging Info (if available) */}
        {orderDetails?.items?.some(item => item.packaging) && (
          <View style={styles.packagingCard}>
            <View style={styles.packagingHeader}>
              <Icon name="package-variant" size={24} color="#C9A86A" />
              <Text style={styles.cardTitle}>Packaging Details</Text>
            </View>
            {orderDetails.items.map((item, index) => (
              item.packaging && (
                <View key={index} style={styles.packagingItem}>
                  <Text style={styles.packagingProduct} numberOfLines={1}>
                    {item.name || `Item ${index + 1}`}
                  </Text>
                  <View style={styles.packagingBadge}>
                    <Text style={styles.packagingText}>{item.packaging}</Text>
                  </View>
                </View>
              )
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('MyOrders')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#C9A86A', '#B8975C']}
              style={styles.buttonGradient}
            >
              <Icon name="clipboard-list" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>View My Orders</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Icon name="home" size={20} color="#C9A86A" />
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            Need help with your order?
          </Text>
          <TouchableOpacity 
            style={styles.helpLink}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <Text style={styles.helpLinkText}>Contact Support</Text>
            <Icon name="arrow-right" size={16} color="#C9A86A" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f3ef',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  orderInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C9A86A',
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: '#999',
  },
  billReady: {
    paddingVertical: 8,
  },
  billPreview: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  billPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  billDate: {
    fontSize: 12,
    color: '#888',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  billItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  billItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  billItemMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  billItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  billSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billSummaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  billSummaryValue: {
    fontSize: 13,
    color: '#666',
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#C9A86A',
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#C9A86A',
  },
  billReadyIcon: {
    marginBottom: 12,
  },
  billReadyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 20,
  },
  downloadButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  downloadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  billPending: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  billPendingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C9A86A',
    gap: 6,
  },
  retryText: {
    color: '#C9A86A',
    fontWeight: '600',
  },
  packagingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  packagingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  packagingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  packagingProduct: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 12,
  },
  packagingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  packagingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C9A86A',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C9A86A',
    backgroundColor: '#fff',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#C9A86A',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C9A86A',
  },
});

export default OrderConfirmationScreen;
