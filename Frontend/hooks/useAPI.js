import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// ============= Generic API Hook =============
export const useAPI = (apiFunction, params = null, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (customParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunction(customParams || params);
      setData(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// ============= Hotels Hook =============
export const useHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.hotels.getAll();
      setHotels(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  const getHotelById = async (hotelId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.hotels.getById(hotelId);
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch hotel');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return { hotels, loading, error, refetch: fetchHotels, getHotelById };
};

// ============= Bookings Hook =============
export const useBookings = (userId) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.bookings.getUserBookings(userId);
      setBookings(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (hotelId, bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.bookings.create(hotelId, bookingData);
      await fetchBookings(); // Refresh list
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.bookings.cancel(bookingId, reason);
      await fetchBookings(); // Refresh list
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  return { 
    bookings, 
    loading, 
    error, 
    refetch: fetchBookings,
    createBooking,
    cancelBooking,
  };
};

// ============= Reviews Hook =============
export const useReviews = (hotelId = null) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = hotelId
        ? await apiService.reviews.getByHotel(hotelId)
        : await apiService.reviews.getAll();
      setReviews(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (hotelId, reviewData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.reviews.create(hotelId, reviewData);
      await fetchReviews(); // Refresh list
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (reviewId, reviewData) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.reviews.update(reviewId, reviewData);
      await fetchReviews(); // Refresh list
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.reviews.delete(reviewId);
      await fetchReviews(); // Refresh list
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [hotelId]);

  return { 
    reviews, 
    loading, 
    error, 
    refetch: fetchReviews,
    submitReview,
    updateReview,
    deleteReview,
  };
};

// ============= Hot Deals Hook =============
export const useHotDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.discounts.getHotDeals();
      setDeals(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch hot deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return { deals, loading, error, refetch: fetchDeals };
};

// ============= Videos Hook =============
export const useVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.videos.getAll();
      setVideos(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (videoId) => {
    try {
      await apiService.videos.incrementViews(videoId);
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return { videos, loading, error, refetch: fetchVideos, incrementViews };
};

// ============= Room Availability Hook =============
export const useRoomAvailability = () => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAvailability = async (roomTypeId, dates) => {
    setLoading(true);
    setError(null);
    setAvailability(null);
    try {
      const response = await apiService.pricing.checkAvailability(roomTypeId, dates);
      setAvailability(response.data.data);
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check availability');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  return { availability, loading, error, checkAvailability };
};

// ============= Rooms Hook =============
export const useRooms = (hotelId) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    if (!hotelId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.rooms.getByHotelId(hotelId);
      setRooms(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const getRoomDetails = async (roomTypeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.rooms.getSpecific(hotelId, roomTypeId);
      return { success: true, data: response.data.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch room details');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  return { rooms, loading, error, refetch: fetchRooms, getRoomDetails };
};

// ============= Media Hook =============
export const useMedia = (hotelId) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMedia = async () => {
    if (!hotelId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.media.getByHotel(hotelId);
      setMedia(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async (file, mediaType, mediaCategory) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.media.upload(hotelId, file, mediaType, mediaCategory);
      await fetchMedia(); // Refresh list
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload media');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [hotelId]);

  return { media, loading, error, refetch: fetchMedia, uploadMedia };
};

// ============= Posts Hook =============
export const usePosts = (hotelId = null) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = hotelId
        ? await apiService.posts.getByHotel(hotelId)
        : await apiService.posts.getAll();
      setPosts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [hotelId]);

  return { posts, loading, error, refetch: fetchPosts };
};