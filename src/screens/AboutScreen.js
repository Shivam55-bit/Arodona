import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AboutScreen = ({ navigation }) => {
  const socialLinks = [
    {
      id: '1',
      name: 'Facebook',
      icon: 'facebook',
      color: '#1877F2',
      url: 'https://facebook.com',
    },
    {
      id: '2',
      name: 'Instagram',
      icon: 'instagram',
      color: '#E4405F',
      url: 'https://instagram.com',
    },
    {
      id: '3',
      name: 'Twitter',
      icon: 'twitter',
      color: '#1DA1F2',
      url: 'https://twitter.com',
    },
    {
      id: '4',
      name: 'LinkedIn',
      icon: 'linkedin',
      color: '#0A66C2',
      url: 'https://linkedin.com',
    },
  ];

  const features = [
    {
      id: '1',
      icon: 'diamond-stone',
      title: 'Premium Quality',
      description: 'Handcrafted jewellery with finest materials',
    },
    {
      id: '2',
      icon: 'shield-check',
      title: 'Certified Products',
      description: 'All products are certified and authentic',
    },
    {
      id: '3',
      icon: 'truck-delivery',
      title: 'Fast Delivery',
      description: 'Quick and secure delivery to your doorstep',
    },
    {
      id: '4',
      icon: 'refresh',
      title: 'Easy Returns',
      description: '7-day hassle-free return policy',
    },
  ];

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
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Logo & Info */}
        <View style={styles.brandSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>ARODONA</Text>
          <Text style={styles.tagline}>Timeless Elegance in Every Piece</Text>
          
          <Text style={styles.description}>
            Arodona is your trusted destination for premium jewellery. We blend
            traditional craftsmanship with contemporary designs to create pieces
            that tell your unique story. Each item is carefully selected and
            crafted to bring you the finest quality and timeless beauty.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>WHY CHOOSE US</Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <View key={feature.id} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Icon name={feature.icon} size={28} color="#D4AF37" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.sectionTitle}>CONNECT WITH US</Text>
          
          <View style={styles.socialLinks}>
            {socialLinks.map((social) => (
              <TouchableOpacity
                key={social.id}
                style={[styles.socialBtn, { backgroundColor: social.color }]}
                onPress={() => Linking.openURL(social.url)}
                activeOpacity={0.8}
              >
                <Icon name={social.icon} size={24} color="#FFF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>100</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated</Text>
            <Text style={styles.infoValue}>Nov 13, 2025</Text>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Terms & Conditions</Text>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalText}>Return & Refund Policy</Text>
            <Icon name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2025 Arodona. All rights reserved.
        </Text>
      </ScrollView>
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
  brandSection: {
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  brandLogo: {
    width: 100,
    height: 100,
    tintColor: '#D4AF37',
    marginBottom: 20,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '300',
    color: '#D4AF37',
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#AAA',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  socialSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  infoSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  legalSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  legalLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  legalText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default AboutScreen;
