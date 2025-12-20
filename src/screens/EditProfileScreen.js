import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getUserProfile, updateUserProfile, updateUserAvatar } from '../services/profileApi';

const EditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: null,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Try to get from AsyncStorage first
      const storedData = await AsyncStorage.getItem('user_data');
      if (storedData) {
        const userData = JSON.parse(storedData);
        const firstName = userData.first_name || '';
        const lastName = userData.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        setFormData({
          fullName: fullName || userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || null,
        });
        setLoading(false);
        return;
      }

      // If not in storage, try API (may fail)
      const result = await getUserProfile();
      if (result.success) {
        const firstName = result.user.first_name || '';
        const lastName = result.user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        setFormData({
          fullName: fullName,
          email: result.user.email || '',
          phone: result.user.phone || '',
          avatar: result.user.avatar || null,
        });
      }
    } catch (error) {
      console.log('Failed to load profile, using default values');
      // Don't show error to user, just use empty form
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.fullName || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate phone number
    if (formData.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Split full name into first and last name
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setUpdating(true);
    try {
      // Temporarily save locally - Backend API has issues
      const updatedUserData = {
        ...formData,
        first_name: firstName,
        last_name: lastName,
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      // Uncomment when backend API is fixed
      // const profileData = {
      //   first_name: firstName,
      //   last_name: lastName,
      //   phone: formData.phone.trim(),
      // };
      // const result = await updateUserProfile(profileData);
      // if (result.success) {
      //   Alert.alert('Success', 'Profile updated successfully!', [
      //     { text: 'OK', onPress: () => navigation.goBack() }
      //   ]);
      // } else {
      //   Alert.alert('Error', result.message || 'Failed to update profile');
      // }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePhoto = () => {
    const options = [
      {
        text: 'Take Photo',
        onPress: () => openCamera(),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => openGallery(),
      },
    ];

    if (formData.avatar) {
      options.push({
        text: 'Remove Photo',
        onPress: () => removePhoto(),
        style: 'destructive',
      });
    }

    options.push({
      text: 'Cancel',
      style: 'cancel',
    });

    Alert.alert('Change Profile Photo', 'Choose an option', options);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 500,
      maxHeight: 500,
      saveToPhotos: true,
      includeBase64: true,
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to take photo');
        return;
      }
      if (response.assets && response.assets[0]) {
        await uploadPhoto(response.assets[0]);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.5,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to select photo');
        return;
      }
      if (response.assets && response.assets[0]) {
        await uploadPhoto(response.assets[0]);
      }
    });
  };

  const uploadPhoto = async (asset) => {
    try {
      setUpdating(true);
      
      // For now, just update locally - API upload can be implemented later
      // const base64Image = `data:${asset.type};base64,${asset.base64}`;
      
      setFormData({ ...formData, avatar: asset.uri });
      Alert.alert('Success', 'Profile photo updated successfully');
      
      // Uncomment when API supports image upload
      // const result = await updateUserAvatar(base64Image);
      // if (result.success) {
      //   setFormData({ ...formData, avatar: asset.uri });
      //   Alert.alert('Success', 'Profile photo updated successfully');
      // } else {
      //   Alert.alert('Error', result.message || 'Failed to update photo');
      // }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUpdating(false);
    }
  };

  const removePhoto = async () => {
    try {
      setUpdating(true);
      
      setFormData({ ...formData, avatar: null });
      Alert.alert('Success', 'Profile photo removed');
      
      // Uncomment when API supports image removal
      // const result = await updateUserAvatar('');
      // if (result.success) {
      //   setFormData({ ...formData, avatar: null });
      //   Alert.alert('Success', 'Profile photo removed');
      // } else {
      //   Alert.alert('Error', result.message || 'Failed to remove photo');
      // }
    } catch (error) {
      console.error('Remove photo error:', error);
      Alert.alert('Error', 'Failed to remove photo');
    } finally {
      setUpdating(false);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#D4AF37" style={{ marginVertical: 30 }} />
          ) : (
            <>
              <View style={styles.avatarContainer}>
                {formData.avatar ? (
                  <Image
                    source={{ uri: formData.avatar }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitials}>
                      {formData.fullName?.trim().split(' ').map(n => n.charAt(0)).slice(0, 2).join('')}
                    </Text>
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.changePhotoBtn}
                  onPress={handleChangePhoto}
                >
                  <Icon name="camera" size={20} color="#1a1a1a" />
                </TouchableOpacity>
              </View>
              <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </>
          )}
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => updateField('fullName', text)}
                placeholder="Enter your full name"
                placeholderTextColor="#CCC"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Icon name="email-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={formData.email}
                placeholder="Enter your email"
                placeholderTextColor="#CCC"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <Icon name="phone-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#CCC"
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Change Password */}
          <TouchableOpacity 
            style={styles.changePasswordBtn}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Icon name="lock-reset" size={20} color="#D4AF37" />
            <Text style={styles.changePasswordText}>Change Password</Text>
            <Icon name="chevron-right" size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveBtn, (loading || updating) && styles.saveBtnDisabled]}
          onPress={handleUpdate}
          activeOpacity={0.8}
          disabled={loading || updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#1a1a1a" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
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
  photoSection: {
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  avatarPlaceholder: {
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  changePhotoBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  changePhotoText: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '500',
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
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
  disabledInput: {
    backgroundColor: '#F8F8F8',
    opacity: 0.7,
  },
  helperText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    marginLeft: 4,
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D4AF37',
    gap: 10,
  },
  changePasswordText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#D4AF37',
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

export default EditProfileScreen;
