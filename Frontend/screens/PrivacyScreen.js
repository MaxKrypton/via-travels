import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    Switch,
    TouchableOpacity,
    Alert
  } from "react-native";
  import React, { useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  import Ionicons from "@expo/vector-icons/Ionicons";
  import MaterialIcons from "@expo/vector-icons/MaterialIcons";
  import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
  import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
  import Feather from "@expo/vector-icons/Feather";
  
  const PrivacyScreen = () => {
    const navigation = useNavigation();
    
    // Privacy settings state
    const [profileVisibility, setProfileVisibility] = useState("Public");
    const [locationSharing, setLocationSharing] = useState(true);
    const [activityStatus, setActivityStatus] = useState(true);
    const [showBookings, setShowBookings] = useState(true);
    const [dataCollection, setDataCollection] = useState(true);
    const [personalization, setPersonalization] = useState(true);
    
    const changeProfileVisibility = () => {
      Alert.alert(
        "Profile Visibility",
        "Choose who can see your profile",
        [
          {
            text: "Public",
            onPress: () => setProfileVisibility("Public"),
          },
          {
            text: "Friends Only",
            onPress: () => setProfileVisibility("Friends Only"),
          },
          {
            text: "Private",
            onPress: () => setProfileVisibility("Private"),
          },
        ]
      );
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <View style={{ width: 24 }} />
        </View>
  
        <ScrollView style={styles.scrollContainer}>
          {/* Account Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Privacy</Text>
            
            <TouchableOpacity 
              style={styles.settingRow} 
              onPress={changeProfileVisibility}
            >
              <View style={styles.settingInfo}>
                <MaterialIcons name="visibility" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Profile Visibility</Text>
                  <Text style={styles.settingDescription}>
                    Control who can see your profile
                  </Text>
                </View>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{profileVisibility}</Text>
                <Ionicons name="chevron-forward" size={20} color="#777" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="location-on" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Location Sharing</Text>
                  <Text style={styles.settingDescription}>
                    Allow the app to access your location
                  </Text>
                </View>
              </View>
              <Switch
                value={locationSharing}
                onValueChange={setLocationSharing}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={locationSharing ? "#1995AD" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="circle" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Activity Status</Text>
                  <Text style={styles.settingDescription}>
                    Show when you're active on the app
                  </Text>
                </View>
              </View>
              <Switch
                value={activityStatus}
                onValueChange={setActivityStatus}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={activityStatus ? "#1995AD" : "#f4f3f4"}
              />
            </View>
            
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <FontAwesome5 name="hotel" size={22} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Show Bookings</Text>
                  <Text style={styles.settingDescription}>
                    Allow others to see your bookings
                  </Text>
                </View>
              </View>
              <Switch
                value={showBookings}
                onValueChange={setShowBookings}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={showBookings ? "#1995AD" : "#f4f3f4"}
              />
            </View>
          </View>
  
          {/* Data & Personalization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data & Personalization</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="data-usage" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Data Collection</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to collect usage data to improve your experience
                  </Text>
                </View>
              </View>
              <Switch
                value={dataCollection}
                onValueChange={setDataCollection}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={dataCollection ? "#1995AD" : "#f4f3f4"}
              />
            </View>
            
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="auto-awesome" size={24} color="#1995AD" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Personalized Content</Text>
                  <Text style={styles.settingDescription}>
                    Receive recommendations based on your preferences
                  </Text>
                </View>
              </View>
              <Switch
                value={personalization}
                onValueChange={setPersonalization}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={personalization ? "#1995AD" : "#f4f3f4"}
              />
            </View>
          </View>
  
          {/* Additional Privacy Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Options</Text>
            
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionInfo}>
                <Feather name="users" size={24} color="#1995AD" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Blocked Accounts</Text>
                  <Text style={styles.actionDescription}>
                    Manage accounts you've blocked
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionRow}>
              <View style={styles.actionInfo}>
                <MaterialIcons name="delete-outline" size={24} color="#1995AD" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Data Management</Text>
                  <Text style={styles.actionDescription}>
                    Download or delete your data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]}>
              <View style={styles.actionInfo}>
                <MaterialIcons name="policy" size={24} color="#1995AD" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Privacy Policy</Text>
                  <Text style={styles.actionDescription}>
                    Read our privacy policy
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
          </View>
          
          {/* Request Account Deletion */}
          <View style={styles.dangerSection}>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => 
                Alert.alert(
                  "Delete Account",
                  "Are you sure you want to delete your account? This action cannot be undone.",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        // In a real app, this would trigger an account deletion process
                        Alert.alert("Request Submitted", "Your account deletion request has been received.");
                      }
                    }
                  ]
                )
              }
            >
              <MaterialIcons name="delete-forever" size={24} color="#fff" />
              <Text style={styles.dangerButtonText}>Request Account Deletion</Text>
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
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    valueText: {
      fontSize: 16,
      color: "#1995AD",
      marginRight: 4,
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
    dangerSection: {
      marginVertical: 10,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 30,
    },
    dangerButton: {
      backgroundColor: "#d9534f",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      padding: 14,
      borderRadius: 8,
    },
    dangerButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
  });
  
  export default PrivacyScreen;