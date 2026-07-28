import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Via Travels — Privacy Policy
// A readable policy document (separate from the Privacy *Settings* screen).
// This is the page to navigate to and walk through in the assessment video.
// Written in line with Rwanda's Law No. 058/2021 on the protection of
// personal data and privacy (consent, data localization, retention, rights).
// NOTE: Replace the contact email below with your real project contact.

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last updated: July 2026</Text>

          <Text style={styles.introText}>
            This Privacy Policy explains what personal data Via Travels collects,
            why we collect it, and the choices you have. We handle your data in
            line with Rwanda's Law No. 058/2021 relating to the protection of
            personal data and privacy.
          </Text>

          {/* 1 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>1. Information We Collect</Text>
            <Text style={styles.termContent}>
              1.1. Account information: your email address and password (stored
              securely).
            </Text>
            <Text style={styles.termContent}>
              1.2. Trip preferences: travel dates, budget range, group size, and
              interests, which you enter to generate an itinerary.
            </Text>
            <Text style={styles.termContent}>
              1.3. Saved itineraries and any feedback you choose to submit.
            </Text>
            <Text style={styles.termContent}>
              1.4. We do NOT collect payment or banking details, and we do NOT
              sell your data to anyone.
            </Text>
          </View>

          {/* 2 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>2. How We Use Your Data</Text>
            <Text style={styles.termContent}>
              We use your preferences to generate personalised Rwanda itineraries,
              to let you save and revisit them, and to improve the app. Where the
              app is used for research or usability testing, responses are kept
              anonymous and are not linked to you in any results.
            </Text>
          </View>

          {/* 3 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>3. Consent</Text>
            <Text style={styles.termContent}>
              We process your personal data based on your consent, which you give
              when you create an account and use the app. You can withdraw your
              consent at any time by deleting your account, and you may take part
              in any testing entirely voluntarily.
            </Text>
          </View>

          {/* 4 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>4. Sharing With Third Parties</Text>
            <Text style={styles.termContent}>
              4.1. To create your itinerary, your trip preferences are sent to a
              third-party AI (large language model) service. We send only the
              information needed to generate the plan and avoid including details
              that could identify you personally.
            </Text>
            <Text style={styles.termContent}>
              4.2. We do not share your data with advertisers and we do not sell
              it.
            </Text>
          </View>

          {/* 5 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>5. Where Your Data Is Stored</Text>
            <Text style={styles.termContent}>
              Account data and itineraries are stored in a secured cloud database.
              Under Law No. 058/2021, personal data relating to people in Rwanda
              should be stored in Rwanda unless the National Cyber Security
              Authority (NCSA) authorises storage elsewhere. We take this
              requirement into account when configuring where data is held.
            </Text>
          </View>

          {/* 6 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>6. How Long We Keep It</Text>
            <Text style={styles.termContent}>
              We keep your data only for as long as it is needed for the purpose
              it was collected. Data gathered for research or usability testing is
              anonymised and destroyed once the analysis is complete.
            </Text>
          </View>

          {/* 7 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>7. Your Rights</Text>
            <Text style={styles.termContent}>
              You have the right to access the personal data we hold about you, to
              correct it, to request its deletion, and to withdraw your consent.
              You can request account deletion from within the app's privacy
              settings.
            </Text>
          </View>

          {/* 8 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>8. Security</Text>
            <Text style={styles.termContent}>
              We protect your account using secure login tokens (JWT) and
              encrypted connections between the app and our servers. No system is
              perfectly secure, but we take reasonable steps to keep your data
              safe.
            </Text>
          </View>

          {/* 9 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>9. Children</Text>
            <Text style={styles.termContent}>
              Via Travels is intended for adult travellers and is not directed at
              children. We do not knowingly collect data from children.
            </Text>
          </View>

          {/* 10 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>10. Changes to This Policy</Text>
            <Text style={styles.termContent}>
              We may update this Policy as the app develops. If a change is
              significant, we will notify you in the app.
            </Text>
          </View>

          {/* 11 */}
          <View style={styles.termsSection}>
            <Text style={styles.termTitle}>11. Contact Us</Text>
            <Text style={styles.termContent}>
              For any privacy question or request, contact us at
              privacy@viatravels.rw (Kigali, Rwanda).
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

export default PrivacyPolicyScreen;