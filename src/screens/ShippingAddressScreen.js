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
import { getAddresses, deleteAddress, setDefaultAddress } from '../services';

const ShippingAddressScreen = ({ navigation }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      console.log('Addresses fetched:', data);
      
      const addressList = Array.isArray(data) ? data : [];
      setAddresses(addressList);
      
      // Auto-select default address
      const defaultAddr = addressList.find(addr => addr.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  };

  const handleAddAddress = () => {
    navigation.navigate('AddAddress', {
      onAddressAdded: fetchAddresses
    });
  };

  const handleEditAddress = (addressData) => {
    navigation.navigate('EditAddress', {
      address: addressData,
      onAddressUpdated: fetchAddresses
    });
  };

  const handleDeleteAddress = async (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(addressId);
              Alert.alert('Success', 'Address deleted successfully');
              fetchAddresses();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete address');
            }
          }
        },
      ]
    );
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      Alert.alert('Success', 'Default address updated');
      fetchAddresses();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to set default address');
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
        <Text style={styles.headerTitle}>Shipping Address</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Addresses List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="map-marker-off" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>No Addresses Found</Text>
          <Text style={styles.emptyText}>
            Add a shipping address to continue
          </Text>
          <TouchableOpacity 
            style={styles.addFirstBtn}
            onPress={handleAddAddress}
          >
            <Icon name="plus" size={20} color="#1a1a1a" />
            <Text style={styles.addFirstBtnText}>Add Address</Text>
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
          {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressLabelContainer}>
                <View style={styles.labelBadge}>
                  <Icon 
                    name={address.address_type === 'HOME' ? 'home' : 'office-building'} 
                    size={14} 
                    color="#D4AF37" 
                  />
                  <Text style={styles.labelText}>
                    {address.address_type || address.name}
                  </Text>
                </View>
                {address.is_default && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.radioBtn}
                onPress={() => setSelectedAddress(address.id)}
              >
                <Icon
                  name={selectedAddress === address.id ? 'radiobox-marked' : 'radiobox-blank'}
                  size={24}
                  color={selectedAddress === address.id ? '#D4AF37' : '#CCC'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.addressName}>{address.name}</Text>
            <Text style={styles.addressText}>{address.address}</Text>
            <Text style={styles.addressText}>
              {address.city}, {address.country}
            </Text>
            <View style={styles.phoneContainer}>
              <Icon name="phone" size={14} color="#666" />
              <Text style={styles.phoneText}>{address.phone}</Text>
            </View>

            <View style={styles.addressActions}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleEditAddress(address)}
              >
                <Icon name="pencil-outline" size={18} color="#D4AF37" />
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
              {!address.is_default && (
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => handleSetDefault(address.id)}
                >
                  <Icon name="star-outline" size={18} color="#4CAF50" />
                  <Text style={[styles.actionBtnText, { color: '#4CAF50' }]}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => handleDeleteAddress(address.id)}
              >
                <Icon name="delete-outline" size={18} color="#FF5252" />
                <Text style={[styles.actionBtnText, { color: '#FF5252' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          ))}

          {/* Add New Address Button */}
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={handleAddAddress}
            activeOpacity={0.8}
          >
            <Icon name="plus-circle" size={24} color="#D4AF37" />
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Save & Continue</Text>
          <Icon name="arrow-right" size={20} color="#1a1a1a" />
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  addressCard: {
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  radioBtn: {
    padding: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D4AF37',
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D4AF37',
  },
  bottomContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
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

export default ShippingAddressScreen;
