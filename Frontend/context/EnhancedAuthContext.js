// Frontend/context/EnhancedAuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

export const EnhancedAuthContext = createContext();

export const EnhancedAuthProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // App State
  const [currentHotelId, setCurrentHotelId] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);

  // Initialize - Check for stored auth token
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setAuthToken(token);
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============= AUTH FUNCTIONS =============

  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login({ email, password });
      const { token, user: userData } = response.data.data;

      // Store token and user data
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setAuthToken(token);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.auth.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call success
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      setAuthToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setBookings([]);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await apiService.auth.updatePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update password',
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await apiService.auth.forgotPassword(email);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  };

  // ============= BOOKING FUNCTIONS =============

  const fetchUserBookings = async () => {
    if (!user?.id) return;

    try {
      const response = await apiService.bookings.getUserBookings(user.id);
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const createBooking = async (hotelId, bookingData) => {
    try {
      const response = await apiService.bookings.create(hotelId, bookingData);
      await fetchUserBookings(); // Refresh bookings
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Booking failed',
      };
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    try {
      await apiService.bookings.cancel(bookingId, reason);
      await fetchUserBookings(); // Refresh bookings
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel booking',
      };
    }
  };

  const verifyPayment = async (bookingId) => {
    try {
      const response = await apiService.bookings.verifyPayment(bookingId);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed',
      };
    }
  };

  // ============= HOT DEALS FUNCTIONS =============

  const fetchHotDeals = async () => {
    try {
      const response = await apiService.discounts.getHotDeals();
      setHotDeals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hot deals:', error);
    }
  };

  // ============= PROFILE FUNCTIONS =============

  const updateProfile = async (profileId, profileData) => {
    try {
      const response = await apiService.profile.update(profileId, profileData);
      
      // Update local user data
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  };

  const getProfile = async (profileId) => {
    try {
      const response = await apiService.profile.getProfile(profileId);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile',
      };
    }
  };

  // ============= REVIEW FUNCTIONS =============

  const submitReview = async (hotelId, reviewData) => {
    try {
      const response = await apiService.reviews.create(hotelId, reviewData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit review',
      };
    }
  };

  const updateReview = async (reviewId, reviewData) => {
    try {
      const response = await apiService.reviews.update(reviewId, reviewData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update review',
      };
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await apiService.reviews.delete(reviewId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete review',
      };
    }
  };

  // ============= SUPPORT FUNCTIONS =============

  const submitComplaint = async (complaintData) => {
    try {
      await apiService.complaints.send(complaintData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit complaint',
      };
    }
  };

  const submitGlitch = async (glitchData) => {
    try {
      await apiService.complaints.sendGlitch(glitchData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to report glitch',
      };
    }
  };

  // ============= ROOM FUNCTIONS =============

  const checkRoomAvailability = async (roomTypeId, dates) => {
    try {
      const response = await apiService.pricing.checkAvailability(roomTypeId, dates);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check availability',
      };
    }
  };

  // Context value
  const value = {
    // State
    user,
    authToken,
    isAuthenticated,
    isLoading,
    currentHotelId,
    currentRoomId,
    bookings,
    hotDeals,

    // Setters
    setUser,
    setCurrentHotelId,
    setCurrentRoomId,

    // Auth functions
    login,
    register,
    logout,
    updatePassword,
    forgotPassword,

    // Booking functions
    fetchUserBookings,
    createBooking,
    cancelBooking,
    verifyPayment,

    // Hot deals
    fetchHotDeals,

    // Profile functions
    updateProfile,
    getProfile,

    // Review functions
    submitReview,
    updateReview,
    deleteReview,

    // Support functions
    submitComplaint,
    submitGlitch,

    // Room functions
    checkRoomAvailability,
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export default EnhancedAuthContext;