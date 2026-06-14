import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  Modal, 
  Pressable, 
  StatusBar, 
  Dimensions,
  Platform
} from "react-native";
import React, { useState, useEffect } from "react";
import SignInScreen from "./SigninScreen";
import SignUpScreen from "./SignUpScreen";
import { LinearGradient } from "expo-linear-gradient"; // Note: You'll need to install expo-linear-gradient

const { width, height } = Dimensions.get("window");

const WelcomeScreen = () => {
  // Initialize state with default values
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState({ width, height });

  // Handle screen dimension changes
  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get("window");
      setScreenDimensions({ width, height });
    };
    
    // Listen for dimension changes (orientation changes)
    const dimensionsListener = Dimensions.addEventListener("change", updateDimensions);
    
    // Clean up listener on unmount
    return () => {
      dimensionsListener.remove();
    };
  }, []);

  // Modal handlers
  const openSignIn = () => setShowSignIn(true);
  const openSignUp = () => setShowSignUp(true);
  const closeSignIn = () => setShowSignIn(false);
  const closeSignUp = () => setShowSignUp(false);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background Image with Overlay Gradient */}
      <Image
        source={require("../assets/images/locck.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />
      
      <View style={styles.contentContainer}>
        {/* Logo and Brand Section */}
        <View style={styles.brandContainer}>
          <Image
            style={styles.logo}
            source={require("../assets/images/3.png")}
            resizeMode="contain"
          />
          <Text style={styles.title}>Via Travels</Text>
          <Text style={styles.subtitle}>Explore the world with us</Text>
        </View>

        {/* Auth Buttons */}
        <View style={styles.authContainer}>
          <Pressable 
            onPress={openSignIn}
            style={({pressed}) => [
              styles.button,
              styles.signInButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>

          <Pressable 
            onPress={openSignUp}
            style={({pressed}) => [
              styles.button,
              styles.signUpButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>
        </View>
        
        {/* Footer Text */}
        <Text style={styles.footerText}>
          Experience seamless travel planning
        </Text>
      </View>
      
      {/* Sign In Modal */}
      <Modal
        visible={showSignIn}
        animationType="slide"
        statusBarTranslucent
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sign In</Text>
            <Pressable style={styles.closeButton} onPress={closeSignIn}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <SignInScreen />
          </View>
        </View>
      </Modal>
      
      {/* Sign Up Modal */}
      <Modal
        visible={showSignUp}
        animationType="slide"
        statusBarTranslucent
        presentationStyle="fullScreen"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Account</Text>
            <Pressable style={styles.closeButton} onPress={closeSignUp}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <SignUpScreen />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    // Ensure content starts below status bar on Android
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight + 40),
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: "center",
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
    marginTop: "20%"
  },
  title: {
    fontSize: Math.min(36, width * 0.09), // Responsive font size
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Math.min(18, width * 0.045), // Responsive font size
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: "center",
  },
  authContainer: {
    width: "100%",
    paddingHorizontal: width > 500 ? width * 0.15 : 0, // Add padding on larger screens
  },
  button: {
    borderRadius: 12,
    height: Math.min(60, height * 0.08), // Responsive height
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  signInButton: {
    backgroundColor: "#1995AD",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#1995AD",
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: Math.min(18, width * 0.045), // Responsive font size
    fontWeight: "600",
    color: "white",
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: Math.min(14, width * 0.035), // Responsive font size
    marginTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Extra padding for iOS
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight + 16),
    borderBottomWidth: 1,
    borderBottomColor: "#e1e4e8",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: Math.min(20, width * 0.05), // Responsive font size
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1
  }
});