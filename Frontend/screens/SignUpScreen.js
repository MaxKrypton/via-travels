// Frontend/screens/SignUpScreen.js

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthContext from "../context/AuthContext";

const SignUpScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { setUser, setSignedIn, setAuthStatus, saveAuthStatus, saveUserDetails, ip } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill up all the details");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    const url = `http://${ip}:8000/api/v1/auth/register`;
    const userData = {
      username: name.trim(),
      email: email.trim().toLowerCase(),
      password: password
    };

    setIsLoading(true);
    console.log("Registering user:", userData.email);

    try {
      const response = await axios.post(url, userData);
      const result = response.data;
      console.log("✅ Registration response:", result);

      if (result.success && result.data) {
        const user = result.data.user;

        // Store user data temporarily
        await AsyncStorage.setItem('tempUserData', JSON.stringify(user));

        Alert.alert(
          "Registration Successful! 🎉",
          "Please check your email to verify your account. Check your spam folder if you don't see it.",
          [
            {
              text: "OK",
              onPress: () => {
                // Clear the form
                setName("");
                setEmail("");
                setPassword("");
                
                // Navigate to sign in
                navigation.navigate("SignIn");
              }
            }
          ]
        );

        // Update context to show not verified status
        setSignedIn(false);
        setAuthStatus("notVerified");
        await saveAuthStatus("isLoggedIn", "notVerified");

      } else {
        Alert.alert("Registration Failed", result.message || "Please try again");
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || "Registration failed";
        const errorStatus = error.response.status;
        
        console.log("Error status:", errorStatus);
        console.log("Error message:", errorMessage);
        
        if (errorStatus === 401 && errorMessage.includes("already exists")) {
          Alert.alert("Error", "An account with this email already exists. Please sign in instead.");
        } else {
          Alert.alert("Error", errorMessage);
        }
      } else if (error.request) {
        Alert.alert("Network Error", "Please check your internet connection and make sure the server is running");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "White", alignItems: "center" }}>
      <View style={{ marginTop: 40, marginBottom: 20 }}>
        <Image
          style={{ width: 120, height: 120, marginBottom: 20 }}
          source={require("../assets/images/3.png")}
        />
      </View>

      <KeyboardAvoidingView>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 30 }}>
            Register Your Account
          </Text>
        </View>
      </KeyboardAvoidingView>

      <KeyboardAvoidingView>
        <View>
          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={24} color="black" />
            <TextInput
              placeholder="Username"
              value={name}
              style={styles.input}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color="black" />
            <TextInput
              placeholder="Email"
              value={email}
              style={styles.input}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Entypo name="key" size={24} color="black" />
            <TextInput
              placeholder="Enter Your Password (min 8 characters)"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={{ width: "87%", marginLeft: "10%", marginTop: 20 }}>
          <Text style={{ textAlign: "center" }}>
            By Registering you confirm that you accept our
            <Text style={{ color: "#1995AD" }}> Terms of Use</Text> and{" "}
            <Text style={{ color: "#1995AD" }}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={"white"} size={20} />
            ) : (
              <Text style={styles.buttonText}>Create Your Account</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("SignIn")}
            style={{ marginTop: 20 }}
          >
            <Text style={{ textAlign: "center", fontWeight: "500", fontSize: 15 }}>
              Already Have An Account? <Text style={{ color: "#1995AD", fontWeight: "bold" }}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#E0E0E0",
    paddingVertical: 7,
    borderRadius: 7,
    marginTop: 15,
    paddingHorizontal: 10,
  },
  input: {
    color: "gray",
    marginVertical: 13,
    width: 300,
    fontSize: 16,
  },
  button: {
    width: 220,
    backgroundColor: "#1995AD",
    padding: 17,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
    color: "white",
  },
});

export default SignUpScreen;