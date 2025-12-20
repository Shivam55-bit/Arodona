import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { loginUser } from '../services/authApi';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isTablet = width >= 768;

const LoginScreen = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = async () => {
    if (loginMethod === 'email') {
      if (email === '' || password === '') {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      setLoading(true);
      try {
        const result = await loginUser({ email, password });
        
        if (result.success) {
          Alert.alert(
            'Success',
            `Welcome back, ${result.user.first_name}!`,
            [
              {
                text: 'OK',
                onPress: () => navigation.replace('Main'),
              },
            ]
          );
        } else {
          Alert.alert('Login Failed', result.message || 'Invalid credentials');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Phone OTP login
      if (!otpSent) {
        if (phone === '') {
          Alert.alert('Error', 'Please enter your phone number');
          return;
        }
        // TODO: Send OTP API call
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Please check your phone for the OTP code');
      } else {
        if (otp === '') {
          Alert.alert('Error', 'Please enter the OTP');
          return;
        }
        // TODO: Verify OTP API call
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          Alert.alert('Success', 'Login successful!', [
            { text: 'OK', onPress: () => navigation.replace('Main') }
          ]);
        }, 1000);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Top Decorative Section */}
        <View style={styles.topSection}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Welcome Text */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Timeless Elegance Awaits</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Login Method Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'email' && styles.activeTab]}
              onPress={() => {
                setLoginMethod('email');
                setOtpSent(false);
              }}
              activeOpacity={0.8}
            >
              <Icon 
                name="email-outline" 
                size={20} 
                color={loginMethod === 'email' ? '#D4AF37' : '#999'} 
              />
              <Text style={[styles.tabText, loginMethod === 'email' && styles.activeTabText]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, loginMethod === 'phone' && styles.activeTab]}
              onPress={() => {
                setLoginMethod('phone');
                setOtpSent(false);
              }}
              activeOpacity={0.8}
            >
              <Icon 
                name="phone-outline" 
                size={20} 
                color={loginMethod === 'phone' ? '#D4AF37' : '#999'} 
              />
              <Text style={[styles.tabText, loginMethod === 'phone' && styles.activeTabText]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {loginMethod === 'email' ? (
            <>
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

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={styles.inputContainer}>
                  <Icon name="lock-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter your password"
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

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={() => Alert.alert('Forgot Password', 'Feature coming soon')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Phone Number Input */}
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
                    editable={!otpSent}
                  />
                </View>
              </View>

              {/* OTP Input (shown after OTP is sent) */}
              {otpSent && (
                <View style={styles.inputWrapper}>
                  <View style={styles.otpHeader}>
                    <Text style={styles.label}>ENTER OTP</Text>
                    <TouchableOpacity onPress={() => setOtpSent(false)}>
                      <Text style={styles.changeNumberText}>Change Number</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#666"
                      style={styles.input}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  <TouchableOpacity style={styles.resendButton}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Sign In Button */}
          <TouchableOpacity 
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]} 
            onPress={handleLogin} 
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1a1a1a" />
            ) : (
              <>
                <Text style={styles.loginText}>
                  {loginMethod === 'phone' && !otpSent ? 'SEND OTP' : 'SIGN IN'}
                </Text>
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

          {/* Social Sign In Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialBtn} 
              onPress={() => Alert.alert('Google Sign In', 'Feature coming soon')}
              activeOpacity={0.8}
            >
              <Icon name="google" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialBtn} 
              onPress={() => Alert.alert('Apple Sign In', 'Feature coming soon')}
              activeOpacity={0.8}
            >
              <Icon name="apple" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupLabel}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create Account</Text>
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
    paddingTop: verticalScale(45),
    paddingBottom: verticalScale(25),
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  logo: {
    width: isTablet ? moderateScale(100) : moderateScale(80),
    height: isTablet ? moderateScale(100) : moderateScale(80),
    tintColor: '#D4AF37',
  },
  brandName: {
    fontSize: isTablet ? moderateScale(32) : moderateScale(28),
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 4,
    marginBottom: verticalScale(15),
  },
  brandLine: {
    width: scale(80),
    height: 1,
    backgroundColor: '#D4AF37',
    marginBottom: verticalScale(30),
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(12),
    padding: scale(4),
    marginBottom: verticalScale(24),
    gap: scale(8),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    gap: scale(8),
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#D4AF37',
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  changeNumberText: {
    fontSize: moderateScale(12),
    color: '#D4AF37',
    fontWeight: '600',
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginTop: verticalScale(8),
  },
  resendText: {
    fontSize: moderateScale(13),
    color: '#D4AF37',
    fontWeight: '600',
  },
  inputWrapper: {
    marginBottom: verticalScale(18),
  },
  label: {
    fontSize: moderateScale(10),
    color: '#888',
    marginBottom: verticalScale(12),
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(18),
    height: verticalScale(56),
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: verticalScale(24),
    marginTop: verticalScale(4),
  },
  forgotText: {
    fontSize: moderateScale(13),
    color: '#D4AF37',
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#D4AF37',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(24),
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.35,
    shadowRadius: moderateScale(12),
    elevation: 10,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginText: {
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
    marginBottom: verticalScale(20),
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
    marginBottom: verticalScale(20),
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(5),
  },
  signupLabel: {
    fontSize: moderateScale(15),
    color: '#777',
    fontWeight: '400',
  },
  signupLink: {
    fontSize: moderateScale(15),
    color: '#D4AF37',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
