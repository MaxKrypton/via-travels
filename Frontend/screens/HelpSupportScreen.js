import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    ActivityIndicator
  } from "react-native";
  import React, { useState, useContext } from "react";
  import { useNavigation } from "@react-navigation/native";
  import Ionicons from "@expo/vector-icons/Ionicons";
  import MaterialIcons from "@expo/vector-icons/MaterialIcons";
  import FontAwesome from "@expo/vector-icons/FontAwesome";
  import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
  import Feather from "@expo/vector-icons/Feather";
  import axios from "axios";
  import AuthContext from "../context/AuthContext";
  
  const HelpSupportScreen = () => {
    const navigation = useNavigation();
    const [issueType, setIssueType] = useState("");
    const [hotelName, setHotelName] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {ip} = useContext(AuthContext)
    
    
    const commonIssues = [
      {
        id: 1,
        title: "Booking Issues",
        icon: <FontAwesome name="calendar-check-o" size={22} color="#1995AD" />,
        description: "Problems with reservations, cancellations, or modifications"
      },
      {
        id: 2,
        title: "Payment Problems",
        icon: <MaterialIcons name="payment" size={24} color="#1995AD" />,
        description: "Issues with payments, refunds, or billing"
      },
      {
        id: 3,
        title: "Account Access",
        icon: <MaterialIcons name="lock" size={24} color="#1995AD" />,
        description: "Login problems, password reset, or account recovery"
      },
      {
        id: 4,
        title: "App Functionality",
        icon: <MaterialIcons name="phone-android" size={24} color="#1995AD" />,
        description: "Issues with the app's features or performance"
      },
      {
        id: 5,
        title: "Room & Service Issues",
        icon: <MaterialIcons name="hotel" size={24} color="#1995AD" />,
        description: "Problems with room quality, cleanliness, or hotel services"
      },
    ];

    const handleSubmit = async () => {
      if (!issueType) {
        Alert.alert("Error", "Please select an issue type");
        return;
      }
      
      if (!hotelName.trim()) {
        Alert.alert("Error", "Please enter the hotel name");
        return;
      }
      
      if (!subject.trim()) {
        Alert.alert("Error", "Please enter a subject for your issue");
        return;
      }
      
      if (!message.trim()) {
        Alert.alert("Error", "Please describe your issue");
        return;
      }
      
      setIsSubmitting(true);
      
      const supportTicketData = {
        hotelName: hotelName.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };
      
      try {
        const url = `http://${ip}:8000/api/v1/complaints/send`;
        
        const response = await axios.post(url, supportTicketData, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        if (response.status === 200 || response.status === 201) {
          setIsSubmitting(false);
          Alert.alert(
            "Ticket Submitted",
            "We've received your support request and will get back to you soon.",
            [
              {
                text: "OK",
                onPress: () => {
                  setHotelName("");
                  setSubject("");
                  setMessage("");
                  setIssueType("");
                }
              }
            ]
          );
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
      } catch (error) {
        setIsSubmitting(false);
        console.error("API Error:", error);
        
        // More specific error messages
        let errorMessage = "Failed to submit ticket. Please try again.";
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = "Request timed out. Please check your internet connection.";
        } else if (error.response) {
          // Server responded with an error status
          errorMessage = `Server error: ${error.response.status}. ${error.response.data?.message || 'Please try again.'}`;
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "No response from server. Please check your internet connection.";
        }
        
        Alert.alert("Error", errorMessage);
      }
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 24 }} />
        </View>
  
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.heroSection}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>How can we help you?</Text>
            <Text style={styles.heroSubtitle}>
              Choose a category below and provide details about your issue
            </Text>
          </View>
  
          {/* Common Issues Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issue Category</Text>
            
            {commonIssues.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.issueCard,
                  issueType === item.title && styles.selectedIssueCard
                ]}
                onPress={() => setIssueType(item.title)}
              >
                <View style={styles.issueIconContainer}>
                  {item.icon}
                </View>
                <View style={styles.issueContent}>
                  <Text style={styles.issueTitle}>{item.title}</Text>
                  <Text style={styles.issueDescription}>{item.description}</Text>
                </View>
                {issueType === item.title && (
                  <Ionicons name="checkmark-circle" size={24} color="#1995AD" />
                )}
              </TouchableOpacity>
            ))}
          </View>
  
          {/* Contact Support Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support Request Details</Text>
            
            <View style={styles.formContainer}>
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
                placeholder="Brief description of your issue"
                value={subject}
                onChangeText={setSubject}
              />
              
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={styles.messageInput}
                multiline
                placeholder="Please provide detailed information about your issue..."
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />
              
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
                  <Text style={styles.submitButtonText}>Submit Support Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
  
          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            
            <TouchableOpacity style={styles.linkRow}>
              <View style={styles.linkInfo}>
                <MaterialIcons name="help-outline" size={24} color="#1995AD" />
                <Text style={styles.linkText}>FAQs</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkRow}>
              <View style={styles.linkInfo}>
                <MaterialCommunityIcons name="book-open-variant" size={24} color="#1995AD" />
                <Text style={styles.linkText}>User Guide</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkRow}>
              <View style={styles.linkInfo}>
                <Feather name="video" size={24} color="#1995AD" />
                <Text style={styles.linkText}>Tutorial Videos</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.linkRow}>
              <View style={styles.linkInfo}>
                <MaterialIcons name="policy" size={24} color="#1995AD" />
                <Text style={styles.linkText}>Terms & Conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#777" />
            </TouchableOpacity>
          </View>
  
          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.contactRow}>
              <Feather name="mail" size={22} color="#1995AD" />
              <Text style={styles.contactText}>atnestly@gmail.com</Text>
            </View>
            
            <View style={styles.contactRow}>
              <Feather name="phone" size={22} color="#1995AD" />
              <Text style={styles.contactText}>+250 783 520 488</Text>
            </View>
            
            <View style={styles.contactRow}>
              <Feather name="clock" size={22} color="#1995AD" />
              <Text style={styles.contactText}>Available 24/7</Text>
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
    heroSection: {
      backgroundColor: "white",
      padding: 24,
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#e1e4e8",
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 16,
      color: "#777",
      textAlign: "center",
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
    issueCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: "#f9f9f9",
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#eee",
    },
    selectedIssueCard: {
      borderColor: "#1995AD",
      backgroundColor: "rgba(25, 149, 173, 0.05)",
    },
    issueIconContainer: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(25, 149, 173, 0.1)",
      borderRadius: 20,
      marginRight: 12,
    },
    issueContent: {
      flex: 1,
    },
    issueTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: "#333",
      marginBottom: 4,
    },
    issueDescription: {
      fontSize: 14,
      color: "#777",
    },
    formContainer: {
      marginTop: 8,
    },
    label: {
      fontSize: 16,
      color: "#333",
      marginBottom: 8,
      fontWeight: "500",
    },
    textInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 12,
      backgroundColor: "#f9f9f9",
      fontSize: 16,
      marginBottom: 16,
    },
    messageInput: {
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 8,
      padding: 12,
      minHeight: 120,
      backgroundColor: "#f9f9f9",
      fontSize: 16,
      marginBottom: 16,
    },
    submitButton: {
      backgroundColor: "#1995AD",
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      marginTop: 8,
    },
    disabledButton: {
      opacity: 0.7,
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
    },
    linkInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    linkText: {
      fontSize: 16,
      color: "#333",
      marginLeft: 12,
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    contactText: {
      fontSize: 16,
      color: "#333",
      marginLeft: 12,
    },
  });
  
  export default HelpSupportScreen;