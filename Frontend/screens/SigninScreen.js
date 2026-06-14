// Frontend/screens/SignInScreen.js

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
import React, { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const SignInScreen = ({ route = {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { login, ip } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  // Get return navigation params if coming from another screen
  const returnTo = route.params?.returnTo;
  const returnParams = route.params?.returnParams;

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill up all the details");
      return;
    }

    const url = `http://${ip}:8000/api/v1/auth/login`;
    const credentials = {
      email: email.trim().toLowerCase(),
      password: password
    };

    setIsLoading(true);
    console.log("Logging in with:", credentials.email);

    try {
      const response = await axios.post(url, credentials);
      const result = response.data;
      console.log("✅ Login response:", result);

      if (result.success && result.data) {
        const { token, user } = result.data;

        // Save to context (which also saves to SecureStore)
        await login(token, user);
        console.log("✅ Login successful");

        // If returning from another screen (e.g., booking), navigate back there
        if (returnTo && returnParams) {
          console.log(`Returning to ${returnTo} with params:`, returnParams);
          // Small delay to ensure auth state is updated
          setTimeout(() => {
            navigation.navigate(returnTo, returnParams);
          }, 100);
        } else {
          // Otherwise, navigation will happen automatically via AppNavigation
          console.log("Navigation will happen automatically via AppNavigation");
        }

      } else {
        Alert.alert("Login Failed", result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("❌ Login error:", error);

      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || error.response.data?.error;

        console.log("Error status:", status);
        console.log("Error message:", errorMessage);

        if (status === 401) {
          Alert.alert("Login Failed", "Invalid email or password");
        } else if (status === 403) {
          Alert.alert(
            "Account Not Verified", 
            "Please check your email to verify your account before logging in.",
            [
              {
                text: "OK",
                onPress: () => console.log("User needs to verify email")
              }
            ]
          );
        } else {
          Alert.alert("Error", errorMessage || "Login failed. Please try again");
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
            Welcome Back!
          </Text>
        </View>
      </KeyboardAvoidingView>

      <KeyboardAvoidingView>
        <View style={{ marginTop: 20 }}>
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

          <View style={[styles.inputContainer, { marginTop: 30 }]}>
            <Entypo name="key" size={24} color="black" />
            <TextInput
              placeholder="Enter Your Password"
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Text>Keep Me Logged In</Text>
          <Text style={{ color: "#007FFF", fontWeight: "500" }}>
            Forgot Password?
          </Text>
        </View>

        <View style={{ width: "90%", marginLeft: 30 }}>
          <Text style={{ marginTop: 20, textAlign: "center" }}>
            By logging in you confirm that you accept our
            <Text style={{ color: "#1995AD" }}> Terms of Use</Text> and{" "}
            <Text style={{ color: "#1995AD" }}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Pressable
            onPress={handleSignIn}
            disabled={isLoading}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color={"white"} size={20} />
            ) : (
              <Text style={styles.buttonText}>Login to your Account</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("SignUp")}
            style={{ marginTop: 20 }}
          >
            <Text style={{ textAlign: "center", fontWeight: "500", fontSize: 15 }}>
              Don't Have An Account? <Text style={{ color: "#1995AD", fontWeight: "bold" }}>Sign Up</Text>
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
    marginTop: 10,
    paddingHorizontal: 10,
  },
  input: {
    color: "gray",
    marginVertical: 13,
    width: 300,
    fontSize: 16,
  },
  optionsContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

export default SignInScreen;