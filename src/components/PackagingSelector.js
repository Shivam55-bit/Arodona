import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPackagingOptions, DEFAULT_PACKAGING_OPTIONS } from '../services/packagingService';

/**
 * Packaging Selector Component
 * User product buy karte time packaging select kar sakta hai
 * 
 * Props:
 * - selectedPackaging: Currently selected packaging
 * - onPackagingSelect: Callback when packaging is selected
 * - style: Optional container style
 */
const PackagingSelector = ({ selectedPackaging, onPackagingSelect, style }) => {
  const [packagingOptions, setPackagingOptions] = useState(DEFAULT_PACKAGING_OPTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackagingOptions();
  }, []);

  const fetchPackagingOptions = async () => {
    try {
      const result = await getPackagingOptions();
      if (result.success && result.data) {
        setPackagingOptions(result.data);
      }
    } catch (error) {
      console.log('Using default packaging options');
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (packagingName) => {
    const iconMap = {
      'Box': 'package-variant',
      'Bag': 'shopping',
      'Polythene': 'package-variant-closed',
      'Pouch': 'wallet',
      'Gift Wrap': 'gift',
    };
    return iconMap[packagingName] || 'package';
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color="#C9A86A" />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Icon name="package-variant" size={22} color="#C9A86A" />
        <Text style={styles.title}>Select Packaging</Text>
      </View>
      <Text style={styles.subtitle}>How would you like your product packed?</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {packagingOptions.map((option) => {
          const isSelected = selectedPackaging === option.name;
          return (
            <TouchableOpacity
              key={option.id || option.name}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onPackagingSelect(option.name)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isSelected && styles.iconContainerSelected,
              ]}>
                <Text style={styles.emoji}>{option.icon || '📦'}</Text>
              </View>
              <Text style={[
                styles.optionName,
                isSelected && styles.optionNameSelected,
              ]}>
                {option.name}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Icon name="check-circle" size={18} color="#C9A86A" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {selectedPackaging && (
        <View style={styles.selectedInfo}>
          <Icon name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.selectedText}>
            Selected: {selectedPackaging}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    marginLeft: 30,
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  option: {
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#eee',
    minWidth: 85,
    backgroundColor: '#fafafa',
  },
  optionSelected: {
    borderColor: '#C9A86A',
    backgroundColor: '#FFF9F0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainerSelected: {
    backgroundColor: '#FFF3E0',
  },
  emoji: {
    fontSize: 24,
  },
  optionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  optionNameSelected: {
    color: '#C9A86A',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default PackagingSelector;
