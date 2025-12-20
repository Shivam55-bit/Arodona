import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { changePassword } from '../services/profileApi';

const ChangePasswordScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const validateForm = () => {
    if (!formData.current_password) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }
    if (!formData.new_password) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }
    if (formData.new_password.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }
    if (formData.current_password === formData.new_password) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Password changed successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', error?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="information-outline" size={24} color="#D4AF37" />
          <Text style={styles.infoText}>
            For security, please enter your current password to set a new one.
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password *</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={formData.current_password}
                onChangeText={(text) => updateField('current_password', text)}
                placeholder="Enter current password"
                placeholderTextColor="#CCC"
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => toggleShowPassword('current')}
                style={styles.eyeBtn}
              >
                <Icon 
                  name={showPasswords.current ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password *</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={formData.new_password}
                onChangeText={(text) => updateField('new_password', text)}
                placeholder="Enter new password"
                placeholderTextColor="#CCC"
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => toggleShowPassword('new')}
                style={styles.eyeBtn}
              >
                <Icon 
                  name={showPasswords.new ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Password must be at least 6 characters
            </Text>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password *</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-check-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={formData.confirm_password}
                onChangeText={(text) => updateField('confirm_password', text)}
                placeholder="Re-enter new password"
                placeholderTextColor="#CCC"
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => toggleShowPassword('confirm')}
                style={styles.eyeBtn}
              >
                <Icon 
                  name={showPasswords.confirm ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementItem}>
              <Icon 
                name={formData.new_password.length >= 6 ? "check-circle" : "circle-outline"} 
                size={16} 
                color={formData.new_password.length >= 6 ? "#4CAF50" : "#999"} 
              />
              <Text style={styles.requirementText}>At least 6 characters</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon 
                name={formData.new_password === formData.confirm_password && formData.new_password ? "check-circle" : "circle-outline"} 
                size={16} 
                color={formData.new_password === formData.confirm_password && formData.new_password ? "#4CAF50" : "#999"} 
              />
              <Text style={styles.requirementText}>Passwords match</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleChangePassword}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <Text style={styles.saveBtnText}>Update Password</Text>
          )}
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
    backgroundColor: '#1a1a1a',
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
    color: '#FFF',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  eyeBtn: {
    padding: 8,
  },
  helperText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
  requirementsBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
  },
  bottomContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
});

export default ChangePasswordScreen;
