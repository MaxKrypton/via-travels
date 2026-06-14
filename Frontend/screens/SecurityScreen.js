import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator
  } from "react-native";
  import React, { useState, useContext } from "react";
  import { useNavigation } from "@react-navigation/native";
  import AuthContext from "../context/AuthContext";
  import MaterialIcons from "@expo/vector-icons/MaterialIcons";
  import Ionicons from "@expo/vector-icons/Ionicons";
  import FontAwesome from "@expo/vector-icons/FontAwesome";
  import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
  
  const SecurityScreen = () => {
    const navigation = useNavigation();
    const { user, ip } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    
    // Password states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    
    // Toggle states
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [saveLoginInfo, setSaveLoginInfo] = useState(true);
  
    const handlePasswordChange = () => {
      // Validate passwords
      if (!currentPassword) {
        Alert.alert("Error", "Please enter your current password");
        return;
      }
      
      if (!newPassword) {
        Alert.alert("Error", "Please enter a new password");
        return;
      }
      
      if (newPassword !== confirmPassword) {
        Alert.alert("Error", "New passwords don't match");
        return;
      }
      
      if (newPassword.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters");
        return;
      }
      
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert("Success", "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1500);
      
      // In a real app, you would make an API call like:
      /*
      const url = `http://${ip}:8000/api/v1/auth/change-password`;
      axios.post(url, {
        userId: user.id,
        currentPassword,
        newPassword
      })
      .then(() => {
        setIsLoading(false);
        Alert.alert("Success", "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch(error => {
        setIsLoading(false);
        Alert.alert("Error", error.response?.data?.message || "Failed to update password");
      });
      */
    };
  
    const toggleTwoFactor = () => {
      setTwoFactorEnabled(!twoFactorEnabled);
      // In a real app, you would also make an API call to update this setting
    };
  
    const toggleBiometric = () => {
      setBiometricEnabled(!biometricEnabled);
      // In a real app, you would also make an API call to update this setting
    };
  
    const toggleLoginAlerts = () => {
      setLoginAlerts(!loginAlerts);
      // In a real app, you would also make an API call to update this setting
    };
  
    const toggleSaveLoginInfo = () => {
      setSaveLoginInfo(!saveLoginInfo);
      // In a real app, you would also make an API call to update this setting
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security Settings</Text>
          <View style={{ width: 24 }} />
        </View>
  
        <ScrollView style={styles.scrollContainer}>
          {/* Change Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={24} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Ionicons name={passwordVisible ? "eye-off" : "eye"} size={24} color="#777" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={24} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!passwordVisible}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={24} color="#777" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!passwordVisible}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handlePasswordChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
  
          {/* Two Factor Authentication */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Authentication</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="two-factor-authentication" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>
                    Add an extra layer of security to your account
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={toggleTwoFactor}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={twoFactorEnabled ? "#1995AD" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="fingerprint" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Biometric Login</Text>
                  <Text style={styles.settingDescription}>
                    Use fingerprint or face recognition to log in
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={biometricEnabled ? "#1995AD" : "#f4f3f4"}
              />
            </View>
          </View>
  
          {/* Account Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <FontAwesome name="bell" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Login Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when someone logs into your account
                  </Text>
                </View>
              </View>
              <Switch
                value={loginAlerts}
                onValueChange={toggleLoginAlerts}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={loginAlerts ? "#1995AD" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="save" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Save Login Info</Text>
                  <Text style={styles.settingDescription}>
                    Store your login information for faster access
                  </Text>
                </View>
              </View>
              <Switch
                value={saveLoginInfo}
                onValueChange={toggleSaveLoginInfo}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={saveLoginInfo ? "#1995AD" : "#f4f3f4"}
              />
            </View>
          </View>
  
          {/* Security Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Security</Text>
            
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionInfo}>
                <MaterialIcons name="devices" size={24} color="#1995AD" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Manage Devices</Text>
                  <Text style={styles.actionDescription}>
                    See all devices you're logged in to
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionInfo}>
                <MaterialIcons name="history" size={24} color="#1995AD" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Login Activity</Text>
                  <Text style={styles.actionDescription}>
                    Review your recent account activity
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]}>
              <View style={styles.actionInfo}>
                <MaterialIcons name="security" size={24} color="#d9534f" />
                <View style={styles.actionTextContainer}>
                  <Text style={[styles.actionTitle, { color: "#d9534f" }]}>
                    Security Checkup
                  </Text>
                  <Text style={styles.actionDescription}>
                    Review and improve your account security
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
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
      marginVertical: 10,
      padding: 16,
      borderRadius: 8,
      marginHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      color: "#333",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 16,
      height: 50,
      backgroundColor: "#f9f9f9",
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: 50,
      fontSize: 16,
      color: "#333",
    },
    button: {
      backgroundColor: "#1995AD",
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      marginTop: 8,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    settingInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: "#333",
    },
    settingDescription: {
      fontSize: 14,
      color: "#777",
      marginTop: 2,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    actionInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    actionTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: "#333",
    },
    actionDescription: {
      fontSize: 14,
      color: "#777",
      marginTop: 2,
    },
  });
  
  export default SecurityScreen;