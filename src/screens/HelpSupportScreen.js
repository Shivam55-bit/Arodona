import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HelpSupportScreen = ({ navigation }) => {
  const supportOptions = [
    {
      id: '1',
      title: 'Contact Us',
      subtitle: 'Get in touch with our team',
      icon: 'headset',
      iconBg: '#4CAF50',
      onPress: () => Linking.openURL('tel:+919876543210'),
    },
    {
      id: '2',
      title: 'Email Support',
      subtitle: 'support@arodona.com',
      icon: 'email-outline',
      iconBg: '#2196F3',
      onPress: () => Linking.openURL('mailto:support@arodona.com'),
    },
    {
      id: '3',
      title: 'WhatsApp Chat',
      subtitle: 'Chat with us on WhatsApp',
      icon: 'whatsapp',
      iconBg: '#25D366',
      onPress: () => Linking.openURL('https://wa.me/919876543210'),
    },
    {
      id: '4',
      title: 'Live Chat',
      subtitle: 'Chat with our support team',
      icon: 'message-processing',
      iconBg: '#FF9800',
      onPress: () => console.log('Live Chat'),
    },
  ];

  const faqItems = [
    {
      id: '1',
      question: 'How do I track my order?',
      answer: 'Go to My Orders section and click on Track Order button',
    },
    {
      id: '2',
      question: 'What is the return policy?',
      answer: 'You can return items within 7 days of delivery',
    },
    {
      id: '3',
      question: 'How do I cancel my order?',
      answer: 'Go to My Orders and click on Cancel Order button',
    },
    {
      id: '4',
      question: 'Payment methods available?',
      answer: 'We accept Cards, UPI, Net Banking, and COD',
    },
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GET IN TOUCH</Text>
          
          {supportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: option.iconBg }]}>
                <Icon name={option.icon} size={26} color="#FFF" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={22} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
          
          {faqItems.map((faq) => (
            <View key={faq.id} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <Icon name="help-circle" size={20} color="#D4AF37" />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All FAQs</Text>
            <Icon name="arrow-right" size={18} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Working Hours */}
        <View style={styles.infoCard}>
          <Icon name="clock-outline" size={24} color="#D4AF37" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Working Hours</Text>
            <Text style={styles.infoText}>Mon - Sat: 9:00 AM - 6:00 PM</Text>
            <Text style={styles.infoText}>Sunday: Closed</Text>
          </View>
        </View>
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
  optionCard: {
    flexDirection: 'row',
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
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginLeft: 28,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  infoContent: {
    marginLeft: 14,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});

export default HelpSupportScreen;
