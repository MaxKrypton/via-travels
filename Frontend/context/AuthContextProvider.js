import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import * as SecureStore from "expo-secure-store";
import { API_HOST } from "../services/config";
import apiService from "../services/api";

const UserContexProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hotelData, setHotelData] = useState([]);
  const [currentID, setCurrentID] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [review, setReview] = useState(null);
  const ip = API_HOST;
  const [signedIn, setSignedIn] = useState(true)

// Initialize auth on app start
  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Load token
      const storedToken = await SecureStore.getItemAsync("authToken");

      if (storedToken) {
        // Load user data
        const storedUserData = await SecureStore.getItemAsync("userData");

        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          setAuthToken(storedToken);
          apiService.setAuthToken(storedToken);
          setIsAuthenticated(true);
          console.log("✅ User session restored");
        } else {
          // Token exists but no user data - clear token
          await SecureStore.deleteItemAsync("authToken");
          apiService.setAuthToken(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token found - user is not authenticated
        setIsAuthenticated(false);
        apiService.setAuthToken(null);
      }

      // Load hotel data
      const storedHotelDetail = await SecureStore.getItemAsync("hotelData");
      if (storedHotelDetail) {
        const hotelData = JSON.parse(storedHotelDetail);
        setHotelData(hotelData);
        console.log("✅ Hotel data loaded");
      }
    } catch (error) {
      console.error("❌ Error initializing auth:", error);
      // Clear corrupted data
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, [])

// Auth functions

  const login = async (token, userData) => {
    try {
      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(userData));

      setAuthToken(token);
      apiService.setAuthToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      console.log("✅ Login successful");
    } catch (error) {
      console.error("❌ Error saving login data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userData");

      setAuthToken(null);
      apiService.setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Error during logout:", error);
    }
  };

  const updateUser = async (userData) => {
    try {
      await SecureStore.setItemAsync("userData", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("❌ Error updating user:", error);
    }
  };

  // Hotel data functions

  const saveHotelData = async (data) => {
    try {
      await SecureStore.setItemAsync("hotelData", JSON.stringify(data));
      setHotelData(data);
      console.log("✅ Hotel data saved");
    } catch (error) {
      console.error("❌ Error saving hotel data:", error);
    }
  };


  const value = {
    // Auth state
    user,
    authToken,
    isAuthenticated,
    isLoading,

    // Auth actions
    login,
    logout,
    updateUser,
    signedIn,
    setSignedIn,

    // Hotel data
    hotelData,
    saveHotelData,
    currentID,
    setCurrentID,
    currentRoomId,
    setCurrentRoomId,
    review,
    setReview,

    // API config
    ip
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default UserContexProvider;
