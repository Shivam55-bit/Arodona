import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { registerUser } from '../services/authApi';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (fullName === '' || email === '' || phone === '' || password === '' || confirmPassword === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please accept Terms & Conditions');
      return;
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    setLoading(true);
    try {
      const result = await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password,
      });
      
      if (result.success) {
        Alert.alert(
          'Success',
          result.message || 'Account created successfully! Please login.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.message || 'Could not create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* Welcome Text */}
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Our Exclusive Collection</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Full Name Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputContainer}>
              <Icon name="account-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#666"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#666"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.inputContainer}>
              <Icon name="phone-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your phone number"
                placeholderTextColor="#666"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                placeholder="Create password"
                placeholderTextColor="#666"
                style={styles.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-check-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#666"
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icon 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity 
            style={styles.termsContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            activeOpacity={0.8}
          >
            <Icon 
              name={agreeToTerms ? "checkbox-marked" : "checkbox-blank-outline"} 
              size={22} 
              color={agreeToTerms ? "#D4AF37" : "#888"} 
            />
            <Text style={styles.termsText}>
              I agree to <Text style={styles.termsLink}>Terms & Conditions</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={[styles.signupBtn, loading && styles.signupBtnDisabled]} 
            onPress={handleSignup} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1a1a1a" />
            ) : (
              <>
                <Text style={styles.signupText}>CREATE ACCOUNT</Text>
                <Icon name="arrow-right" size={20} color="#000" style={styles.arrowIcon} />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign Up Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialBtn} 
              onPress={() => Alert.alert('Google Sign Up', 'Feature coming soon')}
              activeOpacity={0.8}
            >
              <Icon name="google" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialBtn} 
              onPress={() => Alert.alert('Apple Sign Up', 'Feature coming soon')}
              activeOpacity={0.8}
            >
              <Icon name="apple" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginLabel}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: '#1a1a1a',
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(25),
    alignItems: 'center',
  },
  title: {
    fontSize: isTablet ? moderateScale(26) : moderateScale(22),
    fontWeight: '200',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: verticalScale(6),
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: moderateScale(10),
    color: '#D4AF37',
    textAlign: 'center',
    letterSpacing: 2.5,
    fontWeight: '400',
  },
  formSection: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: moderateScale(35),
    borderTopRightRadius: moderateScale(35),
    paddingHorizontal: scale(28),
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(25),
    flex: 1,
  },
  inputWrapper: {
    marginBottom: verticalScale(14),
  },
  label: {
    fontSize: moderateScale(10),
    color: '#888',
    marginBottom: verticalScale(10),
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(18),
    height: verticalScale(50),
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  inputIcon: {
    marginRight: scale(12),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(15),
    color: '#000',
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
    marginBottom: verticalScale(20),
  },
  termsText: {
    fontSize: moderateScale(13),
    color: '#666',
    marginLeft: scale(10),
  },
  termsLink: {
    color: '#D4AF37',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signupBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(10),
    elevation: 8,
  },
  signupBtnDisabled: {
    opacity: 0.6,
  },
  signupText: {
    color: '#1a1a1a',
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  arrowIcon: {
    marginLeft: scale(8),
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ECECEC',
  },
  dividerText: {
    marginHorizontal: scale(18),
    fontSize: moderateScale(12),
    color: '#AAA',
    fontWeight: '500',
    letterSpacing: 1.5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(16),
    marginBottom: verticalScale(16),
  },
  socialBtn: {
    width: moderateScale(54),
    height: moderateScale(54),
    borderRadius: moderateScale(27),
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(8),
    elevation: 5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  loginLabel: {
    fontSize: moderateScale(15),
    color: '#777',
    fontWeight: '400',
  },
  loginLink: {
    fontSize: moderateScale(15),
    color: '#D4AF37',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
