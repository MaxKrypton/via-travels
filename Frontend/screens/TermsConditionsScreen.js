import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity
  } from "react-native";
  import React from "react";
  import { useNavigation } from "@react-navigation/native";
  import Ionicons from "@expo/vector-icons/Ionicons";
  
  const TermsConditionsScreen = () => {
    const navigation = useNavigation();
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={{ width: 24 }} />
        </View>
  
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.section}>
            <Text style={styles.lastUpdated}>Last Updated: May 10, 2025</Text>
            
            <Text style={styles.introText}>
              Please read these Terms and Conditions ("Terms", "Terms and Conditions") 
              carefully before using the Via Travels mobile application (the "Service") 
              operated by Via Travels Inc. ("us", "we", or "our").
            </Text>
            
            <Text style={styles.introText}>
              Your access to and use of the Service is conditioned upon your acceptance 
              of and compliance with these Terms. These Terms apply to all visitors, 
              users, and others who wish to access or use the Service.
            </Text>
            
            <Text style={styles.introText}>
              By accessing or using the Service, you agree to be bound by these Terms. 
              If you disagree with any part of the terms, you do not have permission to 
              access the Service.
            </Text>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>1. Use of the Service</Text>
              <Text style={styles.termContent}>
                Via Travels provides a platform for users to search, book, and manage 
                travel accommodations. You are responsible for maintaining the confidentiality 
                of your account and password, including but not limited to restricting access 
                to your computer and/or account. You agree to accept responsibility for any 
                and all activities or actions that occur under your account and/or password.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>2. Booking and Reservations</Text>
              <Text style={styles.termContent}>
                2.1. All bookings made through the Service are subject to availability and 
                confirmation by the respective hotel or accommodation provider.
              </Text>
              <Text style={styles.termContent}>
                2.2. Pricing displayed on the Service is subject to change without notice 
                until confirmation of booking.
              </Text>
              <Text style={styles.termContent}>
                2.3. You agree to provide accurate and complete information when making a 
                reservation through our Service.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>3. Cancellations and Refunds</Text>
              <Text style={styles.termContent}>
                3.1. Cancellation policies vary by accommodation provider and are clearly 
                displayed at the time of booking.
              </Text>
              <Text style={styles.termContent}>
                3.2. Refunds, when applicable, will be processed according to the cancellation 
                policy of the specific booking and may take up to 14 business days to appear 
                on your account.
              </Text>
              <Text style={styles.termContent}>
                3.3. Via Travels reserves the right to cancel reservations in cases of suspected 
                fraud, illegal activity, or violation of these Terms.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>4. User Content</Text>
              <Text style={styles.termContent}>
                4.1. Our Service allows you to post, link, store, share and otherwise make 
                available certain information, text, graphics, videos, or other material ("Content"). 
                You are responsible for the Content that you post on or through the Service, 
                including its legality, reliability, and appropriateness.
              </Text>
              <Text style={styles.termContent}>
                4.2. By posting Content on or through the Service, you represent and warrant that: 
                (i) the Content is yours (you own it) and/or you have the right to use it and the 
                right to grant us the rights and license as provided in these Terms, and (ii) that 
                the posting of your Content on or through the Service does not violate the privacy 
                rights, publicity rights, copyrights, contract rights or any other rights of any person 
                or entity.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>5. Intellectual Property</Text>
              <Text style={styles.termContent}>
                The Service and its original content (excluding Content provided by users), features, 
                and functionality are and will remain the exclusive property of Via Travels Inc. and 
                its licensors. The Service is protected by copyright, trademark, and other laws of 
                both the United States and foreign countries. Our trademarks and trade dress may not 
                be used in connection with any product or service without the prior written consent 
                of Via Travels Inc.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>6. Limitation of Liability</Text>
              <Text style={styles.termContent}>
                In no event shall Via Travels Inc., nor its directors, employees, partners, agents, 
                suppliers, or affiliates, be liable for any indirect, incidental, special, consequential 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from (i) your access to or use of or inability to 
                access or use the Service; (ii) any conduct or content of any third party on the Service; 
                (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration 
                of your transmissions or content, whether based on warranty, contract, tort (including 
                negligence) or any other legal theory, whether or not we have been informed of the possibility 
                of such damage.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>7. Governing Law</Text>
              <Text style={styles.termContent}>
                These Terms shall be governed and construed in accordance with the laws of United States, 
                without regard to its conflict of law provisions. Our failure to enforce any right or 
                provision of these Terms will not be considered a waiver of those rights.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>8. Changes to Terms</Text>
              <Text style={styles.termContent}>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will provide at least 30 days' notice prior to any new terms 
                taking effect. What constitutes a material change will be determined at our sole discretion.
              </Text>
            </View>
            
            <View style={styles.termsSection}>
              <Text style={styles.termTitle}>9. Contact Us</Text>
              <Text style={styles.termContent}>
                If you have any questions about these Terms, please contact us at legal@viatravels.com.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f8f9fa",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#e1e4e8",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
    },
    scrollContainer: {
      flex: 1,
    },
    section: {
      backgroundColor: "white",
      margin: 16,
      padding: 16,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    lastUpdated: {
      fontSize: 14,
      color: "#777",
      marginBottom: 16,
      fontStyle: "italic",
    },
    introText: {
      fontSize: 16,
      color: "#333",
      lineHeight: 24,
      marginBottom: 16,
    },
    termsSection: {
      marginTop: 16,
      marginBottom: 24,
    },
    termTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#333",
      marginBottom: 8,
    },
    termContent: {
      fontSize: 16,
      color: "#333",
      lineHeight: 24,
      marginBottom: 8,
    },
  });
  
  export default TermsConditionsScreen;