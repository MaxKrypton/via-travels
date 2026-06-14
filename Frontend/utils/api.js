import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create axios instance with base configuration
const createApiInstance = (baseURL) => {
  const api = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token to requests
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle token expiration
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid - clear auth data
        try {
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('userData');
          // You might want to navigate to login here
          console.log('Auth token expired or invalid');
        } catch (e) {
          console.error('Error clearing auth data:', e);
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

export default createApiInstance;
