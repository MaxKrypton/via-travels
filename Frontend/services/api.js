import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, API_TIMEOUT_MS, ITINERARY_TIMEOUT_MS } from './config';

const getRequestUrl = (config) => {
  const baseURL = config?.baseURL || '';
  const url = config?.url || '';
  return url.startsWith('http') ? url : `${baseURL}${url}`;
};

class ApiService {
  constructor() {
    this.authToken = null;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = this.authToken || await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const method = error.config?.method?.toUpperCase() || 'REQUEST';
        const url = getRequestUrl(error.config);
        const status = error.response?.status ? ` (${error.response.status})` : '';
        const message = error.response?.data?.message || error.message || 'Request failed';
        console.log(`[api] ${method} ${url} failed${status}: ${message}`);

        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          this.setAuthToken(null);
          await SecureStore.deleteItemAsync('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    this.authToken = token || null;
  }

  // ============= AUTHENTICATION =============
  auth = {
    register: (data) => this.client.post('/auth/register', data),
    
    registerViaAdmin: (data) => this.client.post('/auth/register/via-admin', data),
    
    login: (credentials) => this.client.post('/auth/login', credentials),
    
    logout: () => this.client.post('/auth/logout'),
    
    forgotPassword: (email) => this.client.post('/auth/forgot-password', { email }),
    
    resetPassword: (resetToken, newPassword) => 
      this.client.post(`/auth/reset-password/${resetToken}`, { password: newPassword }),
    
    verifyEmail: (verifyToken) => 
      this.client.post(`/auth/verify-email/${verifyToken}`),
    
    updatePassword: (currentPassword, newPassword) => 
      this.client.patch('/auth/update-password', { currentPassword, newPassword }),
  };

  // ============= PROFILE =============
  profile = {
    getAllProfiles: () => this.client.get('/profile/all-profiles'),
    
    getProfile: (profileId) => this.client.get(`/profile/${profileId}`),
    
    register: (data) => this.client.post('/profile/register', data),
    
    update: (profileId, data) => this.client.patch(`/profile/update/${profileId}`, data),
    
    delete: (profileId) => this.client.delete(`/profile/delete/${profileId}`),
  };

  // ============= HOTELS =============
  hotels = {
    getAll: () => this.client.get('/hotels/all-hotels'),
    
    getById: (hotelId) => this.client.get(`/hotels/profile/${hotelId}`),
    
    register: (data) => this.client.post('/hotels/register', data),
    
    update: (hotelId, data) => this.client.patch(`/hotels/update/${hotelId}`, data),
    
    delete: (hotelId) => this.client.delete(`/hotels/delete/${hotelId}`),
  };

  // ============= ROOMS =============
  rooms = {
    getByHotelId: (hotelId) => this.client.get(`/hotels/rooms/${hotelId}`),
    
    getSpecific: (hotelId, roomTypeId) => 
      this.client.get(`/hotels/rooms/${hotelId}/${roomTypeId}`),
    
    register: (hotelId, data) => 
      this.client.post(`/hotels/rooms/register/${hotelId}`, data),
    
    update: (hotelId, roomTypeId, data) => 
      this.client.patch(`/hotels/rooms/update/${hotelId}/${roomTypeId}`, data),
    
    delete: (hotelId, roomTypeId) => 
      this.client.delete(`/hotels/rooms/delete/${hotelId}/${roomTypeId}`),
  };

  // ============= PRICING & AVAILABILITY =============
  pricing = {
    getRoomPricing: (roomTypeId) => 
      this.client.get(`/hotels/availability/roomPricing/${roomTypeId}`),
    
    createRoomPricing: (roomTypeId, data) => 
      this.client.post(`/hotels/availability/roomPricing/${roomTypeId}`, data),
    
    updateRoomPricing: (roomTypeId, pricingId, data) => 
      this.client.patch(`/hotels/availability/roomPricing/${roomTypeId}/${pricingId}`, data),
    
    deleteRoomPricing: (roomTypeId, pricingId) => 
      this.client.delete(`/hotels/availability/roomPricing/${roomTypeId}/${pricingId}`),
    
    checkAvailability: (roomTypeId, data) => 
      this.client.post(`/hotels/availability/roomAvailability/${roomTypeId}`, data),
  };

  // ============= DISCOUNTS =============
  discounts = {
    create: (roomTypeId, data) => 
      this.client.post(`/hotels/discounts/create/${roomTypeId}`, data),
    
    getByRoomType: (roomTypeId) => 
      this.client.get(`/hotels/discounts/${roomTypeId}`),
    
    getHotDeals: () => this.client.get('/hotels/discounts/hot-deals'),
    
    update: (roomTypeId, discountId, data) => 
      this.client.patch(`/hotels/discounts/update/${roomTypeId}/${discountId}`, data),
    
    delete: (roomTypeId, discountId) => 
      this.client.delete(`/hotels/discounts/delete/${roomTypeId}/${discountId}`),
  };

  // ============= BOOKINGS =============
  bookings = {
    create: (hotelId, data) => 
      this.client.post(`/hotels/booking/create/${hotelId}`, data),
    
    verifyPayment: (bookingId) => 
      this.client.get(`/hotels/booking/${bookingId}/verify-payment`),
    
    getUserBookings: (userId) => 
      this.client.get(`/hotels/booking/user/${userId}`),
    
    getById: (bookingId) => 
      this.client.get(`/hotels/booking/${bookingId}`),
    
    update: (bookingId, data) => 
      this.client.patch(`/hotels/booking/update/${bookingId}`, data),
    
    cancel: (bookingId, reason) => 
      this.client.patch(`/hotels/booking/cancel/${bookingId}`, { cancellation_reason: reason }),
  };

  // ============= REVIEWS =============
  reviews = {
    getAll: () => this.client.get('/hotels/reviews/all-reviews'),
    
    getById: (reviewId) => this.client.get(`/hotels/reviews/${reviewId}`),
    
    getByHotel: (hotelId) => this.client.get(`/hotels/reviews/${hotelId}`),
    
    create: (hotelId, data) => {
      const formData = new FormData();
      formData.append('rating', data.rating);
      formData.append('review_text', data.review_text);
      if (data.media) {
        formData.append('media', data.media);
      }
      return this.client.post(`/hotels/reviews/create/${hotelId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    update: (reviewId, data) => 
      this.client.patch(`/hotels/reviews/update/${reviewId}`, data),
    
    delete: (reviewId) => 
      this.client.delete(`/hotels/reviews/delete/${reviewId}`),
  };

  // ============= MEDIA =============
  media = {
    getByHotel: (hotelId) => 
      this.client.get(`/hotels/Media/hotel/${hotelId}`),
    
    upload: (hotelId, file, mediaType, mediaCategory) => {
      const formData = new FormData();
      formData.append('media', file);
      formData.append('media_type', mediaType);
      formData.append('media_category', mediaCategory);
      return this.client.post(`/hotels/Media/upload/${hotelId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    update: (mediaId, data) => 
      this.client.patch(`/hotels/Media/update/${mediaId}`, data),
    
    delete: (mediaId) => 
      this.client.delete(`/hotels/Media/delete/${mediaId}`),
  };

  // ============= POSTS =============
  posts = {
    getAll: () => this.client.get('/hotels/posts/All-hotels'),
    
    getByHotel: (hotelId) => this.client.get(`/hotels/posts/${hotelId}`),
    
    upload: (hotelId, data) => {
      const formData = new FormData();
      formData.append('caption', data.caption);
      formData.append('postDescription', data.postDescription);
      if (data.media) {
        formData.append('media', data.media);
      }
      return this.client.post(`/hotels/posts/upload/${hotelId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    update: (postId, data) => 
      this.client.patch(`/hotels/posts/update/${postId}`, data),
    
    delete: (postId) => 
      this.client.delete(`/hotels/posts/delete/${postId}`),
  };

  // ============= VIDEOS =============
  videos = {
    getAll: () => this.client.get('/content/videos/all'),
    
    getStreamUrl: (videoId) => `${API_BASE_URL}/content/videos/stream/${videoId}`,
    
    getStreamFromS3: (videoUrl) => `${API_BASE_URL}/content/videos/stream/${videoUrl}`,
    
    upload: (hotelId, videoFile, thumbnailFile, title, description) => {
      const formData = new FormData();
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      formData.append('title', title);
      formData.append('description', description);
      return this.client.post(`/content/videos/upload/${hotelId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    
    update: (videoId, data) => 
      this.client.patch(`/content/videos/update/${videoId}`, data),
    
    delete: (videoId) => 
      this.client.delete(`/content/videos/delete/${videoId}`),
    
    incrementViews: (videoId) => 
      this.client.patch(`/content/videos/${videoId}/views`),
  };

  // ============= COMPLAINTS =============
  complaints = {
    send: (data) => this.client.post('/complaints/send', data),
    
    sendGlitch: (data) => this.client.post('/complaints/glitch/send', data),
  };


  // ============= TOURISM =============
  tourism = {
    getEntries: (category) => {
      const params = category ? `?category=${category}` : '';
      return this.client.get(`/tourism/entries${params}`);
    },

    generateItinerary: (preferences) =>
      this.client.post('/tourism/itinerary/generate', preferences, {
        timeout: ITINERARY_TIMEOUT_MS,
      }),

    getSavedItineraries: () =>
      this.client.get('/tourism/itinerary/saved'),
  };
  // ============= INVITATIONS =============
  invitations = {
    send: (data) => this.client.post('/invitation', data),
  };
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
