import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useState, useContext, useCallback } from "react"
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AuthContext from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { CurrencySelector } from "../components/CurrencySelector";
import apiService from "../services/api";
import axios from "axios";
import { Alert } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from '@expo/vector-icons/Entypo';
import Octicons from '@expo/vector-icons/Octicons';
import WelcomeScreen from "./WelcomeScreen";

const normalizeProfile = (profile = {}) => ({
  first_name: profile.first_name || profile.firstName || "",
  last_name: profile.last_name || profile.lastName || "",
  avatar_url: profile.avatar_url || profile.avatarUrl || null,
});

const ProfileScreen = () => {
  const { user, isAuthenticated, logout, authToken, ip, updateUser, setAuthRedirectScreen } = useContext(AuthContext);
  const { selectedCurrency, getCurrencySymbol } = useCurrency();
  const navigation = useNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [profile, setProfile] = useState(() => normalizeProfile(user));

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProfile = async () => {
        if (!isAuthenticated) return;

        try {
          const response = await apiService.profile.getMe();
          const profileData = normalizeProfile(response.data?.data || {});

          if (isActive) {
            setProfile(profileData);
          }

          if (user && updateUser) {
            await updateUser({ ...user, ...profileData });
          }
        } catch (error) {
          console.warn('Could not refresh profile:', error.response?.data?.message || error.message);
        }
      };

      fetchProfile();

      return () => {
        isActive = false;
      };
    }, [isAuthenticated, user?.id])
  );

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user?.username || "Welcome User";
  const avatarUrl = profile.avatar_url || user?.avatar_url || user?.avatarUrl;

  const handleLogOut = async () => {
    try {
      setIsLoggingOut(true);

      // Call backend logout endpoint with token
      try {
        await axios.post(
          `http://${ip}:8000/api/v1/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        console.log('✅ Logout API call successful');
      } catch (apiError) {
        console.warn('⚠️ Logout API call failed (continuing with local logout):', apiError.message);
        // Continue with local logout even if API fails
      }

      // Clear local auth state
      await logout();

      // Navigate to Welcome screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });

    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, try to clear local state
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const performDeleteAccount = async () => {
    if (isDeletingAccount) return;

    try {
      setIsDeletingAccount(true);
      await apiService.auth.deleteAccount();
      setAuthRedirectScreen?.("SignIn");
      await logout();
    } catch (error) {
      console.error("❌ Delete account error:", error);
      Alert.alert(
        "Delete Failed",
        error.response?.data?.message || "We could not delete your account right now. Please try again."
      );
      setIsDeletingAccount(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your Via Travels account and sign you out. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: performDeleteAccount,
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <Modal visible={!isAuthenticated} animationType="slide">
        <WelcomeScreen />
      </Modal>
    );
  } else {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1995AD" />
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.statusBarSpacer} />
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={avatarUrl ? { uri: avatarUrl } : require("../assets/images/me.jpg")}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {displayName}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || "No email found"}
              </Text>
              
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate("Personal Info")}
              >
                <MaterialIcons name="edit" size={16} color="white" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <SafeAreaView style={styles.contentArea}>
            {/* Itinerary Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Itineraries</Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  icon={<MaterialCommunityIcons name="map-clock" size={22} color="#1995AD" />}
                  title="Saved Itineraries"
                  subtitle="View your saved trip plans"
                  onPress={() => navigation.navigate("Saved Itineraries")}
                  showBorder={false}
                />
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  icon={<FontAwesome6 name="user-large" size={20} color="#1995AD" />}
                  title="Edit Profile"
                  onPress={() => navigation.navigate("Personal Info")}
                />
                <MenuItem
                  icon={<MaterialCommunityIcons name="security" size={22} color="#1995AD" />}
                  title="Security"
                  onPress={() => navigation.navigate("Security")}
                />
                <MenuItem
                  icon={<MaterialIcons name="privacy-tip" size={22} color="#1995AD" />}
                  title="Privacy"
                  onPress={() => navigation.navigate("Privacy")}
                />
                <MenuItem
                  icon={
                    isDeletingAccount ? (
                      <ActivityIndicator size="small" color="#FF3B30" />
                    ) : (
                      <MaterialIcons name="delete-forever" size={22} color="#FF3B30" />
                    )
                  }
                  title={isDeletingAccount ? "Deleting Account..." : "Delete Account"}
                  subtitle="Permanently remove your account data"
                  onPress={handleDeleteAccount}
                  showBorder={false}
                  danger
                  disabled={isDeletingAccount}
                />
              </View>
            </View>

            {/* Preferences Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  icon={<MaterialIcons name="attach-money" size={22} color="#1995AD" />}
                  title="Currency"
                  subtitle={`${getCurrencySymbol()} ${selectedCurrency}`}
                  onPress={() => setShowCurrencyPicker(true)}
                />
                <MenuItem
                  icon={<Ionicons name="notifications" size={22} color="#1995AD" />}
                  title="Notifications"
                  subtitle="Manage notification settings"
                  onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon!')}
                />
                <MenuItem
                  icon={<Entypo name="language" size={20} color="#1995AD" />}
                  title="Language"
                  subtitle="English (US)"
                  onPress={() => Alert.alert('Coming Soon', 'Language settings coming soon!')}
                  showBorder={false}
                />
              </View>
            </View>

            <CurrencySelector
              visible={showCurrencyPicker}
              onClose={() => setShowCurrencyPicker(false)}
            />

            {/* Support & About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support & About</Text>
              <View style={styles.menuContainer}>
                <MenuItem
                  icon={<Entypo name="help" size={20} color="#1995AD" />}
                  title="Help & Support"
                  onPress={() => navigation.navigate("HelpSupport")}
                />
                <MenuItem
                  icon={<MaterialIcons name="policy" size={22} color="#1995AD" />}
                  title="Terms & Conditions"
                  onPress={() => navigation.navigate("TermsCondition")}
                />
                <MenuItem
                  icon={<Octicons name="report" size={20} color="#1995AD" />}
                  title="Report a Problem"
                  onPress={() => navigation.navigate("ReportProblem")}
                  showBorder={false}
                />
              </View>
            </View>

            {/* App Info */}
            <View style={styles.appInfoSection}>
              <Text style={styles.appVersion}>Version 1.2.3</Text>
              <Text style={styles.appName}>ViaTravel</Text>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
              onPress={handleLogOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <ActivityIndicator color="white" size={20} />
                  <Text style={styles.logoutButtonText}>Logging Out...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="logout" size={20} color="white" />
                  <Text style={styles.logoutButtonText}>Log Out</Text>
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.bottomSpacing} />
          </SafeAreaView>
        </ScrollView>
      </View>
    );
  }
};

// Reusable MenuItem Component
const MenuItem = ({ icon, title, subtitle, onPress, showBorder = true, danger = false, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        showBorder && styles.menuItemBorder,
        disabled && styles.menuItemDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
          {icon}
        </View>
        <View style={styles.menuItemTextContainer}>
          <Text style={[styles.menuItemText, danger && styles.dangerMenuItemText]}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={danger ? "#FF3B30" : "#8E8E93"} />
    </TouchableOpacity>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1995AD",
  },
  headerSection: {
    backgroundColor: "#1995AD",
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "white",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    backgroundColor: "#34C759",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "white",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 15,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  contentArea: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 25,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 12,
    marginLeft: 5,
  },
  menuContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(25, 149, 173, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  dangerMenuItemText: {
    color: "#FF3B30",
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  appInfoSection: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1995AD",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF3B30",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#FF3B30",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 30,
  },
});
