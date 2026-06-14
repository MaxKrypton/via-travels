import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Image,
    Platform,
    Switch
  } from "react-native";
  import React, { useState } from "react";
  import { useNavigation } from "@react-navigation/native";
  import Ionicons from "@expo/vector-icons/Ionicons";
  import MaterialIcons from "@expo/vector-icons/MaterialIcons";
  import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
  import Feather from "@expo/vector-icons/Feather";
  import * as ImagePicker from 'expo-image-picker';
  
  const ReportProblemScreen = () => {
    const navigation = useNavigation();
    const [problemType, setProblemType] = useState("");
    const [hotelName, setHotelName] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [deviceInfo, setDeviceInfo] = useState(true);
    const [screenshots, setScreenshots] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const problemTypes = [
      {
        id: 1,
        title: "App Crash",
        icon: <MaterialIcons name="error-outline" size={24} color="#1995AD" />,
      },
      {
        id: 2,
        title: "Feature Not Working",
        icon: <MaterialIcons name="build" size={24} color="#1995AD" />,
      },
      {
        id: 3,
        title: "Payment Issue",
        icon: <MaterialIcons name="payment" size={24} color="#1995AD" />,
      },
      {
        id: 4,
        title: "Hotel Services",
        icon: <MaterialIcons name="hotel" size={24} color="#1995AD" />,
      },
      {
        id: 5,
        title: "Performance Problems",
        icon: <MaterialIcons name="speed" size={24} color="#1995AD" />,
      },
      {
        id: 6,
        title: "Other",
        icon: <MaterialIcons name="help-outline" size={24} color="#1995AD" />,
      },
    ];
  
    const pickImage = async () => {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to allow access to your media library to upload screenshots.");
        return;
      }
  
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        maxFiles: 3,
        quality: 0.7,
      });
  
      if (!result.canceled && result.assets) {
        // Limit to 3 screenshots
        const newScreenshots = [...screenshots];
        result.assets.forEach((asset) => {
          if (newScreenshots.length < 3) {
            newScreenshots.push(asset);
          }
        });
        
        setScreenshots(newScreenshots.slice(0, 3));
      }
    };
  
    const removeScreenshot = (index) => {
      const newScreenshots = [...screenshots];
      newScreenshots.splice(index, 1);
      setScreenshots(newScreenshots);
    };
  
    const handleSubmit = async () => {
      if (!problemType) {
        Alert.alert("Error", "Please select a problem type");
        return;
      }
      
      if (!hotelName.trim()) {
        Alert.alert("Error", "Please enter the hotel name");
        return;
      }
      
      if (!subject.trim()) {
        Alert.alert("Error", "Please enter a subject for your report");
        return;
      }
      
      if (!message.trim()) {
        Alert.alert("Error", "Please describe the problem");
        return;
      }
      
      setIsSubmitting(true);
      
      // Prepare data for API
      const problemReportData = {
        hotelName: hotelName.trim(),
        subject: subject.trim(),
        message: message.trim(),
        problemType: problemType,
        deviceInfo: deviceInfo ? getDeviceInformation() : null,
        screenshots: screenshots.length > 0 ? screenshots : null
      };
      
      try {
        // Replace with your actual API endpoint
        // const response = await fetch('YOUR_API_ENDPOINT', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(problemReportData),
        // });
        
        // Simulate API call for now
        setTimeout(() => {
          setIsSubmitting(false);
          Alert.alert(
            "Report Submitted",
            "Thank you for your report. Our team will investigate the issue.",
            [
              {
                text: "OK",
                onPress: () => {
                  navigation.goBack();
                }
              }
            ]
          );
        }, 1500);
        
      } catch (error) {
        setIsSubmitting(false);
        Alert.alert("Error", "Failed to submit report. Please try again.");
      }
    };
    
    const getDeviceInformation = () => {
      return {
        device: Platform.OS === 'ios' ? 'iPhone' : 'Android',
        osVersion: Platform.Version,
        model: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
        appVersion: '1.2.3', // Replace with actual app version
      };
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report a Problem</Text>
          <View style={{ width: 24 }} />
        </View>
  
        <ScrollView style={styles.scrollContainer}>
          {/* Top Section */}
          <View style={styles.introSection}>
            <MaterialCommunityIcons name="bug-outline" size={40} color="#1995AD" />
            <Text style={styles.introTitle}>
              Help us improve your experience
            </Text>
            <Text style={styles.introText}>
              Please provide detailed information about the issue you're experiencing. 
              This will help us identify and fix the problem more quickly.
            </Text>
          </View>
  
          {/* Problem Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of problem are you experiencing? *</Text>
            
            <View style={styles.problemTypesContainer}>
              {problemTypes.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.problemTypeButton,
                    problemType === item.title && styles.selectedProblemType
                  ]}
                  onPress={() => setProblemType(item.title)}
                >
                  <View style={styles.problemTypeIcon}>
                    {item.icon}
                  </View>
                  <Text
                    style={[
                      styles.problemTypeText,
                      problemType === item.title && styles.selectedProblemText
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Report Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Report Details</Text>
            
            <Text style={styles.label}>Hotel Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter hotel name"
              value={hotelName}
              onChangeText={setHotelName}
            />
            
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of the problem"
              value={subject}
              onChangeText={setSubject}
            />
            
            <Text style={styles.label}>Problem Description *</Text>
            <TextInput
              style={styles.descriptionInput}
              multiline
              placeholder="Please describe what happened, what you were doing at the time, and any other details that might help us understand the issue..."
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>
  
          {/* Screenshots Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Screenshots (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Screenshots can help us understand the issue better. You can add up to 3 images.
            </Text>
            
            <View style={styles.screenshotsContainer}>
              {screenshots.map((screenshot, index) => (
                <View key={index} style={styles.screenshotItem}>
                  <Image
                    source={{ uri: screenshot.uri }}
                    style={styles.screenshotImage}
                  />
                  <TouchableOpacity
                    style={styles.removeScreenshotButton}
                    onPress={() => removeScreenshot(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#d9534f" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {screenshots.length < 3 && (
                <TouchableOpacity style={styles.addScreenshotButton} onPress={pickImage}>
                  <Feather name="camera" size={24} color="#1995AD" />
                  <Text style={styles.addScreenshotText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
  
          {/* Device Info Section */}
          <View style={styles.section}>
            <View style={styles.deviceInfoHeader}>
              <Text style={styles.sectionTitle}>Include Device Information</Text>
              <Switch
                value={deviceInfo}
                onValueChange={setDeviceInfo}
                trackColor={{ false: "#d9d9d9", true: "#abe3ed" }}
                thumbColor={deviceInfo ? "#1995AD" : "#f4f3f4"}
              />
            </View>
            
            <Text style={styles.sectionSubtitle}>
              Sharing your device information helps us diagnose the problem more effectively.
            </Text>
            
            {deviceInfo && (
              <View style={styles.deviceInfoContainer}>
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Device:</Text>
                  <Text style={styles.deviceInfoValue}>{getDeviceInformation().device}</Text>
                </View>
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>OS Version:</Text>
                  <Text style={styles.deviceInfoValue}>{getDeviceInformation().osVersion}</Text>
                </View>
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>Model:</Text>
                  <Text style={styles.deviceInfoValue}>{getDeviceInformation().model}</Text>
                </View>
                <View style={styles.deviceInfoRow}>
                  <Text style={styles.deviceInfoLabel}>App Version:</Text>
                  <Text style={styles.deviceInfoValue}>{getDeviceInformation().appVersion}</Text>
                </View>
              </View>
            )}
          </View>
  
          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Problem Report</Text>
              )}
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
    introSection: {
      backgroundColor: "white",
      padding: 20,
      alignItems: "center",
      marginBottom: 15,
    },
    introTitle: {
      fontSize: 22,
      fontWeight: "600",
      color: "#333",
      marginTop: 12,
      marginBottom: 8,
    },
    introText: {
      fontSize: 16,
      color: "#666",
      textAlign: "center",
      lineHeight: 22,
    },
    section: {
      backgroundColor: "white",
      marginVertical: 8,
      padding: 16,
      marginHorizontal: 16,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#333",
      marginBottom: 12,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: "#666",
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      color: "#333",
      marginBottom: 8,
      marginTop: 8,
      fontWeight: "500",
    },
    textInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 12,
      backgroundColor: "#f9f9f9",
      fontSize: 16,
      marginBottom: 8,
    },
    problemTypesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    problemTypeButton: {
      width: "48%",
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      padding: 12,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#e5e5e5",
    },
    selectedProblemType: {
      backgroundColor: "rgba(25, 149, 173, 0.1)",
      borderColor: "#1995AD",
    },
    problemTypeIcon: {
      marginBottom: 8,
    },
    problemTypeText: {
      fontSize: 14,
      color: "#333",
      fontWeight: "500",
      textAlign: "center",
    },
    selectedProblemText: {
      color: "#1995AD",
    },
    descriptionInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 12,
      minHeight: 120,
      backgroundColor: "#f9f9f9",
      fontSize: 16,
      marginBottom: 8,
    },
    screenshotsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    screenshotItem: {
      position: "relative",
      width: 90,
      height: 90,
      marginRight: 12,
      marginBottom: 12,
    },
    screenshotImage: {
      width: 90,
      height: 90,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    removeScreenshotButton: {
      position: "absolute",
      top: -10,
      right: -10,
      backgroundColor: "white",
      borderRadius: 12,
    },
    addScreenshotButton: {
      width: 90,
      height: 90,
      borderWidth: 1,
      borderColor: "#1995AD",
      borderStyle: "dashed",
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(25, 149, 173, 0.05)",
    },
    addScreenshotText: {
      color: "#1995AD",
      fontSize: 12,
      marginTop: 4,
    },
    deviceInfoHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    deviceInfoContainer: {
      backgroundColor: "#f5f5f5",
      borderRadius: 8,
      padding: 12,
    },
    deviceInfoRow: {
      flexDirection: "row",
      paddingVertical: 6,
    },
    deviceInfoLabel: {
      width: 100,
      fontSize: 14,
      fontWeight: "500",
      color: "#555",
    },
    deviceInfoValue: {
      flex: 1,
      fontSize: 14,
      color: "#333",
    },
    submitContainer: {
      padding: 16,
      marginBottom: 20,
    },
    submitButton: {
      backgroundColor: "#1995AD",
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
    },
    disabledButton: {
      opacity: 0.7,
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });
  
  export default ReportProblemScreen;